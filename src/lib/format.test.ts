import { describe, expect, it } from "vitest";
import {
  describeMethod,
  formatCardNumber,
  formatExpiry,
  formatUSD,
  formatUSDC,
  maskCard,
} from "./format";

describe("money formatting", () => {
  it("formats cents as USD with grouping and two decimals", () => {
    expect(formatUSD(0)).toBe("$0.00");
    expect(formatUSD(5)).toBe("$0.05");
    expect(formatUSD(12_345)).toBe("$123.45");
    expect(formatUSD(123_456_789)).toBe("$1,234,567.89");
  });

  it("formats micro-USDC with two decimals and the token name", () => {
    expect(formatUSDC(0)).toBe("0.00 USDC");
    expect(formatUSDC(97_000_000)).toBe("97.00 USDC");
    expect(formatUSDC(1_234_560_000)).toBe("1,234.56 USDC");
  });
});

describe("card formatting", () => {
  it("masks a card with its brand", () => {
    expect(maskCard("visa", "4242")).toBe("Visa •••• 4242");
    expect(maskCard("amex", "0005")).toBe("Amex •••• 0005");
  });

  it("describes wallets with the card behind them", () => {
    expect(describeMethod("card", "visa", "4242")).toBe("Visa •••• 4242");
    expect(describeMethod("apple_pay", "visa", "4242")).toBe(
      "Apple Pay · •••• 4242",
    );
    expect(describeMethod("google_pay", "mastercard", "1111")).toBe(
      "Google Pay · •••• 1111",
    );
  });

  it("groups card digits in fours and ignores non-digits", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("4242-4242 42")).toBe("4242 4242 42");
    expect(formatCardNumber("42424242424242429999")).toBe(
      "4242 4242 4242 4242",
    );
  });

  it("formats expiry as MM / YY", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12");
    expect(formatExpiry("1228")).toBe("12 / 28");
    expect(formatExpiry("12/28")).toBe("12 / 28");
  });
});
