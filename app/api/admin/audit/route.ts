import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/me";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const logs = await prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { admin: true } });
  return NextResponse.json(logs);
}
