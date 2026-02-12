import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return <p>Admins only.</p>;
  const markets = await prisma.market.findMany({ include: { outcomes: true }, orderBy: { createdAt: "desc" } });
  const audit = await prisma.adminAuditLog.findMany({ take: 20, orderBy: { createdAt: "desc" } });
  return <div className="space-y-4"><h1 className="text-2xl">Admin</h1><div className="card"><p>Use API routes to create/close/resolve markets.</p></div><div className="space-y-2">{markets.map(m=><div key={m.id} className="card">{m.title} ({m.status})</div>)}</div><div>{audit.map(a=><div key={a.id} className="text-xs">{a.action}</div>)}</div></div>;
}
