import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const markets = await prisma.market.findMany({ take: 6, orderBy: { createdAt: "desc" } });
  return <div><h1 className="mb-4 text-3xl font-bold">PolyScape</h1><div className="grid gap-3 md:grid-cols-2">{markets.map(m => <Link key={m.id} href={`/markets/${m.slug}`} className="card"><p className="font-semibold">{m.title}</p><p className="text-xs text-slate-400">{m.category}</p></Link>)}</div></div>;
}
