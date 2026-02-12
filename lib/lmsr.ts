export function logSumExp(values: number[]): number {
  const max = Math.max(...values);
  return max + Math.log(values.reduce((acc, value) => acc + Math.exp(value - max), 0));
}

export function lmsrCost(qShares: number[], b: number): number {
  if (b <= 0) throw new Error("liquidity parameter b must be > 0");
  return b * logSumExp(qShares.map((q) => q / b));
}

export function lmsrPrices(qShares: number[], b: number): number[] {
  const scaled = qShares.map((q) => q / b);
  const lse = logSumExp(scaled);
  return scaled.map((v) => Math.exp(v - lse));
}

export function buyCost(qBefore: number[], outcomeIndex: number, shares: number, b: number): number {
  const qAfter = [...qBefore];
  qAfter[outcomeIndex] += shares;
  return lmsrCost(qAfter, b) - lmsrCost(qBefore, b);
}

export function sellRefund(qBefore: number[], outcomeIndex: number, shares: number, b: number): number {
  const qAfter = [...qBefore];
  qAfter[outcomeIndex] -= shares;
  return lmsrCost(qBefore, b) - lmsrCost(qAfter, b);
}
