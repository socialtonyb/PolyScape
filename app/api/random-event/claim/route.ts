import { NextResponse } from "next/server";
import { z } from "zod";
import { claimRandomEvent } from "@/lib/random-claim";
import { requireUser } from "@/lib/me";

const schema = z.object({ eventId: z.string() });

export async function POST(req: Request) {
  try {
    const { userId } = await requireUser();
    const { eventId } = schema.parse(await req.json());
    const result = await claimRandomEvent(userId, eventId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
