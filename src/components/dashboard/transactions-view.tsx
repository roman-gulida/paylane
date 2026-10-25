"use client";

import { useMemo, useState } from "react";
import {
  TransactionsTable,
  type Sort,
  type SortKey,
} from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { FilterPills, type PillOption } from "@/components/ui/filter-pills";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { useTransactionDrawer } from "./transaction-drawer";
import { useTransactions } from "./use-transactions";

type Filter = "all" | TransactionStatus;

const STATUSES: { value: TransactionStatus; label: string }[] = [
  { value: "succeeded", label: "Succeeded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const PAGE = 15;

export function TransactionsView({ base }: { base: Transaction[] }) {
  const { transactions, newIds } = useTransactions(base);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>({ key: "date", order: "desc" });
  const [shown, setShown] = useState(PAGE);
  const { selectedId, select, drawer } = useTransactionDrawer();

  const options = useMemo<PillOption<Filter>[]>(
    () => [
      { value: "all", label: "All", count: transactions.length },
      ...STATUSES.map((s) => ({
        ...s,
        count: transactions.filter((t) => t.status === s.value).length,
      })),
    ],
    [transactions],
  );

  const matching = useMemo(() => {
    const filtered =
      filter === "all"
        ? transactions
        : transactions.filter((t) => t.status === filter);
    const dir = sort.order === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) =>
      sort.key === "amount"
        ? (a.grossCents - b.grossCents) * dir
        : a.createdAt.localeCompare(b.createdAt) * dir,
    );
  }, [transactions, filter, sort]);

  function changeFilter(next: Filter) {
    setFilter(next);
    setShown(PAGE);
  }

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, order: prev.order === "asc" ? "desc" : "asc" }
        : { key, order: "desc" },
    );
    setShown(PAGE);
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted">
          {transactions.length} payments. Click a row for the full breakdown.
        </p>
      </header>

      <FilterPills
        label="Filter by status"
        options={options}
        value={filter}
        onChange={changeFilter}
      />

      <TransactionsTable
        transactions={matching.slice(0, shown)}
        selectedId={selectedId}
        sort={sort}
        onSort={handleSort}
        onSelect={select}
        onResetFilters={() => changeFilter("all")}
        newIds={newIds}
      />

      {matching.length > 0 && (
        <div className="flex flex-col items-center gap-3 pt-1">
          <p className="num text-xs text-faint" aria-live="polite">
            Showing {Math.min(shown, matching.length)} of {matching.length}
          </p>
          {shown < matching.length && (
            <Button
              variant="secondary"
              onClick={() => setShown((n) => n + PAGE)}
            >
              Show more
            </Button>
          )}
        </div>
      )}

      {drawer}
    </div>
  );
}
