import { describe, expect, it } from "vitest";
import {
  base58ByteLength,
  DEMO_WALLET,
  demoWallet,
  networkLabel,
  settlementWalletSchema,
  shortAddress,
  validateWalletAddress,
} from "./wallet";

const SOLANA_SAMPLE = demoWallet("solana").address;

describe("EVM wallet addresses (Base, Ethereum)", () => {
  it("accepts a normal address, with or without surrounding spaces", () => {
    for (const network of ["base", "ethereum"] as const) {
      expect(
        validateWalletAddress(DEMO_WALLET.address, network),
      ).toBeUndefined();
      expect(
        validateWalletAddress(` ${DEMO_WALLET.address} `, network),
      ).toBeUndefined();
      expect(
        validateWalletAddress(DEMO_WALLET.address.toLowerCase(), network),
      ).toBeUndefined();
    }
  });

  it("explains what is wrong", () => {
    expect(validateWalletAddress("", "base")).toMatch(
      /Enter the wallet address/,
    );
    expect(
      validateWalletAddress("71C7656EC7ab88b098defB751B7401B5f6d8976F", "base"),
    ).toBe("The address should start with 0x.");
    expect(validateWalletAddress("0x123", "base")).toMatch(/40 characters/);
    expect(validateWalletAddress("0x" + "g".repeat(40), "base")).toMatch(
      /40 characters/,
    );
    expect(validateWalletAddress("0x" + "0".repeat(40), "ethereum")).toMatch(
      /zero address/,
    );
  });

  it("points a Solana address at the right network", () => {
    expect(validateWalletAddress(SOLANA_SAMPLE, "base")).toMatch(
      /Choose Solana/,
    );
  });
});

describe("Solana wallet addresses", () => {
  it("decodes base58 to bytes", () => {
    expect(base58ByteLength("1".repeat(32))).toBe(32); // the system program
    expect(base58ByteLength(SOLANA_SAMPLE)).toBe(32);
    expect(base58ByteLength("0OIl")).toBeNull();
  });

  it("accepts real 32-byte addresses", () => {
    expect(validateWalletAddress(SOLANA_SAMPLE, "solana")).toBeUndefined();
    expect(
      validateWalletAddress(
        "So11111111111111111111111111111111111111112",
        "solana",
      ),
    ).toBeUndefined();
    expect(validateWalletAddress("1".repeat(32), "solana")).toBeUndefined();
  });

  it("rejects bad characters, wrong lengths and EVM addresses", () => {
    expect(
      validateWalletAddress("0" + SOLANA_SAMPLE.slice(1), "solana"),
    ).toMatch(/no 0, O, I or l/);
    expect(validateWalletAddress("abc", "solana")).toMatch(/32-44/);
    // 44 valid characters that decode to more than 32 bytes.
    expect(validateWalletAddress("z".repeat(44), "solana")).toMatch(
      /valid Solana address/,
    );
    expect(validateWalletAddress(DEMO_WALLET.address, "solana")).toMatch(
      /Choose Base or Ethereum/,
    );
  });
});

describe("wallet schema and helpers", () => {
  it("each demo wallet passes its own network's check", () => {
    for (const network of ["base", "ethereum", "solana"] as const) {
      expect(
        settlementWalletSchema.safeParse(demoWallet(network)).success,
      ).toBe(true);
    }
  });

  it("rejects an address that belongs to another network", () => {
    expect(
      settlementWalletSchema.safeParse({
        address: SOLANA_SAMPLE,
        network: "base",
      }).success,
    ).toBe(false);
  });

  it("shortens and labels", () => {
    expect(shortAddress(DEMO_WALLET.address)).toBe("0x71C7…976F");
    expect(shortAddress(SOLANA_SAMPLE)).toBe("9WzDXw…AWWM");
    expect(networkLabel("solana")).toBe("Solana");
  });
});
