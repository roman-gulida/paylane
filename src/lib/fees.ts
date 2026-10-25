/**
 * Fee and settlement logic — the single source of truth.
 *
 * The landing calculator, the checkout summary, the API and the dashboard all
 * call `calculateSettlement`, so the numbers can never disagree.
 *
 * Money is handled as integers:
 *  - USD in cents
 *  - USDC in micro-USDC (6 decimals, like the real token)
 * so there is no floating-point drift in amounts.
 *
 * NOTE: the fee numbers below are placeholders for the demo. Change them here
 * and everything else follows.
 */

import { formatUSD } from "./format";

export const FEE_CONFIG = {
  /** Percentage fee, in basis points (200 = 2.00%) */
  percentBps: 200,
  /** Fixed fee per successful payment, in cents */
  fixedCents: 100,
  /** USDC received per 1 USD of net amount. 1 = parity */
  usdcPerUsd: 1,
} as const;

/** 1 cent = 0.01 USD = 10,000 micro-USDC at parity */
const MICRO_PER_CENT = 10_000;

export interface Settlement {
  grossCents: number;
  feeCents: number;
  netCents: number;
  /** Settled amount in micro-USDC */
  usdcMicro: number;
}

/** The fee rule as people read it, e.g. "2% + $1.00". Always derived from FEE_CONFIG */
export function feeRuleLabel(): string {
  return `${FEE_CONFIG.percentBps / 100}% + ${formatUSD(FEE_CONFIG.fixedCents)}`;
}

export function calculateFeeCents(grossCents: number): number {
  if (!Number.isInteger(grossCents) || grossCents < 0) {
    throw new RangeError("grossCents must be a non-negative integer");
  }
  if (grossCents === 0) return 0;
  const percentFee = Math.round((grossCents * FEE_CONFIG.percentBps) / 10_000);
  // Never charge more than the payment itself
  return Math.min(grossCents, percentFee + FEE_CONFIG.fixedCents);
}

export function calculateSettlement(
  grossCents: number,
  usdcPerUsd: number = FEE_CONFIG.usdcPerUsd,
): Settlement {
  const feeCents = calculateFeeCents(grossCents);
  const netCents = grossCents - feeCents;
  const usdcMicro = Math.round(netCents * MICRO_PER_CENT * usdcPerUsd);
  return { grossCents, feeCents, netCents, usdcMicro };
}
