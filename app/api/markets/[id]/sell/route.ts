import { NextResponse } from "next/server";
import { z } from "zod";
import { executeTrade } from "@/lib/trading";
import { requireUser } from "@/lib/me";

const schema = z.object({ outcomeId: z.string(), shares: z.number().int().positive() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireUser();
    const body = schema.parse(await req.json());
    const trade = await executeTrade({ userId, marketId: params.id, outcomeId: body.outcomeId, shares: body.shares, side: "SELL" });
    return NextResponse.json(trade);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
