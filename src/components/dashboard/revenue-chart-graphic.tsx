"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatDayShort, formatUSDC } from "@/lib/format";

/**
 * The area chart itself. Kept in its own file so the chart library
 * is only downloaded when the dashboard needs it, not on the landing page or /pay
 */

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export interface Datum {
  date: string;
  usdc: number;
  micro: number;
  count: number;
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const d = payload?.[0]?.payload as Datum | undefined;
  if (!active || !d) return null;
  return (
    <div className="rounded-xl bg-raised px-3 py-2.5 text-xs shadow-(--shadow-card) ring-1 ring-line">
      <p className="text-faint">{formatDayShort(d.date)}</p>
      <p className="mt-1 flex items-center gap-2">
        <span aria-hidden className="h-0.5 w-3 rounded-full bg-accent" />
        <span className="num text-sm text-fg">{formatUSDC(d.micro)}</span>
      </p>
      <p className="mt-0.5 text-muted">
        {d.count} {d.count === 1 ? "payment" : "payments"}
      </p>
    </div>
  );
}

export default function RevenueChartGraphic({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      initialDimension={{ width: 720, height: 256 }}
    >
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="settled-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayShort}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-faint)", fontSize: 11 }}
          minTickGap={28}
          tickMargin={8}
        />
        <YAxis
          width={44}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(v: number) => compact.format(v)}
          tick={{ fill: "var(--text-faint)", fontSize: 11 }}
        />
        <Tooltip
          content={ChartTooltip}
          cursor={{ stroke: "var(--text-faint)", strokeWidth: 1 }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="usdc"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="url(#settled-fill)"
          // No entrance animation: after in-app navigation it could stay stuck at zero width
          isAnimationActive={false}
          activeDot={{
            r: 5,
            fill: "var(--accent)",
            stroke: "var(--surface)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
