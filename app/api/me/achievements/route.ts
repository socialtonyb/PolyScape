import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/me";

export async function GET() {
  const { userId } = await requireUser();
  const achievements = await prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } });
  return NextResponse.json(achievements);
}
