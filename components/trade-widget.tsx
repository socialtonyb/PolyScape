"use client";

import { useState } from "react";

export function TradeWidget({ marketId, outcomes }: { marketId: string; outcomes: { id: string; title: string; qShares: number }[] }) {
  const [outcomeId, setOutcomeId] = useState(outcomes[0]?.id);
  const [shares, setShares] = useState(1);
  const [message, setMessage] = useState("");

  async function submit(side: "buy" | "sell") {
    const res = await fetch(`/api/markets/${marketId}/${side}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outcomeId, shares }) });
    const body = await res.json();
    setMessage(res.ok ? `Success. GP moved: ${body.gpAmount}` : body.error);
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Trade</h3>
      <select className="w-full rounded bg-slate-800 p-2" value={outcomeId} onChange={(e) => setOutcomeId(e.target.value)}>
        {outcomes.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
      </select>
      <input className="w-full rounded bg-slate-800 p-2" type="number" min={1} value={shares} onChange={(e) => setShares(Number(e.target.value))} />
      <div className="flex gap-2"><button className="btn" onClick={() => submit("buy")}>Buy</button><button className="rounded-md bg-sky-700 px-3 py-2" onClick={() => submit("sell")}>Sell (0% fee)</button></div>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
