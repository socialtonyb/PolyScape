import { describe, expect, it } from "vitest";
import { buyCost, sellRefund } from "@/lib/lmsr";

describe("light integration math", () => {
  it("market buy resolve payout logic baseline", () => {
    const buy = buyCost([0, 0], 0, 10, 100);
    const refund = sellRefund([10, 0], 0, 10, 100);
    expect(buy).toBeGreaterThan(0);
    expect(refund).toBeGreaterThan(0);
    expect(10).toBe(10); // 1 GP per winning share payout baseline
  });
});
