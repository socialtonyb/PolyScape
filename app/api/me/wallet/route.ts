import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/me";

export async function GET() {
  const { userId } = await requireUser();
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const txs = await prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ wallet, txs });
}
