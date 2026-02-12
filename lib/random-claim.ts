import { prisma } from "@/lib/prisma";
import { evaluateAchievements } from "@/lib/achievements";

export async function claimRandomEvent(userId: string, eventId: string) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.randomEvent.findUnique({ where: { id: eventId } });
    if (!event || event.userId !== userId) throw new Error("not found");
    if (event.claimedAt) throw new Error("already claimed");
    if (event.expiresAt < new Date()) throw new Error("expired");

    await tx.randomEvent.update({ where: { id: eventId }, data: { claimedAt: new Date() } });
    await tx.wallet.update({ where: { userId }, data: { balanceGp: { increment: event.rewardGp } } });
    await tx.userSkill.update({ where: { userId_type: { userId, type: "PREDICTION" } }, data: { xp: { increment: event.rewardXp } } });
    await tx.userStats.update({ where: { userId }, data: { randomEventsClaimed: { increment: 1 }, lastRandomEventAt: new Date() } });
    await tx.transaction.create({ data: { userId, type: "RANDOM_EVENT", amountGp: event.rewardGp, meta: { eventId } } });
    return event;
  }).then(async (event) => {
    await evaluateAchievements(userId);
    return event;
  });
}
