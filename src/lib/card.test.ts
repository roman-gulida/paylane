import { describe, expect, it } from "vitest";
import {
  detectBrand,
  expiryForApi,
  passesLuhn,
  validateCardNumber,
  validateCvc,
  validateEmail,
  validateExpiry,
} from "./card";

const NOW = new Date("2026-10-12T10:00:00Z");

describe("card brand and checksum", () => {
  it("detects brands from the first digits", () => {
    expect(detectBrand("4242")).toBe("visa");
    expect(detectBrand("5555")).toBe("mastercard");
    expect(detectBrand("2221")).toBe("mastercard");
    expect(detectBrand("3782")).toBe("amex");
    expect(detectBrand("9")).toBeNull();
    expect(detectBrand("")).toBeNull();
  });

  it("accepts the documented test cards", () => {
    for (const n of [
      "4242424242424242",
      "4000000000000002",
      "4000000000009995",
    ]) {
      expect(passesLuhn(n)).toBe(true);
    }
  });

  it("rejects a mistyped number", () => {
    expect(passesLuhn("4242424242424241")).toBe(false);
    expect(validateCardNumber("4242424242424241")).toBe(
      "Check the card number.",
    );
    expect(validateCardNumber("")).toBe("Enter your card number.");
    expect(validateCardNumber("4242424242424242")).toBeUndefined();
  });
});

describe("expiry", () => {
  it("accepts a future month and the current month", () => {
    expect(validateExpiry("12 / 28", NOW)).toBeUndefined();
    expect(validateExpiry("10 / 26", NOW)).toBeUndefined();
  });

  it("rejects past, malformed and impossible dates", () => {
    expect(validateExpiry("09 / 26", NOW)).toBe("This card has expired.");
    expect(validateExpiry("13 / 28", NOW)).toBe("Enter a valid month (01-12).");
    expect(validateExpiry("1", NOW)).toBe("Enter the expiry as MM / YY.");
    expect(validateExpiry("12 / 60", NOW)).toBe("Check the expiry year.");
  });

  it("formats for the API", () => {
    expect(expiryForApi("12 / 28")).toBe("12/28");
  });
});

describe("cvc and email", () => {
  it("expects 4 digits for Amex and 3 otherwise", () => {
    expect(validateCvc("123", "visa")).toBeUndefined();
    expect(validateCvc("123", "amex")).toBe("Enter the 4-digit security code.");
    expect(validateCvc("1234", "amex")).toBeUndefined();
    expect(validateCvc("12", null)).toBe("Enter the 3-digit security code.");
  });

  it("validates the email shape", () => {
    expect(validateEmail("")).toBe("Enter your email for the receipt.");
    expect(validateEmail("nope")).toBe("Enter a valid email address.");
    expect(validateEmail(" ana@example.com ")).toBeUndefined();
  });
});
