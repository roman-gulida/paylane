import { describe, expect, it } from "vitest";
import {
  computeKpis,
  cumulative,
  dailySeries,
  latestDay,
  mergeTransactions,
  windowDays,
} from "./analytics";
import { transactions } from "./mock-data";
import type { Transaction } from "./types";

function tx(
  over: Partial<Transaction> & Pick<Transaction, "id" | "createdAt">,
): Transaction {
  return {
    customer: "Test Co",
    description: "Test",
    method: "card",
    brand: "visa",
    last4: "4242",
    status: "succeeded",
    grossCents: 10_000,
    feeCents: 300,
    netCents: 9_700,
    usdcMicro: 97_000_000,
    ...over,
  };
}

describe("windows", () => {
  it("lists consecutive UTC days, oldest first, across a month boundary", () => {
    expect(windowDays("2026-10-02", 4)).toEqual([
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ]);
  });

  it("treats the newest transaction's day as today", () => {
    const list = [
      tx({ id: "a", createdAt: "2026-10-01T09:00:00.000Z" }),
      tx({ id: "b", createdAt: "2026-10-03T23:59:00.000Z" }),
    ];
    expect(latestDay(list)).toBe("2026-10-03");
  });
});

describe("daily series", () => {
  const list = [
    tx({ id: "a", createdAt: "2026-10-03T10:00:00.000Z" }),
    tx({
      id: "b",
      createdAt: "2026-10-03T18:00:00.000Z",
      grossCents: 5_000,
      usdcMicro: 48_000_000,
    }),
    tx({ id: "c", createdAt: "2026-10-01T10:00:00.000Z" }),
    tx({
      id: "d",
      createdAt: "2026-10-03T11:00:00.000Z",
      status: "failed",
      usdcMicro: 0,
      feeCents: 0,
      netCents: 0,
    }),
    tx({ id: "e", createdAt: "2026-10-03T12:00:00.000Z", status: "pending" }),
  ];

  it("fills empty days with zeros and sums only succeeded payments", () => {
    const series = dailySeries(list, 3);
    expect(series.map((p) => p.day)).toEqual([
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
    ]);
    expect(series.map((p) => p.payments)).toEqual([1, 0, 2]);
    expect(series[2].settledMicro).toBe(145_000_000);
    expect(series[2].volumeCents).toBe(15_000);
    expect(series[1].settledMicro).toBe(0);
  });

  it("builds a running total", () => {
    expect(cumulative([1, 0, 2, 3])).toEqual([1, 1, 3, 6]);
  });
});

describe("kpis", () => {
  it("separates available from pending USDC and counts declines against the rate", () => {
    const list = [
      tx({ id: "a", createdAt: "2026-10-03T10:00:00.000Z" }),
      tx({ id: "b", createdAt: "2026-10-03T11:00:00.000Z", status: "pending" }),
      tx({
        id: "c",
        createdAt: "2026-10-03T12:00:00.000Z",
        status: "failed",
        usdcMicro: 0,
        feeCents: 0,
        netCents: 0,
      }),
      tx({
        id: "d",
        createdAt: "2026-10-03T13:00:00.000Z",
        status: "refunded",
        usdcMicro: 0,
        feeCents: 0,
        netCents: 0,
      }),
    ];
    const k = computeKpis(list);
    expect(k.availableMicro).toBe(97_000_000);
    expect(k.pendingMicro).toBe(97_000_000);
    expect(k.volumeCents).toBe(10_000);
    expect(k.payments).toBe(1);
    expect(k.declined).toBe(1);
    expect(k.attempts).toBe(4);
    expect(k.successRate).toBe(0.75);
  });

  it("has no success rate without attempts", () => {
    expect(computeKpis([]).successRate).toBeNull();
  });

  it("agrees with the sample data: every settled USDC is in the balance", () => {
    const k = computeKpis(transactions);
    const settled = transactions
      .filter((t) => t.status === "succeeded")
      .reduce((sum, t) => sum + t.usdcMicro, 0);
    expect(k.availableMicro).toBe(settled);
    expect(
      dailySeries(transactions, 30).reduce((s, p) => s + p.settledMicro, 0),
    ).toBe(settled);
  });
});

describe("merging", () => {
  it("puts newer payments first", () => {
    const mine = [tx({ id: "mine", createdAt: "2026-10-12T10:00:00.000Z" })];
    const merged = mergeTransactions(mine, transactions);
    expect(merged[0].id).toBe("mine");
    expect(merged).toHaveLength(transactions.length + 1);
  });
});
