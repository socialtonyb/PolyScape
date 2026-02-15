import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lmsrPrices } from "@/lib/lmsr";
import { TradeWidget } from "@/components/trade-widget";

export default async function MarketPage({ params }: { params: { slug: string } }) {
  const market = await prisma.market.findUnique({ where: { slug: params.slug }, include: { outcomes: { orderBy: { index: "asc" } } } });
  if (!market) return notFound();
  const prices = lmsrPrices(market.outcomes.map(o => o.qShares), market.liquidityB);
  return <div className="grid gap-4 md:grid-cols-2"><div className="card"><h1 className="text-2xl">{market.title}</h1><p>{market.description}</p><div className="mt-4 space-y-2">{market.outcomes.map((o,i)=><div key={o.id} className="flex justify-between"><span>{o.title}</span><span>{(prices[i]*100).toFixed(2)}%</span></div>)}</div></div><TradeWidget marketId={market.id} outcomes={market.outcomes} /></div>;
}
