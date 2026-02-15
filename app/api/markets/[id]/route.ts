import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const market = await prisma.market.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }]
    },
    include: { outcomes: true }
  });
  if (!market) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(market);
}
