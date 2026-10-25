"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, SearchX } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import {
  describeMethod,
  formatDateTime,
  formatUSD,
  formatUSDC,
} from "@/lib/format";
import type { Transaction } from "@/lib/types";

export type SortKey = "date" | "amount";
export interface Sort {
  key: SortKey;
  order: "asc" | "desc";
}

interface Props {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
  selectedId?: string | null;
  /** Provide both `sort` and `onSort` to make the Date and Amount headers sortable */
  sort?: Sort;
  onSort?: (key: SortKey) => void;
  /** Shown as a button in the empty state when filters hide every row */
  onResetFilters?: () => void;
  /** Rows to mark with a "New" tag, e.g. payments the visitor just made on /pay */
  newIds?: ReadonlySet<string>;
}

/*
 * Layout is driven by the width of the table's own container, not the screen.
 * The dashboard has a sidebar, so the same table gets much less room than the
 * screen suggests. Measured natural widths: all six columns need about 900px,
 * without Method about 680px.
 *
 *   container < 760px  => stacked cards
 *   760px and up       => table, Method column hidden
 *   940px and up       => table with every column
 *
 * First and last cells get extra padding so text never touches the rounded edge,
 * and the wrapper scrolls sideways as a last resort instead of clipping.
 */
const TABLE_WHEN_WIDE = "hidden @min-[760px]:block";
const CARDS_WHEN_NARROW = "@min-[760px]:hidden";
const METHOD_WHEN_WIDER = "hidden @min-[940px]:table-cell";
const TH = "px-4 py-3 font-medium first:ps-6 last:pe-6";
const TD = "px-4 py-3.5 first:ps-6 last:pe-6";

const dimmed = (t: Transaction) =>
  t.status === "failed" || t.status === "refunded";

function NewTag() {
  return (
    <span className="ml-2 rounded-full bg-accent/15 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-accent">
      New
    </span>
  );
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort?: Sort;
  onSort?: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort?.key === sortKey;
  const Icon = !active
    ? ChevronsUpDown
    : sort.order === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={
        active ? (sort.order === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(TH, align === "right" && "text-right")}
    >
      {onSort ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider transition-colors",
            "hover:text-fg",
            active && "text-fg",
          )}
        >
          {label}
          <Icon
            aria-hidden
            className={cn("size-3.5", !active && "opacity-50")}
          />
        </button>
      ) : (
        label
      )}
    </th>
  );
}

export function TransactionsTable({
  transactions,
  onSelect,
  selectedId,
  sort,
  onSort,
  onResetFilters,
  newIds,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-(--radius-card) bg-surface">
        <EmptyState
          icon={SearchX}
          title="No transactions found"
          description="Nothing matches the current filters. Try a different status or clear the filters."
          action={
            onResetFilters && (
              <Button variant="secondary" size="sm" onClick={onResetFilters}>
                Clear filters
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="@container">
      {/* Wide container: a real table */}
      <div
        className={cn(
          "overflow-x-auto rounded-(--radius-card) bg-surface shadow-(--shadow-card)",
          TABLE_WHEN_WIDE,
        )}
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Transactions</caption>
          <thead className="text-xs uppercase tracking-wider text-faint">
            <tr>
              <th scope="col" className={TH}>
                Customer
              </th>
              <SortableHead
                label="Date"
                sortKey="date"
                sort={sort}
                onSort={onSort}
              />
              <th scope="col" className={cn(TH, METHOD_WHEN_WIDER)}>
                Method
              </th>
              <SortableHead
                label="Amount"
                sortKey="amount"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <th scope="col" className={TH}>
                Status
              </th>
              <th scope="col" className={cn(TH, "text-right")}>
                Settled
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                onClick={() => onSelect(t)}
                className={cn(
                  "cursor-pointer border-t border-line transition-colors hover:bg-raised",
                  selectedId === t.id && "bg-raised",
                )}
              >
                <td className={TD}>
                  {/* The button is the keyboard target; the row click handles the mouse */}
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    className="cursor-pointer text-left"
                  >
                    <span className="block font-medium">
                      {t.customer}
                      {newIds?.has(t.id) && <NewTag />}
                    </span>
                    <span className="num block text-xs text-faint">{t.id}</span>
                  </button>
                </td>
                <td className={cn(TD, "num whitespace-nowrap text-muted")}>
                  {formatDateTime(t.createdAt)}
                </td>
                <td
                  className={cn(
                    TD,
                    "num whitespace-nowrap text-muted",
                    METHOD_WHEN_WIDER,
                  )}
                >
                  {describeMethod(t.method, t.brand, t.last4)}
                </td>
                <td
                  className={cn(
                    TD,
                    "num whitespace-nowrap text-right",
                    dimmed(t) && "text-muted",
                  )}
                >
                  {formatUSD(t.grossCents)}
                </td>
                <td className={TD}>
                  <StatusBadge status={t.status} />
                </td>
                <td
                  className={cn(
                    TD,
                    "num whitespace-nowrap text-right",
                    t.status === "pending" ? "text-muted" : "text-fg",
                  )}
                >
                  {t.usdcMicro > 0 ? formatUSDC(t.usdcMicro) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Narrow container: one card per transaction, no sideways scrolling */}
      <ul className={cn("space-y-2", CARDS_WHEN_NARROW)}>
        {transactions.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              aria-haspopup="dialog"
              className={cn(
                "flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl p-4 text-left",
                "transition-colors",
                selectedId === t.id
                  ? "bg-raised"
                  : "bg-surface hover:bg-raised",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {t.customer}
                  {newIds?.has(t.id) && <NewTag />}
                </span>
                <span className="num mt-0.5 block text-xs text-faint">
                  {formatDateTime(t.createdAt)}
                </span>
                <span className="num mt-0.5 block text-xs text-muted">
                  {describeMethod(t.method, t.brand, t.last4)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={cn("num text-base", dimmed(t) && "text-muted")}
                >
                  {formatUSD(t.grossCents)}
                </span>
                <StatusBadge status={t.status} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
