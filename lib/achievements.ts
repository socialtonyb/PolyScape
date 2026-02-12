import { prisma } from "@/lib/prisma";

async function complete(userId: string, slug: string) {
  const ua = await prisma.userAchievement.findFirst({
    where: { userId, achievement: { slug }, completedAt: null },
    include: { achievement: true }
  });
  if (!ua) return;

  await prisma.$transaction(async (tx) => {
    await tx.userAchievement.update({ where: { id: ua.id }, data: { completedAt: new Date() } });
    await tx.wallet.update({ where: { userId }, data: { balanceGp: { increment: ua.achievement.rewardGp } } });
    await tx.userSkill.update({ where: { userId_type: { userId, type: "PREDICTION" } }, data: { xp: { increment: ua.achievement.rewardXp } } });
    await tx.transaction.create({
      data: { userId, type: "ACHIEVEMENT", amountGp: ua.achievement.rewardGp, meta: { achievementSlug: slug } }
    });
  });
}

export async function evaluateAchievements(userId: string) {
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  if (!stats) return;
  if (stats.tradesCount >= 1) await complete(userId, "first-trade");
  if (stats.tradesCount >= 10) await complete(userId, "getting-started");
  if (stats.randomEventsClaimed >= 1) await complete(userId, "friendly-stranger");
  if (stats.volumeGp >= 100_000n) await complete(userId, "big-spender");
  if (stats.wins >= 10) await complete(userId, "solid-predictor");
  if (stats.bestStreak >= 5) await complete(userId, "hot-streak");
  if (stats.randomEventsClaimed >= 5) await complete(userId, "random-event-hunter");
}
