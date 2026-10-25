"use client";

import { useMemo } from "react";
import { mergeTransactions } from "@/lib/analytics";
import { useLiveOrders } from "@/lib/live-orders";
import type { Transaction } from "@/lib/types";

/**
 * The sample transactions plus every payment made on /pay, from all visitors.
 * On the server (and during hydration) the live list is empty, so the first
 * render matches the prerendered HTML; the saved payments then appear.
 * `newIds` marks the ones this browser made.
 */
export function useTransactions(base: Transaction[]) {
  const { orders, mineIds } = useLiveOrders();
  return useMemo(
    () => ({
      transactions: mergeTransactions(orders, base),
      newIds: mineIds as ReadonlySet<string>,
      mineCount: mineIds.size,
    }),
    [orders, mineIds, base],
  );
}
