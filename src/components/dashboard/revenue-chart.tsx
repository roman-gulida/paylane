"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DayPoint } from "@/lib/analytics";
import { formatDayShort, formatUSDC } from "@/lib/format";
import type { Datum } from "./revenue-chart-graphic";

/**
 * USDC settled per day.
 * The chart library loads on demand; the placeholder has the same height, so
 * nothing jumps when it arrives.
 */

const RevenueChartGraphic = dynamic(() => import("./revenue-chart-graphic"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function RevenueChart({ series }: { series: readonly DayPoint[] }) {
  const data = useMemo<Datum[]>(
    () =>
      series.map((p) => ({
        date: p.day,
        usdc: p.settledMicro / 1_000_000,
        micro: p.settledMicro,
        count: p.payments,
      })),
    [series],
  );

  const totalMicro = data.reduce((n, d) => n + d.micro, 0);
  const peak = data.reduce((a, b) => (b.micro > a.micro ? b : a));
  const summary =
    totalMicro === 0
      ? "No USDC settled in this period."
      : `${formatUSDC(totalMicro)} settled in total. The best day was ${formatDayShort(peak.date)} with ${formatUSDC(peak.micro)}.`;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-base font-medium">USDC settled per day</h2>
        <p className="text-sm text-muted">
          Last 30 days ·{" "}
          <span className="num text-fg">{formatUSDC(totalMicro)}</span>
        </p>
      </div>

      <figure className="mt-5">
        <figcaption className="sr-only">
          Area chart of USDC settled per day over the last 30 days. {summary}
        </figcaption>
        <div className="h-60 w-full sm:h-64">
          <RevenueChartGraphic data={data} />
        </div>
      </figure>

      <details className="group mt-4">
        <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full text-sm text-muted transition-colors hover:text-fg">
          <span className="group-open:hidden">View as table</span>
          <span className="hidden group-open:inline">Hide table</span>
        </summary>
        <div className="mt-3 max-h-72 overflow-auto rounded-xl bg-raised">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">USDC settled per day</caption>
            <thead className="sticky top-0 bg-raised text-xs uppercase tracking-wider text-faint">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Payments
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Settled
                </th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.date} className="border-t border-line">
                  <td className="num px-4 py-2 text-muted">
                    {formatDayShort(d.date)}
                  </td>
                  <td className="num px-4 py-2 text-right text-muted">
                    {d.count}
                  </td>
                  <td className="num px-4 py-2 text-right">
                    {formatUSDC(d.micro)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
