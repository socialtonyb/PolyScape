import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const achievements = [
  { slug: "first-trade", title: "First Trade", description: "Place 1 trade", tier: "EASY", rewardGp: 500n, rewardXp: 50n, criteria: { tradesCount: 1 } },
  { slug: "getting-started", title: "Getting Started", description: "Place 10 trades", tier: "EASY", rewardGp: 1000n, rewardXp: 150n, criteria: { tradesCount: 10 } },
  { slug: "friendly-stranger", title: "Friendly Stranger", description: "Claim 1 random event", tier: "EASY", rewardGp: 500n, rewardXp: 100n, criteria: { randomEventsClaimed: 1 } },
  { slug: "big-spender", title: "Big Spender", description: "Trade 100,000 GP volume", tier: "MEDIUM", rewardGp: 2500n, rewardXp: 400n, criteria: { volumeGp: "100000" } },
  { slug: "solid-predictor", title: "Solid Predictor", description: "10 resolved wins", tier: "MEDIUM", rewardGp: 2000n, rewardXp: 500n, criteria: { wins: 10 } },
  { slug: "hot-streak", title: "Hot Streak", description: "Best win streak of 5", tier: "HARD", rewardGp: 5000n, rewardXp: 1200n, criteria: { bestStreak: 5 } },
  { slug: "random-event-hunter", title: "Random Event Hunter", description: "Claim 5 random events", tier: "HARD", rewardGp: 3000n, rewardXp: 1000n, criteria: { randomEventsClaimed: 5 } }
];

async function ensureUser(email: string, role: "ADMIN" | "USER") {
  const hashedPassword = await bcrypt.hash(role === "ADMIN" ? "admin123" : "user123", 10);
  const user = await prisma.user.upsert({ where: { email }, update: { role, hashedPassword }, create: { email, role, hashedPassword, name: role } });
  await prisma.wallet.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, balanceGp: 10_000n } });
  await prisma.userStats.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
  await prisma.userSkill.upsert({ where: { userId_type: { userId: user.id, type: "PREDICTION" } }, update: {}, create: { userId: user.id, type: "PREDICTION", xp: 0n } });
  return user;
}

async function main() {
  const admin = await ensureUser("admin@polyscape.local", "ADMIN");
  const user = await ensureUser("user@polyscape.local", "USER");

  for (const ach of achievements as any[]) {
    const a = await prisma.achievement.upsert({ where: { slug: ach.slug }, update: ach, create: ach });
    for (const u of [admin, user]) {
      await prisma.userAchievement.upsert({ where: { userId_achievementId: { userId: u.id, achievementId: a.id } }, update: {}, create: { userId: u.id, achievementId: a.id, progress: {} } });
    }
  }

  const mkts = [
    { slug: "osrs-new-skill-2026", title: "Will OSRS announce a new skill in 2026?", category: "OSRS", description: "Official Jagex announcement", outcomes: ["YES", "NO"] },
    { slug: "twisted-bow-price", title: "Will Twisted Bow exceed 1.7b GP this month?", category: "Economy", description: "GE peak price", outcomes: ["YES", "NO"] },
    { slug: "raid-completion", title: "Will next raid world first be under 24h?", category: "PvM", description: "From release time", outcomes: ["YES", "NO"] }
  ];

  for (const m of mkts) {
    await prisma.market.upsert({
      where: { slug: m.slug },
      update: {},
      create: {
        ...m,
        liquidityB: 100,
        closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        outcomes: { create: m.outcomes.map((o, i) => ({ title: o, index: i })) }
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
