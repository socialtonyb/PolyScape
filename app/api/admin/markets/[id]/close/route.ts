import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/me";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await requireAdmin();
  await prisma.market.update({ where: { id: params.id }, data: { status: "CLOSED" } });
  await prisma.adminAuditLog.create({ data: { adminId: userId, action: "CLOSE_MARKET", meta: { marketId: params.id } } });
  return NextResponse.json({ ok: true });
}
