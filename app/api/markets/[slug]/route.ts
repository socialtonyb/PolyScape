import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const market = await prisma.market.findUnique({ where: { slug: params.slug }, include: { outcomes: true } });
  if (!market) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(market);
}
