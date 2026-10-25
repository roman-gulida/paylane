"use client";

import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { ButtonLink } from "@/components/ui/button";
import { computeKpis, dailySeries } from "@/lib/analytics";
import { DEMO_MERCHANT } from "@/lib/orders";
import type { Transaction } from "@/lib/types";
import { KpiCards } from "./kpi-cards";
import { RevenueChart } from "./revenue-chart";
import { useTransactionDrawer } from "./transaction-drawer";
import { useTransactions } from "./use-transactions";

const RECENT = 6;

export function Overview({ base }: { base: Transaction[] }) {
  const { transactions, newIds } = useTransactions(base);
  const series = useMemo(() => dailySeries(transactions, 30), [transactions]);
  const kpis = useMemo(() => computeKpis(transactions, 30), [transactions]);
  const { selectedId, select, drawer } = useTransactionDrawer();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          {DEMO_MERCHANT.name} · last 30 days · sample data plus anything you
          pay on{" "}
          <a
            href="/pay"
            className="text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            /pay
          </a>
        </p>
      </header>

      <KpiCards kpis={kpis} series={series} />
      <RevenueChart series={series} />

      <section aria-labelledby="recent-title" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="recent-title" className="text-base font-semibold">
            Recent transactions
          </h2>
          <ButtonLink href="/dashboard/transactions" variant="ghost" size="sm">
            View all
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
        <TransactionsTable
          transactions={transactions.slice(0, RECENT)}
          selectedId={selectedId}
          onSelect={select}
          newIds={newIds}
        />
      </section>

      {drawer}
    </div>
  );
}
