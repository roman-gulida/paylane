"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { amountToCents, sanitizeAmount } from "@/lib/amount";
import { cn } from "@/lib/cn";
import { calculateSettlement } from "@/lib/fees";
import { formatUSD, formatUSDC } from "@/lib/format";
import { DEMO_MERCHANT } from "@/lib/orders";
import {
  networkLabel,
  shortAddress,
  type SettlementWallet,
} from "@/lib/wallet";

const PRESETS = [50, 250, 1_000, 5_000];

export function OrderSummary({
  amountRaw,
  onAmountChange,
  cents,
  error,
  locked,
  wallet,
  onEditWallet,
}: {
  amountRaw: string;
  onAmountChange: (raw: string) => void;
  /** The amount shown and charged. Already clamped to the allowed range */
  cents: number;
  error?: string;
  /** True while processing or after payment: the amount can no longer change */
  locked: boolean;
  /** The saved settlement wallet, or null before one is chosen */
  wallet: SettlementWallet | null;
  /** Goes back to step 1 to pick another wallet */
  onEditWallet: () => void;
}) {
  const typedCents = amountToCents(amountRaw);
  const settlement = calculateSettlement(cents);

  return (
    <section
      aria-labelledby="order-title"
      className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-10 lg:flex lg:px-14 lg:py-8 short:py-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 -z-10 size-115 rounded-full bg-accent/10 blur-[110px]"
      />

      <div className="mx-auto w-full max-w-md lg:ml-auto lg:mr-0 lg:max-w-lg lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group -ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            <span className="sr-only">Back to Paylane home</span>
            <Logo className="text-lg" />
          </Link>
          <Badge>Demo mode · no real payments</Badge>
        </div>

        <div className="lg:my-auto">
          <div className="mt-10 flex items-center gap-3 lg:mt-0">
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-full bg-raised text-sm font-semibold text-accent"
            >
              B
            </span>
            <div>
              <h1 id="order-title" className="text-sm font-medium">
                Pay {DEMO_MERCHANT.name}
              </h1>
              <p className="text-xs text-faint">{DEMO_MERCHANT.description}</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted lg:mt-6">Amount due</p>
          <AnimatedNumber
            className="num mt-1 block text-5xl tracking-tight sm:text-6xl lg:text-5xl"
            value={cents}
            format={formatUSD}
          />

          <div className="mt-8 space-y-4 lg:mt-5 lg:space-y-3">
            <Input
              label="Choose an amount (USD)"
              mono
              className="lg:h-11"
              inputMode="decimal"
              autoComplete="off"
              value={amountRaw}
              onChange={(e) => onAmountChange(sanitizeAmount(e.target.value))}
              disabled={locked}
              error={error}
            />
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const selected = typedCents === p * 100;
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={locked}
                    aria-pressed={selected}
                    onClick={() => onAmountChange(String(p))}
                    className={cn(
                      "num h-9 cursor-pointer rounded-full px-4 text-sm transition-colors",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      selected
                        ? "bg-accent/15 text-accent ring-1 ring-accent/40"
                        : "bg-raised text-fg/80 not-disabled:hover:bg-hover not-disabled:hover:text-fg",
                    )}
                  >
                    {formatUSD(p * 100).replace(".00", "")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 rounded-(--radius-card) bg-surface p-5 shadow-(--shadow-card) lg:mt-6 lg:p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-faint">
              What {DEMO_MERCHANT.name} receives
            </p>
            <dl className="mt-3 divide-y divide-line text-sm">
              <div className="flex justify-between py-2.5 lg:py-2">
                <dt className="text-muted">Customer pays</dt>
                <dd className="num">{formatUSD(settlement.grossCents)}</dd>
              </div>
              <div className="flex justify-between py-2.5 lg:py-2">
                <dt className="text-muted">Paylane fee</dt>
                <dd className="num">- {formatUSD(settlement.feeCents)}</dd>
              </div>
              <div className="flex items-baseline justify-between py-2.5 lg:py-2">
                <dt className="text-muted">Settled in USDC</dt>
                <dd className="num text-base text-success">
                  {formatUSDC(settlement.usdcMicro)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-faint">
              {wallet ? (
                <>
                  Settles to{" "}
                  <span className="num text-muted">
                    {shortAddress(wallet.address)}
                  </span>{" "}
                  on {networkLabel(wallet.network)}. 1 USDC = 1 USD.{" "}
                  <button
                    type="button"
                    onClick={onEditWallet}
                    disabled={locked}
                    className="cursor-pointer text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                  >
                    Change wallet
                  </button>
                </>
              ) : (
                "Choose a settlement wallet to receive the USDC"
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
