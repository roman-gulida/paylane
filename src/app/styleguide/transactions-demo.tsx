"use client";

import { useMemo, useState } from "react";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import {
  TransactionsTable,
  type Sort,
  type SortKey,
} from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { FilterPills, type PillOption } from "@/components/ui/filter-pills";
import type { Transaction, TransactionStatus } from "@/lib/types";

type Filter = "all" | TransactionStatus;

const STATUSES: { value: TransactionStatus; label: string }[] = [
  { value: "succeeded", label: "Succeeded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const ROWS_SHOWN = 10;

/** Styleguide-only wiring. The dashboard will reuse the same three components */
export function TransactionsDemo({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>({ key: "date", order: "desc" });
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

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

  const rows = useMemo(() => {
    if (simulateEmpty) return [];
    const filtered =
      filter === "all"
        ? transactions
        : transactions.filter((t) => t.status === filter);
    const dir = sort.order === "asc" ? 1 : -1;
    return [...filtered]
      .sort((a, b) =>
        sort.key === "amount"
          ? (a.grossCents - b.grossCents) * dir
          : a.createdAt.localeCompare(b.createdAt) * dir,
      )
      .slice(0, ROWS_SHOWN);
  }, [transactions, filter, sort, simulateEmpty]);

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, order: prev.order === "asc" ? "desc" : "asc" }
        : { key, order: "desc" },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          label="Filter by status"
          options={options}
          value={filter}
          onChange={setFilter}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSimulateEmpty((v) => !v)}
        >
          {simulateEmpty ? "Show data again" : "Simulate no results"}
        </Button>
      </div>

      <TransactionsTable
        transactions={rows}
        selectedId={open ? selected?.id : null}
        sort={sort}
        onSort={handleSort}
        onSelect={(t) => {
          setSelected(t);
          setOpen(true);
        }}
        onResetFilters={() => {
          setFilter("all");
          setSimulateEmpty(false);
        }}
      />
      <p className="text-xs text-faint">
        Showing the first {ROWS_SHOWN} matching rows. Click a row to open the
        drawer; resize the window below 768px to see the mobile layout.
      </p>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Transaction"
        description={selected?.id}
      >
        {selected && <TransactionDetail transaction={selected} />}
      </Drawer>
    </div>
  );
}
