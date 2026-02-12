import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MarketsPage() {
  const markets = await prisma.market.findMany({ include: { outcomes: true }, orderBy: { createdAt: "desc" } });
  return <div><h1 className="mb-4 text-2xl">Markets</h1><div className="space-y-3">{markets.map(m => <Link key={m.id} href={`/markets/${m.slug}`} className="card block"><p>{m.title}</p><p className="text-xs">{m.status} · {m.category}</p></Link>)}</div></div>;
}
