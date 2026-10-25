import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import {
  describeMethod,
  formatDateTime,
  formatUSD,
  formatUSDC,
} from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { networkLabel, shortAddress } from "@/lib/wallet";

type StepState = "done" | "current" | "failed";
interface Step {
  label: string;
  at?: string;
  state: StepState;
}

/**
 * The demo data only stores `createdAt`, so the later steps are derived from it
 * with fixed offsets. A real backend would return an event log instead.
 */
function buildTimeline(t: Transaction): Step[] {
  const base = Date.parse(t.createdAt);
  const at = (offsetMs: number) => new Date(base + offsetMs).toISOString();
  const created: Step = {
    label: "Payment created",
    at: t.createdAt,
    state: "done",
  };
  const authorized: Step = {
    label: "Card authorized",
    at: at(2_000),
    state: "done",
  };
  const settled: Step = {
    label: "Settled in USDC",
    at: at(8 * 60_000),
    state: "done",
  };

  switch (t.status) {
    case "succeeded":
      return [created, authorized, settled];
    case "pending":
      return [
        created,
        authorized,
        { label: "Settlement in progress", state: "current" },
      ];
    case "failed":
      return [
        created,
        {
          label: `Declined: ${t.failureReason ?? "Unknown reason"}`,
          at: at(2_000),
          state: "failed",
        },
      ];
    case "refunded":
      return [
        created,
        authorized,
        settled,
        {
          label: "Refunded to customer",
          at: at(26 * 3_600_000),
          state: "done",
        },
      ];
  }
}

const DOT: Record<StepState, string> = {
  done: "bg-success",
  current: "bg-pending animate-pulse",
  failed: "bg-failed",
};

function Row({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("text-right", mono && "num", strong && "font-medium")}>
        {value}
      </dd>
    </div>
  );
}

export function TransactionDetail({
  transaction: t,
}: {
  transaction: Transaction;
}) {
  const settled = t.status === "succeeded" || t.status === "pending";
  const steps = buildTimeline(t);

  return (
    <div className="space-y-6">
      <div>
        <p className="num text-4xl">{formatUSD(t.grossCents)}</p>
        <div className="mt-3">
          <StatusBadge status={t.status} />
        </div>
      </div>

      <Card tone="raised" className="p-4 sm:p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-faint">
          Settlement
        </h3>
        <dl className="mt-1 divide-y divide-line">
          <Row label="Payment" value={formatUSD(t.grossCents)} mono />
          <Row
            label="Paylane fee"
            value={settled ? `− ${formatUSD(t.feeCents)}` : "—"}
            mono
          />
          <Row label="Net" value={settled ? formatUSD(t.netCents) : "—"} mono />
          <Row
            label="Settled"
            value={t.usdcMicro > 0 ? formatUSDC(t.usdcMicro) : "—"}
            mono
            strong
          />
          {t.walletAddress && t.network && (
            <Row
              label={settled ? "Settled to" : "Wallet"}
              value={`${networkLabel(t.network)} · ${shortAddress(t.walletAddress)}`}
              mono
            />
          )}
        </dl>
      </Card>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wider text-faint">
          Details
        </h3>
        <dl className="mt-1 divide-y divide-line">
          <Row label="Customer" value={t.customer} />
          <Row label="Description" value={t.description} />
          <Row
            label="Method"
            value={describeMethod(t.method, t.brand, t.last4)}
            mono
          />
          <Row label="Created" value={formatDateTime(t.createdAt)} mono />
          <Row label="Transaction ID" value={t.id} mono />
        </dl>
      </section>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wider text-faint">
          Timeline
        </h3>
        <ol className="mt-3 space-y-4">
          {steps.map((s, i) => (
            <li key={s.label} className="relative flex gap-3">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-1.25 top-4 h-[calc(100%+0.25rem)] w-px bg-hover"
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative mt-1.5 size-2.75 shrink-0 rounded-full",
                  DOT[s.state],
                )}
              />
              <div>
                <p className="text-sm">{s.label}</p>
                {s.at && (
                  <p className="num text-xs text-faint">
                    {formatDateTime(s.at)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
