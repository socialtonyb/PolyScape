import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/me";
import { levelForXp, xpForLevel } from "@/lib/skills";

export async function GET() {
  const { userId } = await requireUser();
  const skill = await prisma.userSkill.findUnique({ where: { userId_type: { userId, type: "PREDICTION" } } });
  const xp = skill?.xp ?? 0n;
  const level = levelForXp(xp);
  const nextLevelXp = level >= 99 ? xp : xpForLevel(level + 1);
  const currentLevelXp = xpForLevel(level);
  return NextResponse.json({ xp: xp.toString(), level, currentLevelXp: currentLevelXp.toString(), nextLevelXp: nextLevelXp.toString() });
}
