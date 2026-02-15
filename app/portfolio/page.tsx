import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function PortfolioPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return <p>Sign in required.</p>;
  const positions = await prisma.position.findMany({ where: { userId, shares: { gt: 0 } }, include: { outcome: { include: { market: true } } } });
  return <div><h1 className="mb-4 text-2xl">Portfolio</h1><div className="space-y-2">{positions.map(p => <div key={p.id} className="card"><p>{p.outcome.market.title} · {p.outcome.title}</p><p>{p.shares} shares</p></div>)}</div></div>;
}
