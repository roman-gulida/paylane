"use client";

import { motion, useInView, type Transition } from "framer-motion";
import { Check, CreditCard } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { calculateSettlement } from "@/lib/fees";
import { formatUSD, formatUSDC } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { FEE_LABEL } from "./fee-label";

const SAMPLE = calculateSettlement(10_000);

/**
 * The loop: 0 = idle, 1 = customer pays, 2 = fee, 3 = USDC lands (then back to 0).
 * Every tile is always in the layout, so nothing jumps when a phase changes
 */
const PHASE_MS = [700, 1500, 1700, 3600];
const LAST_PHASE = 3;
/** How long the finished picture is shown before the loop starts replaying it */
const START_DELAY_MS = 1400;

const SPRING: Transition = { type: "spring", stiffness: 220, damping: 22 };

function Tile({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.97 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl bg-surface p-4 shadow-(--shadow-card) ring-1 ring-line sm:p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-faint">
        {label}
      </p>
      {children}
    </motion.div>
  );
}

/** A thin line with a dot travelling down it while the next step is active */
function Connector({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="relative mx-auto h-7 w-px bg-hover">
      {active && (
        <motion.span
          className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(45,183,255,0.7)]"
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, ease: "easeIn" }}
        />
      )}
    </div>
  );
}

/** Small coins that pop out of the balance tile when the USDC lands */
function Coins() {
  return (
    <div aria-hidden className="pointer-events-none absolute right-6 top-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="absolute flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-ink"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 0],
            x: (i - 2) * 16,
            y: -34 - (i % 3) * 12,
            scale: 1,
          }}
          transition={{ duration: 1.1, delay: i * 0.07, ease: "easeOut" }}
        >
          $
        </motion.span>
      ))}
    </div>
  );
}

export function PaymentFlow() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });

  // The server HTML, no-JS visitors and reduced-motion visitors all get the
  // finished picture. The loop only starts once the card is on screen
  const [phase, setPhase] = useState(LAST_PHASE);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = setTimeout(
      () => {
        setPhase((p) => (live ? (p + 1) % PHASE_MS.length : 0));
        setLive(true);
      },
      live ? PHASE_MS[phase] : START_DELAY_MS,
    );
    return () => clearTimeout(id);
  }, [phase, live, inView, reduce]);

  const shown = reduce ? LAST_PHASE : phase;
  const animating = live && !reduce;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden
        className="glow-pulse absolute inset-x-8 top-1/4 -z-10 h-1/2 rounded-full bg-accent/25 blur-3xl"
      />

      <motion.div
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        role="img"
        aria-label={`Animated example: a customer pays ${formatUSD(
          SAMPLE.grossCents,
        )} by card, Paylane takes a ${formatUSD(
          SAMPLE.feeCents,
        )} fee, and ${formatUSDC(SAMPLE.usdcMicro)} settles to the merchant.`}
      >
        <Tile active={shown >= 1} label="Customer pays">
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-raised text-muted">
                <CreditCard aria-hidden className="size-5" />
              </span>
              <div>
                <p className="num text-sm">Visa •••• 4242</p>
                <p className="text-xs text-faint">
                  Card, Apple Pay or Google Pay
                </p>
              </div>
            </div>
            <p className="num text-xl">{formatUSD(SAMPLE.grossCents)}</p>
          </div>
        </Tile>

        <Connector active={animating && shown === 2} />

        <Tile active={shown >= 2} label="Paylane fee">
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted">{FEE_LABEL} per payment</p>
            <p className="num text-xl">− {formatUSD(SAMPLE.feeCents)}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-raised">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{
                width:
                  shown >= 2
                    ? `${(SAMPLE.netCents / SAMPLE.grossCents) * 100}%`
                    : "0%",
              }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-1.5 text-xs text-faint">
            {Math.round((SAMPLE.netCents / SAMPLE.grossCents) * 100)}% of the
            payment reaches you
          </p>
        </Tile>

        <Connector active={animating && shown === 3} />

        <div className="relative">
          <Tile active={shown >= 3} label="You receive">
            <div className="mt-3 flex items-center justify-between gap-4">
              <AnimatedNumber
                className="num text-3xl"
                value={shown >= 3 ? SAMPLE.usdcMicro : 0}
                format={formatUSDC}
                duration={1.1}
              />
              <motion.span
                className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success"
                initial={false}
                animate={{
                  opacity: shown >= 3 ? 1 : 0,
                  scale: shown >= 3 ? 1 : 0.8,
                }}
                transition={SPRING}
              >
                <Check aria-hidden className="size-3.5" />
                Settled
              </motion.span>
            </div>
          </Tile>
          {animating && shown === 3 && <Coins />}
        </div>
      </motion.div>
    </div>
  );
}
