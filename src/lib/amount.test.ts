import { describe, expect, it } from "vitest";
import { amountToCents, sanitizeAmount } from "./amount";

describe("amount parsing", () => {
  it("strips junk, keeps one dot and two decimals", () => {
    expect(sanitizeAmount("$1,2a3")).toBe("123");
    expect(sanitizeAmount("12.345")).toBe("12.34");
    expect(sanitizeAmount("1.2.3")).toBe("1.23");
    expect(sanitizeAmount("12345678")).toBe("123456");
  });

  it("converts to integer cents without float drift", () => {
    expect(amountToCents("12.3")).toBe(1230);
    expect(amountToCents("0.07")).toBe(7);
    expect(amountToCents("19.99")).toBe(1999);
    expect(amountToCents("1000")).toBe(100_000);
    expect(amountToCents("")).toBe(0);
  });
});
