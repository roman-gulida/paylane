import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { cumulative, type DayPoint, type Kpis } from "@/lib/analytics";
import {
  formatPercent,
  formatUSD,
  formatUSDC,
  formatUSDCNumber,
} from "@/lib/format";
import { Sparkline } from "./sparkline";

function Stat({
  label,
  value,
  unit,
  sub,
  footer,
}: {
  label: string;
  value: string;
  /** Small text after the number, like "USDC". Keeps long amounts on one line */
  unit?: string;
  sub: string;
  footer: ReactNode;
}) {
  return (
    <Card className="flex flex-col p-5 sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-2 text-2xl sm:text-[1.7rem]">
        {value}
        {unit && <span className="ml-1.5 text-sm text-muted">{unit}</span>}
      </p>
      <p className="mt-1 text-xs text-faint">{sub}</p>
      <div className="mt-auto pt-4">{footer}</div>
    </Card>
  );
}

function Meter({ value }: { value: number }) {
  const tone =
    value >= 0.85 ? "bg-accent" : value >= 0.7 ? "bg-pending" : "bg-failed";
  return (
    <div
      role="meter"
      aria-label="Success rate"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="h-2 overflow-hidden rounded-full bg-accent/15"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          tone,
        )}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );
}

export function KpiCards({
  kpis,
  series,
}: {
  kpis: Kpis;
  series: readonly DayPoint[];
}) {
  const rate = kpis.successRate;
  return (
    <section
      aria-label="Key figures, last 30 days"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Stat
        label="USDC balance"
        value={formatUSDCNumber(kpis.availableMicro)}
        unit="USDC"
        sub={`${formatUSDC(kpis.pendingMicro)} still settling`}
        footer={
          <Sparkline values={cumulative(series.map((p) => p.settledMicro))} />
        }
      />
      <Stat
        label="Volume, 30 days"
        value={formatUSD(kpis.volumeCents)}
        sub="Card payments processed"
        footer={<Sparkline values={series.map((p) => p.volumeCents)} />}
      />
      <Stat
        label="Payments, 30 days"
        value={String(kpis.payments)}
        sub={`${kpis.declined} declined`}
        footer={<Sparkline values={series.map((p) => p.payments)} />}
      />
      <Stat
        label="Success rate"
        value={rate === null ? "—" : formatPercent(rate, 1)}
        sub={
          rate === null
            ? "No payments yet"
            : `${kpis.attempts - kpis.declined} of ${kpis.attempts} attempts approved`
        }
        footer={<Meter value={rate ?? 0} />}
      />
    </section>
  );
}
