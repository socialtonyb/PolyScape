import { MarketStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buyCost, sellRefund } from "@/lib/lmsr";
import { tradeXp, levelForXp } from "@/lib/skills";
import { maybeSpawnRandomEvent } from "@/lib/random-events";
import { evaluateAchievements } from "@/lib/achievements";

const toGp = (amount: number) => BigInt(Math.ceil(amount));

export async function executeTrade(input: { userId: string; marketId: string; outcomeId: string; shares: number; side: "BUY" | "SELL"; }) {
  if (input.shares <= 0) throw new Error("shares must be > 0");
  const result = await prisma.$transaction(async (tx) => {
    const market = await tx.market.findUnique({ where: { id: input.marketId }, include: { outcomes: { orderBy: { index: "asc" } } } });
    if (!market) throw new Error("market not found");
    if (market.status !== MarketStatus.OPEN || market.closeTime <= new Date()) throw new Error("market closed");

    const outcomeIndex = market.outcomes.findIndex((o) => o.id === input.outcomeId);
    if (outcomeIndex < 0) throw new Error("invalid outcome");
    const q = market.outcomes.map((o) => o.qShares);

    const amount = input.side === "BUY"
      ? toGp(buyCost(q, outcomeIndex, input.shares, market.liquidityB))
      : toGp(sellRefund(q, outcomeIndex, input.shares, market.liquidityB));

    const wallet = await tx.wallet.findUnique({ where: { userId: input.userId } });
    if (!wallet) throw new Error("wallet missing");
    const position = await tx.position.upsert({
      where: { userId_outcomeId: { userId: input.userId, outcomeId: input.outcomeId } },
      create: { userId: input.userId, outcomeId: input.outcomeId, shares: 0 },
      update: {}
    });

    if (input.side === "BUY" && wallet.balanceGp < amount) throw new Error("insufficient GP");
    if (input.side === "SELL" && position.shares < input.shares) throw new Error("insufficient shares");

    const walletDelta = input.side === "BUY" ? -amount : amount;
    await tx.wallet.update({ where: { userId: input.userId }, data: { balanceGp: { increment: walletDelta } } });
    await tx.position.update({ where: { id: position.id }, data: { shares: { increment: input.side === "BUY" ? input.shares : -input.shares } } });
    await tx.outcome.update({ where: { id: input.outcomeId }, data: { qShares: { increment: input.side === "BUY" ? input.shares : -input.shares } } });

    await tx.trade.create({ data: { userId: input.userId, marketId: input.marketId, outcomeId: input.outcomeId, type: input.side, shares: input.shares, costGp: amount, feeGp: 0n } });
    await tx.transaction.create({ data: { userId: input.userId, type: input.side === "BUY" ? "TRADE_BUY" : "TRADE_SELL", amountGp: walletDelta, meta: { marketId: input.marketId, outcomeId: input.outcomeId, shares: input.shares } } });

    const tradedMarkets = await tx.trade.groupBy({ by: ["marketId"], where: { userId: input.userId } });
    const volumeAbs = amount < 0n ? -amount : amount;
    await tx.userStats.update({ where: { userId: input.userId }, data: { tradesCount: { increment: 1 }, volumeGp: { increment: volumeAbs }, marketsTradedCount: tradedMarkets.length } });

    const xpGain = tradeXp(amount);
    const skill = await tx.userSkill.update({ where: { userId_type: { userId: input.userId, type: "PREDICTION" } }, data: { xp: { increment: xpGain } } });

    return { gpAmount: amount, skillXp: skill.xp };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  await evaluateAchievements(input.userId);
  const event = await maybeSpawnRandomEvent(input.userId, levelForXp(result.skillXp));
  return { ...result, event };
}

export async function resolveMarket(input: { marketId: string; winningOutcomeId: string; adminId: string; note?: string }) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.marketResolution.findUnique({ where: { marketId: input.marketId } });
    if (existing) return;
    const market = await tx.market.findUnique({ where: { id: input.marketId }, include: { outcomes: true } });
    if (!market) throw new Error("market missing");

    await tx.marketResolution.create({ data: { marketId: input.marketId, winningOutcomeId: input.winningOutcomeId, resolvedById: input.adminId, note: input.note } });
    await tx.market.update({ where: { id: input.marketId }, data: { status: "RESOLVED" } });

    const users = await tx.position.findMany({ where: { outcome: { marketId: input.marketId } }, include: { outcome: true } });
    const grouped = new Map<string, { winShares: number; loseShares: number }>();
    for (const pos of users) {
      const entry = grouped.get(pos.userId) ?? { winShares: 0, loseShares: 0 };
      if (pos.outcomeId === input.winningOutcomeId) entry.winShares += pos.shares; else entry.loseShares += pos.shares;
      grouped.set(pos.userId, entry);
    }

    for (const [userId, rec] of grouped.entries()) {
      if (rec.winShares > 0) {
        const payout = BigInt(rec.winShares);
        await tx.wallet.update({ where: { userId }, data: { balanceGp: { increment: payout } } });
        await tx.transaction.create({ data: { userId, type: "REWARD_PAYOUT", amountGp: payout, meta: { marketId: input.marketId } } });
        await tx.userSkill.update({ where: { userId_type: { userId, type: "PREDICTION" } }, data: { xp: { increment: 50n } } });
        await tx.userStats.update({ where: { userId }, data: { wins: { increment: 1 }, currentStreak: { increment: 1 } } });
      } else if (rec.loseShares > 0) {
        await tx.userStats.update({ where: { userId }, data: { losses: { increment: 1 }, currentStreak: 0 } });
      }
      const stats = await tx.userStats.findUnique({ where: { userId } });
      if (stats && stats.currentStreak > stats.bestStreak) {
        await tx.userStats.update({ where: { userId }, data: { bestStreak: stats.currentStreak } });
      }
    }

    await tx.adminAuditLog.create({ data: { adminId: input.adminId, action: "RESOLVE_MARKET", meta: { ...input } } });
  });
}
