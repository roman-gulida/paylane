import { describe, expect, it } from "vitest";
import { calculateFeeCents, calculateSettlement, feeRuleLabel } from "./fees";

describe("feeRuleLabel", () => {
  it("describes the configured fee for display", () => {
    expect(feeRuleLabel()).toBe("2% + $1.00");
  });
});

describe("calculateSettlement (2.00% + $1.00)", () => {
  it("settles $100.00 as $3.00 fee, $97.00 net, 97 USDC", () => {
    expect(calculateSettlement(10_000)).toEqual({
      grossCents: 10_000,
      feeCents: 300,
      netCents: 9_700,
      usdcMicro: 97_000_000,
    });
  });

  it("rounds the percentage part to the nearest cent", () => {
    // 2% of $123.45 = $2.469 => $2.47, plus $1.00
    expect(calculateFeeCents(12_345)).toBe(347);
  });

  it("charges nothing on a zero payment", () => {
    expect(calculateSettlement(0)).toEqual({
      grossCents: 0,
      feeCents: 0,
      netCents: 0,
      usdcMicro: 0,
    });
  });

  it("never charges more than the payment itself", () => {
    const s = calculateSettlement(100); // $1.00 payment, $1.02 fee before the cap
    expect(s.feeCents).toBe(100);
    expect(s.netCents).toBe(0);
  });

  it("always satisfies fee + net = gross", () => {
    for (const gross of [0, 1, 99, 500, 1_999, 10_000, 123_456, 9_999_999]) {
      const s = calculateSettlement(gross);
      expect(s.feeCents + s.netCents).toBe(gross);
    }
  });

  it("rejects negative and fractional amounts", () => {
    expect(() => calculateFeeCents(-1)).toThrow(RangeError);
    expect(() => calculateFeeCents(10.5)).toThrow(RangeError);
  });
});
