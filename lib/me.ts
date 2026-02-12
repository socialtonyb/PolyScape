import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error("unauthorized");
  return { userId, role: (session?.user as any)?.role as string | undefined };
}

export async function requireAdmin() {
  const me = await requireUser();
  if (me.role !== "ADMIN") throw new Error("forbidden");
  return me;
}
