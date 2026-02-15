import { describe, expect, it } from "vitest";
import { levelForXp, xpForLevel } from "@/lib/skills";

describe("skill curve", () => {
  it("known levels are increasing", () => {
    expect(xpForLevel(2)).toBeGreaterThan(0n);
    expect(xpForLevel(10)).toBeGreaterThan(xpForLevel(9));
  });

  it("levelForXp matches boundary", () => {
    const xp = xpForLevel(20);
    expect(levelForXp(xp)).toBe(20);
  });
});
