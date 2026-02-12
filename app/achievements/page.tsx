import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AchievementsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return <p>Sign in required.</p>;
  const rows = await prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true }, orderBy: { achievement: { tier: "asc" } } });
  return <div><h1 className="mb-4 text-2xl">Achievement Diary</h1><div className="space-y-2">{rows.map(r => <div key={r.id} className="card"><p>{r.achievement.tier} · {r.achievement.title}</p><p className="text-sm">{r.completedAt ? "Completed" : "Incomplete"}</p></div>)}</div></div>;
}
