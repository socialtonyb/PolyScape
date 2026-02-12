import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/me";
import { resolveMarket } from "@/lib/trading";

const schema = z.object({ winningOutcomeId: z.string(), note: z.string().optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAdmin();
    const payload = schema.parse(await req.json());
    await resolveMarket({ marketId: params.id, adminId: userId, ...payload });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
