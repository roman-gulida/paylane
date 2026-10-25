import { calculateSettlement } from "./fees";
import {
  transactionSchema,
  type Transaction,
  type TransactionStatus,
  type PaymentMethod,
} from "./types";
import type { CardBrand } from "./format";

/**
 * Deterministic mock data: a seeded PRNG and a fixed anchor date, so the server
 * and the browser always see identical transactions (no hydration mismatches).
 */
export const ANCHOR = Date.parse("2026-10-10T12:00:00Z");

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS = [
  "Northwind Logistics",
  "Brightlane Studio",
  "Kestrel Analytics",
  "Orchard & Pine",
  "Helix Robotics",
  "Marlow Travel",
  "Quanta Labs",
  "Fjord Outfitters",
  "Lumen Health",
  "Atlas Freight",
  "Tidewater Coffee",
  "Cobalt Software",
];

const DESCRIPTIONS = [
  "Annual plan",
  "Monthly subscription",
  "Invoice payment",
  "Equipment order",
  "Consulting retainer",
  "API usage top-up",
  "Booking deposit",
  "Marketplace order",
];

const BRANDS: CardBrand[] = [
  "visa",
  "mastercard",
  "visa",
  "mastercard",
  "amex",
];
const METHODS: PaymentMethod[] = [
  "card",
  "card",
  "card",
  "apple_pay",
  "google_pay",
];

const FAILURE_REASONS = [
  "Insufficient funds",
  "Card declined by issuer",
  "Incorrect CVC",
  "Card expired",
];

/**
 * A repeating pattern instead of random picks, so every status is guaranteed to
 * appear a few times (otherwise the dashboard filters can look empty).
 * Roughly 75% succeeded, 8% each pending / failed / refunded.
 */
const STATUS_PATTERN: TransactionStatus[] = [
  "succeeded",
  "succeeded",
  "succeeded",
  "pending",
  "succeeded",
  "succeeded",
  "failed",
  "succeeded",
  "succeeded",
  "refunded",
  "succeeded",
  "succeeded",
];

function pickStatus(index: number): TransactionStatus {
  return STATUS_PATTERN[index % STATUS_PATTERN.length];
}

function buildTransactions(count: number): Transaction[] {
  const rand = mulberry32(20261010);
  const items: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const status = pickStatus(i);
    // Amounts between $12.00 and $4,800.00, skewed toward smaller payments.
    const grossCents = Math.round((12 + Math.pow(rand(), 2.2) * 4788) * 100);
    const settlement = calculateSettlement(grossCents);
    const settled = status === "succeeded" || status === "pending";
    const daysAgo = rand() * 30;
    const createdAt = new Date(ANCHOR - daysAgo * 86_400_000).toISOString();

    items.push({
      id: `pl_${(1000 + i * 37).toString(36)}${Math.floor(rand() * 1296)
        .toString(36)
        .padStart(2, "0")}`,
      createdAt,
      customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
      description: DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)],
      method: METHODS[Math.floor(rand() * METHODS.length)],
      brand: BRANDS[Math.floor(rand() * BRANDS.length)],
      last4: String(Math.floor(rand() * 10_000)).padStart(4, "0"),
      status,
      grossCents,
      feeCents: settled ? settlement.feeCents : 0,
      netCents: settled ? settlement.netCents : 0,
      usdcMicro: settled ? settlement.usdcMicro : 0,
      failureReason:
        status === "failed"
          ? FAILURE_REASONS[Math.floor(rand() * FAILURE_REASONS.length)]
          : undefined,
    });
  }

  // Newest first, and validate everything at the boundary
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items.map((t) => transactionSchema.parse(t));
}

export const transactions: Transaction[] = buildTransactions(42);
