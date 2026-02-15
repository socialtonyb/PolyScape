import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function WalletPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return <p>Sign in required.</p>;
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const txs = await prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  return <div><h1 className="mb-3 text-2xl">Wallet</h1><div className="card mb-4">Balance: {wallet?.balanceGp.toString()} GP</div><div className="space-y-2">{txs.map(tx => <div key={tx.id} className="card text-sm">{tx.type} {tx.amountGp.toString()} GP</div>)}</div></div>;
}
