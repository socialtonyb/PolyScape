import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/me";

export async function GET() {
  const { userId } = await requireUser();
  const positions = await prisma.position.findMany({ where: { userId, shares: { gt: 0 } }, include: { outcome: { include: { market: true } } } });
  return NextResponse.json(positions);
}
