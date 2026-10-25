import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateSettlement } from "@/lib/fees";
import { formatUSD, formatUSDC, maskCard } from "@/lib/format";
import { transactions } from "@/lib/mock-data";
import type { TransactionStatus } from "@/lib/types";
import { TransactionsDemo } from "./transactions-demo";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false },
};

const SWATCHES = [
  { name: "bg", cls: "bg-bg", hex: "#0B0D12" },
  { name: "surface", cls: "bg-surface", hex: "#13161D" },
  { name: "raised", cls: "bg-raised", hex: "#1A1E27" },
  { name: "hover", cls: "bg-hover", hex: "#212632" },
  { name: "accent", cls: "bg-accent", hex: "#2DB7FF" },
  { name: "success", cls: "bg-success", hex: "#3DDC97" },
  { name: "pending", cls: "bg-pending", hex: "#F5B84B" },
  { name: "failed", cls: "bg-failed", hex: "#FF5C70" },
  { name: "refunded", cls: "bg-refunded", hex: "#8A93A6" },
];

const STATUSES: TransactionStatus[] = [
  "succeeded",
  "pending",
  "failed",
  "refunded",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-faint">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  const sample = calculateSettlement(24_999);

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <Badge>Internal</Badge>
      <h1 className="mt-3 text-3xl font-semibold">Paylane styleguide</h1>
      <p className="mt-2 max-w-xl text-muted">
        Every base component in every state. If it isn&apos;t here, it
        isn&apos;t part of the system yet.
      </p>

      <Section title="Logo">
        <Card className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
          <Logo className="text-5xl" />
          <Logo className="text-2xl" />
          <Logo className="text-base" />
        </Card>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s.name}>
              <div className={`${s.cls} h-16 rounded-xl ring-1 ring-line`} />
              <p className="mt-2 text-sm">{s.name}</p>
              <p className="num text-xs text-faint">{s.hex}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <Card className="space-y-3">
          <p className="text-4xl font-semibold">
            Accept cards. Settle in USDC.
          </p>
          <p className="text-xl">Section heading, DM Sans 20</p>
          <p>Body text, DM Sans 16. Merchants get paid in minutes, not days.</p>
          <p className="text-sm text-muted">Muted caption, DM Sans 14</p>
          <p className="num text-3xl">{formatUSDC(sample.usdcMicro)}</p>
          <p className="num text-sm text-muted">
            JetBrains Mono · tabular figures · 0123456789
          </p>
        </Card>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Primary large</Button>
          <Button>Primary</Button>
          <Button size="sm">Primary small</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button disabled>Primary disabled</Button>
          <Button variant="secondary" disabled>
            Secondary disabled
          </Button>
          <Button variant="ghost" disabled>
            Ghost disabled
          </Button>
        </div>
      </Section>

      <Section title="Status badges">
        <div className="flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
          <Badge>Demo mode</Badge>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" placeholder="you@company.com" />
          <Input
            label="Card number"
            mono
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            hint="Test card: 4242 4242 4242 4242"
          />
          <Input
            label="Expiry"
            mono
            defaultValue="01 / 20"
            error="This card has expired"
          />
          <Input label="Disabled" disabled defaultValue="Not editable" />
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardLabel>USDC balance</CardLabel>
            <p className="num mt-1 text-4xl">{formatUSDC(sample.usdcMicro)}</p>
            <p className="num mt-2 text-sm text-muted">
              {formatUSD(sample.grossCents)} − {formatUSD(sample.feeCents)} fee
            </p>
          </Card>
          <Card tone="raised">
            <CardLabel>Payment method</CardLabel>
            <p className="num mt-1">{maskCard("visa", "4242")}</p>
            <div className="mt-3">
              <StatusBadge status="succeeded" />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Loading skeletons">
        <Card className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-40" />
        </Card>
      </Section>

      <Section title="Empty state">
        <Card>
          <EmptyState
            icon={Inbox}
            title="No payments yet"
            description="Payments will show up here as soon as your first customer pays."
            action={<Button variant="secondary">Open the demo checkout</Button>}
          />
        </Card>
      </Section>

      <Section title="Transactions: filters, table, drawer">
        <TransactionsDemo transactions={transactions} />
      </Section>
    </main>
  );
}
