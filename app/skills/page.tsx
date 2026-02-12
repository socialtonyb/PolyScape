import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { levelForXp, xpForLevel } from "@/lib/skills";

export default async function SkillsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return <p>Sign in required.</p>;
  const skill = await prisma.userSkill.findUnique({ where: { userId_type: { userId, type: "PREDICTION" } } });
  const xp = skill?.xp ?? 0n;
  const level = levelForXp(xp);
  const start = xpForLevel(level); const end = level >= 99 ? xp : xpForLevel(level+1);
  const pct = end===start ? 100 : Number((xp-start)*100n/(end-start));
  return <div className="card"><h1 className="text-2xl">Prediction Skill</h1><p>Level {level}</p><p>{xp.toString()} XP</p><div className="mt-2 h-3 w-full rounded bg-slate-800"><div className="h-3 rounded bg-emerald-500" style={{width:`${pct}%`}} /></div></div>;
}
