import { z } from "zod";

/**
 * The merchant's settlement wallet: where the USDC lands.
 * Pure data and validation, safe to import from the server and the browser.
 *
 * Base and Ethereum share one address format (EVM). Solana uses its own
 * (base58, 32 bytes), so every check takes the network as well as the address.
 */

export const networkSchema = z.enum(["base", "ethereum", "solana"]);
export type Network = z.infer<typeof networkSchema>;

export type AddressKind = "evm" | "solana";

export const NETWORKS: { id: Network; label: string; kind: AddressKind }[] = [
  { id: "base", label: "Base", kind: "evm" },
  { id: "ethereum", label: "Ethereum", kind: "evm" },
  { id: "solana", label: "Solana", kind: "solana" },
];

const NETWORK_INFO = Object.fromEntries(
  NETWORKS.map((n) => [n.id, n]),
) as Record<Network, (typeof NETWORKS)[number]>;

export function networkLabel(network: Network): string {
  return NETWORK_INFO[network].label;
}

export function addressKind(network: Network): AddressKind {
  return NETWORK_INFO[network].kind;
}

export const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const SOLANA_CHARS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** How many bytes a base58 string decodes to, or null if it has a character outside the alphabet */
export function base58ByteLength(value: string): number | null {
  const bytes: number[] = []; // little-endian
  for (const ch of value) {
    let carry = BASE58.indexOf(ch);
    if (carry < 0) return null;
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  // Each leading "1" is a leading zero byte
  const leadingZeros = value.length - value.replace(/^1+/, "").length;
  return bytes.length + leadingZeros;
}

function isSolanaAddress(value: string): boolean {
  return SOLANA_CHARS.test(value) && base58ByteLength(value) === 32;
}

/** Returns an error message, or undefined when the address is acceptable for that network */
export function validateWalletAddress(
  value: string,
  network: Network,
): string | undefined {
  const v = value.trim();
  if (!v) return "Enter the wallet address that should receive USDC.";

  if (addressKind(network) === "evm") {
    if (/^0x0{40}$/i.test(v)) {
      return "That is the zero address. Funds sent there are lost.";
    }
    if (EVM_ADDRESS.test(v)) return undefined;
    if (isSolanaAddress(v)) {
      return "That looks like a Solana address. Choose Solana as the network";
    }
    if (!/^0x/i.test(v)) return "The address should start with 0x.";
    return "An address is 0x followed by 40 characters (0-9, a-f).";
  }

  if (isSolanaAddress(v)) return undefined;
  if (EVM_ADDRESS.test(v)) {
    return "That looks like an Ethereum-style address. Choose Base or Ethereum";
  }
  if (!SOLANA_CHARS.test(v)) {
    return "A Solana address is 32-44 letters and numbers (no 0, O, I or l)";
  }
  return "That doesn't look like a valid Solana address";
}

/** A wallet that passes `validateWalletAddress` for its own network */
export const settlementWalletSchema = z
  .object({
    address: z.string().trim().max(100),
    network: networkSchema,
  })
  .superRefine((wallet, ctx) => {
    const message = validateWalletAddress(wallet.address, wallet.network);
    if (message) ctx.addIssue({ code: "custom", path: ["address"], message });
  });
export type SettlementWallet = z.infer<typeof settlementWalletSchema>;

/** Public sample addresses. They belong to nobody in this demo */
const DEMO_ADDRESS: Record<AddressKind, string> = {
  evm: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  solana: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
};

export function demoWallet(network: Network): SettlementWallet {
  return { address: DEMO_ADDRESS[addressKind(network)], network };
}

export const DEMO_WALLET: SettlementWallet = demoWallet("base");

/** "0x71C7…976F" */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
