import { describe, expect, it } from "vitest";
import { buyCost, lmsrPrices, sellRefund } from "@/lib/lmsr";

describe("lmsr", () => {
  it("prices sum to 1 and monotonic", () => {
    const p1 = lmsrPrices([0, 0], 100);
    const p2 = lmsrPrices([50, 0], 100);
    expect(Math.abs(p1[0] + p1[1] - 1)).toBeLessThan(1e-9);
    expect(p2[0]).toBeGreaterThan(p1[0]);
  });

  it("buy then sell is nearly symmetric", () => {
    const q = [10, 20];
    const buy = buyCost(q, 0, 5, 100);
    const after = [15, 20];
    const refund = sellRefund(after, 0, 5, 100);
    expect(Math.abs(buy - refund)).toBeLessThan(1);
  });
});
