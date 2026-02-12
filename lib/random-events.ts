import { RandomEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RANDOM_EVENT_CHANCE, RANDOM_EVENT_COOLDOWN_MS, RANDOM_EVENT_EXPIRY_MS } from "@/lib/constants";

type RewardRange = { minGp: number; maxGp: number; minXp: number; maxXp: number };
const rewardMap: Record<RandomEventType, RewardRange> = {
  GENIE: { minGp: 250, maxGp: 900, minXp: 30, maxXp: 120 },
  LAMP: { minGp: 300, maxGp: 1000, minXp: 40, maxXp: 130 },
  DWARF: { minGp: 200, maxGp: 700, minXp: 25, maxXp: 110 },
  JEKYLL: { minGp: 350, maxGp: 1200, minXp: 50, maxXp: 160 }
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export async function maybeSpawnRandomEvent(userId: string, level: number) {
  if (Math.random() > RANDOM_EVENT_CHANCE) return null;
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  if (stats?.lastRandomEventAt && Date.now() - stats.lastRandomEventAt.getTime() < RANDOM_EVENT_COOLDOWN_MS) return null;

  const types = Object.values(RandomEventType);
  const type = types[Math.floor(Math.random() * types.length)];
  const scaling = clamp(level / 99, 0, 0.25);
  const range = rewardMap[type];
  const gp = Math.floor(range.minGp + Math.random() * (range.maxGp - range.minGp)) * (1 + scaling);
  const xp = Math.floor(range.minXp + Math.random() * (range.maxXp - range.minXp)) * (1 + scaling);
  const now = new Date();

  return prisma.randomEvent.create({
    data: {
      userId,
      type,
      rewardGp: BigInt(Math.floor(gp)),
      rewardXp: BigInt(Math.floor(xp)),
      expiresAt: new Date(now.getTime() + RANDOM_EVENT_EXPIRY_MS)
    }
  });
}
