import type { Transaction } from "./types";

/**
 * Dashboard maths. Pure functions on plain transaction lists, so the numbers
 * on every card, the chart and the table always come from the same place.
 *
 * "Today" is never read from the clock: it is the day of the newest
 * transaction. That keeps server and browser output identical (no hydration
 * mismatch) and lets a payment made on /pay show up on today's bar.
 */

const DAY_MS = 86_400_000;

/** "YYYY-MM-DD" (UTC day) from an ISO timestamp. */
export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** The UTC day of the newest transaction. Empty list: the epoch day */
export function latestDay(transactions: readonly Transaction[]): string {
  let latest = "";
  for (const t of transactions) if (t.createdAt > latest) latest = t.createdAt;
  return latest ? dayKey(latest) : "1970-01-01";
}

/** `days` consecutive day keys ending on `endDay`, oldest first */
export function windowDays(endDay: string, days: number): string[] {
  const end = Date.parse(`${endDay}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) =>
    new Date(end - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10),
  );
}

export interface DayPoint {
  day: string;
  /** USDC that has settled to the merchant (succeeded payments only) */
  settledMicro: number;
  /** Gross card volume of succeeded payments, in cents */
  volumeCents: number;
  /** Succeeded payments */
  payments: number;
}

/** One point per day, including days with no payments (zeros), so the chart has no gaps */
export function dailySeries(
  transactions: readonly Transaction[],
  days = 30,
): DayPoint[] {
  const points = windowDays(latestDay(transactions), days).map<DayPoint>(
    (day) => ({ day, settledMicro: 0, volumeCents: 0, payments: 0 }),
  );
  const byDay = new Map(points.map((p) => [p.day, p]));

  for (const t of transactions) {
    if (t.status !== "succeeded") continue;
    const point = byDay.get(dayKey(t.createdAt));
    if (!point) continue;
    point.settledMicro += t.usdcMicro;
    point.volumeCents += t.grossCents;
    point.payments += 1;
  }
  return points;
}

export interface Kpis {
  /** Settled USDC available to the merchant, all time */
  availableMicro: number;
  /** USDC from payments that are still settling */
  pendingMicro: number;
  /** Gross volume of succeeded payments in the window, in cents */
  volumeCents: number;
  /** Succeeded payments in the window */
  payments: number;
  /** Payments the card network declined, in the window */
  declined: number;
  /** Share of attempts that were not declined (0–1), or null with no attempts */
  successRate: number | null;
  attempts: number;
}

export function computeKpis(
  transactions: readonly Transaction[],
  days = 30,
): Kpis {
  const inWindow = new Set(windowDays(latestDay(transactions), days));

  let availableMicro = 0;
  let pendingMicro = 0;
  let volumeCents = 0;
  let payments = 0;
  let declined = 0;
  let attempts = 0;

  for (const t of transactions) {
    if (t.status === "succeeded") availableMicro += t.usdcMicro;
    if (t.status === "pending") pendingMicro += t.usdcMicro;

    if (!inWindow.has(dayKey(t.createdAt))) continue;
    attempts += 1;
    if (t.status === "failed") declined += 1;
    if (t.status === "succeeded") {
      payments += 1;
      volumeCents += t.grossCents;
    }
  }

  return {
    availableMicro,
    pendingMicro,
    volumeCents,
    payments,
    declined,
    attempts,
    // Pending and refunded payments were authorised, so only declines count against the rate
    successRate: attempts === 0 ? null : (attempts - declined) / attempts,
  };
}

/** Running total of a daily series, for the balance sparkline */
export function cumulative(values: readonly number[]): number[] {
  let sum = 0;
  return values.map((v) => (sum += v));
}

/** Payments made on /pay come first; everything stays newest-first */
export function mergeTransactions(
  mine: readonly Transaction[],
  base: readonly Transaction[],
): Transaction[] {
  return [...mine, ...base].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
