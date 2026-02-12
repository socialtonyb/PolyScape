import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/me";

const schema = z.object({
  title: z.string(), description: z.string(), category: z.string(), slug: z.string(), closeTime: z.string(), liquidityB: z.number().int().positive(), outcomes: z.array(z.string()).min(2)
});

export async function POST(req: Request) {
  try {
    const { userId } = await requireAdmin();
    const body = schema.parse(await req.json());
    const market = await prisma.market.create({
      data: {
        title: body.title, description: body.description, category: body.category, slug: body.slug, closeTime: new Date(body.closeTime), liquidityB: body.liquidityB,
        outcomes: { create: body.outcomes.map((o, index) => ({ title: o, index })) }
      }
    });
    await prisma.adminAuditLog.create({ data: { adminId: userId, action: "CREATE_MARKET", meta: { marketId: market.id } } });
    return NextResponse.json(market);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
