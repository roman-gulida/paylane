"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  amountToCents,
  MAX_AMOUNT_CENTS,
  MIN_AMOUNT_CENTS,
  sanitizeAmount,
} from "@/lib/amount";
import { cn } from "@/lib/cn";
import { calculateSettlement } from "@/lib/fees";
import { formatPercent, formatUSD, formatUSDC } from "@/lib/format";
import { FEE_LABEL } from "./fee-label";

const MIN_DOLLARS = MIN_AMOUNT_CENTS / 100;
const MAX_DOLLARS = MAX_AMOUNT_CENTS / 100;
const SLIDER_MAX = 5_000;
const PRESETS = [50, 250, 1_000, 5_000];

export function Calculator() {
  const [raw, setRaw] = useState("1000");

  const typedCents = amountToCents(raw);
  const error =
    typedCents < MIN_DOLLARS * 100
      ? `Minimum payment is ${formatUSD(MIN_DOLLARS * 100)} in this demo.`
      : typedCents > MAX_DOLLARS * 100
        ? `Maximum payment is ${formatUSD(MAX_DOLLARS * 100)} in this demo.`
        : undefined;

  // While the input is invalid, keep showing a sensible clamped result
  const cents = Math.min(
    MAX_DOLLARS * 100,
    Math.max(MIN_DOLLARS * 100, typedCents),
  );
  const s = calculateSettlement(cents);
  const netShare = (s.netCents / s.grossCents) * 100;

  return (
    <section
      id="calculator"
      aria-labelledby="calc-title"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6 lg:py-28"
    >
      <Reveal>
        <p className="text-sm font-medium text-accent">Calculator</p>
        <h2
          id="calc-title"
          className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          See exactly what you&apos;d receive
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Pick a payment amount. The fee is {FEE_LABEL}, and the rest settles to
          you in USDC.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <Card className="grid gap-10 p-6 sm:p-8 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-6">
            <Input
              label="Payment amount (USD)"
              mono
              inputMode="decimal"
              autoComplete="off"
              value={raw}
              onChange={(e) => setRaw(sanitizeAmount(e.target.value))}
              error={error}
              hint={error ? undefined : "Type an amount or use the slider"}
            />

            <div>
              <label htmlFor="amount-slider" className="sr-only">
                Payment amount slider
              </label>
              <input
                id="amount-slider"
                type="range"
                min={MIN_DOLLARS}
                max={SLIDER_MAX}
                step={5}
                value={Math.min(
                  SLIDER_MAX,
                  Math.max(MIN_DOLLARS, Math.round(typedCents / 100)),
                )}
                onChange={(e) => setRaw(e.target.value)}
                className="h-2 w-full cursor-pointer accent-accent"
              />
              <div className="num mt-1 flex justify-between text-xs text-faint">
                <span>{formatUSD(MIN_DOLLARS * 100)}</span>
                <span>{formatUSD(SLIDER_MAX * 100)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const selected = typedCents === p * 100;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRaw(String(p))}
                    className={cn(
                      "num h-9 cursor-pointer rounded-full px-4 text-sm transition-colors",
                      selected
                        ? "bg-accent/15 text-accent ring-1 ring-accent/40"
                        : "bg-raised text-fg/80 hover:bg-hover hover:text-fg",
                    )}
                  >
                    {formatUSD(p * 100).replace(".00", "")}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            aria-live="polite"
            className={cn("transition-opacity", error && "opacity-60")}
          >
            <p className="text-sm text-muted">You receive</p>
            <AnimatedNumber
              className="num mt-1 block text-4xl sm:text-5xl"
              value={s.usdcMicro}
              format={formatUSDC}
            />

            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-raised">
              <motion.div
                className="h-full rounded-full bg-success"
                animate={{ width: `${netShare}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <dl className="mt-6 divide-y divide-line text-sm">
              <div className="flex justify-between py-3">
                <dt className="text-muted">Customer pays</dt>
                <dd className="num">
                  <AnimatedNumber value={s.grossCents} format={formatUSD} />
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">Paylane fee</dt>
                <dd className="num">
                  - <AnimatedNumber value={s.feeCents} format={formatUSD} />
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">Effective fee rate</dt>
                <dd className="num">
                  {formatPercent(s.feeCents / s.grossCents, 2)}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
