const MAX_LEVEL = 99;

export function xpForLevel(level: number): bigint {
  if (level <= 1) return 0n;
  let points = 0;
  for (let lvl = 1; lvl < level; lvl += 1) {
    points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
  }
  return BigInt(Math.floor(points / 4));
}

export function levelForXp(xp: bigint): number {
  for (let level = MAX_LEVEL; level >= 1; level -= 1) {
    if (xp >= xpForLevel(level)) return level;
  }
  return 1;
}

export function tradeXp(gpAmount: bigint): bigint {
  const absolute = gpAmount < 0n ? -gpAmount : gpAmount;
  return 5n + absolute / 100n;
}
