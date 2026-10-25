"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { calculateSettlement } from "@/lib/fees";
import { formatUSD, formatUSDC } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { FEE_LABEL } from "./fee-label";

const SAMPLE = calculateSettlement(10_000);
const NET_SHARE = (SAMPLE.netCents / SAMPLE.grossCents) * 100;

const STEPS = [
  {
    title: "Your customer pays by card",
    body: "Visa, Mastercard, Apple Pay or Google Pay, on a checkout that works on any device.",
  },
  {
    title: "Paylane takes one clear fee",
    body: `${FEE_LABEL} per successful payment. You see the exact amount before and after, never a surprise.`,
  },
  {
    title: "USDC lands in your balance",
    body: "The net amount settles in USDC and shows up in your dashboard, ready to use.",
  },
];

/** The picture for each step. Bars and numbers animate when they scroll into view */
function StepVisual({ index }: { index: number }) {
  const reduce = usePrefersReducedMotion();

  if (index === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          Checkout
        </p>
        <div className="rounded-xl bg-raised p-4">
          <p className="text-xs text-faint">Card number</p>
          <p className="num mt-1">4242 4242 4242 4242</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-raised p-4">
            <p className="text-xs text-faint">Expiry</p>
            <p className="num mt-1">12 / 30</p>
          </div>
          <div className="rounded-xl bg-raised p-4">
            <p className="text-xs text-faint">CVC</p>
            <p className="num mt-1">•••</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge>Apple Pay</Badge>
          <Badge>Google Pay</Badge>
        </div>
        <motion.div
          className="flex h-12 items-center justify-center rounded-full bg-accent font-medium text-accent-ink"
          animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          Pay {formatUSD(SAMPLE.grossCents)}
        </motion.div>
      </div>
    );
  }

  if (index === 1) {
    const rows = [
      {
        label: "Payment",
        value: formatUSD(SAMPLE.grossCents),
        width: 100,
        tone: "bg-hover",
      },
      {
        label: "Paylane fee",
        value: `- ${formatUSD(SAMPLE.feeCents)}`,
        width: 100 - NET_SHARE,
        tone: "bg-accent",
      },
      {
        label: "You keep",
        value: formatUSD(SAMPLE.netCents),
        width: NET_SHARE,
        tone: "bg-success",
      },
    ];
    return (
      <div className="space-y-5">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          Fee breakdown
        </p>
        {rows.map((r, i) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted">{r.label}</span>
              <span className="num">{r.value}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-raised">
              {/* Full width in the HTML; grows from the left once on screen */}
              <Reveal
                from="scaleX(0)"
                origin="0 50%"
                delay={0.15 * i}
                animateOnMount
                className="h-full"
              >
                <div
                  className={cn("h-full rounded-full", r.tone)}
                  style={{ width: `${r.width}%` }}
                />
              </Reveal>
            </div>
          </div>
        ))}
        <p className="num text-xs text-faint">
          {FEE_LABEL} = {formatUSD(SAMPLE.feeCents)} on{" "}
          {formatUSD(SAMPLE.grossCents)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-faint">
        USDC balance
      </p>
      <p className="num text-4xl sm:text-5xl">{formatUSDC(SAMPLE.usdcMicro)}</p>
      <Reveal
        from="scale(0.85)"
        origin="0 50%"
        delay={0.2}
        animateOnMount
        className="w-fit"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-sm font-medium text-success">
          <Check aria-hidden className="size-4" />
          Settled
        </span>
      </Reveal>
      <p className="text-sm text-muted">
        Available in your dashboard as soon as the payment succeeds.
      </p>
    </div>
  );
}

export function HowItWorks() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(
      Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))),
    );
  });

  return (
    <section
      id="how-it-works"
      ref={ref}
      aria-labelledby="how-title"
      className="relative scroll-mt-16 md:h-[300vh]"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:py-0">
        <p className="text-sm font-medium text-accent">How it works</p>
        <h2
          id="how-title"
          className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          From card to USDC in three steps
        </h2>

        {/* Desktop: sticky, the picture changes as you scroll */}
        <div className="mt-12 hidden gap-12 md:grid md:grid-cols-[1fr_1.05fr]">
          <div className="relative pl-8">
            <div
              aria-hidden
              className="absolute bottom-1 left-0 top-1 w-px bg-hover"
            />
            <motion.div
              aria-hidden
              style={{ scaleY: reduce ? 1 : fill, transformOrigin: "top" }}
              className="absolute bottom-1 left-0 top-1 w-px bg-accent"
            />
            <ol className="space-y-9">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  aria-current={step === i ? "step" : undefined}
                  className={cn(
                    "transition-opacity duration-300",
                    step === i ? "opacity-100" : "opacity-40",
                  )}
                >
                  <p className="num text-xs text-accent">0{i + 1}</p>
                  <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1.5 max-w-sm text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <Card className="min-h-90 p-7">
            {/* initial={false}: the first step is visible in the server HTML; only later steps animate in */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -16 }}
                transition={{ duration: 0.28 }}
              >
                <StepVisual index={step} />
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>

        {/* Mobile: a plain stack, no pinned scrolling */}
        <ol className="mt-10 space-y-6 md:hidden">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <p className="num text-xs text-accent">0{i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-muted">{s.body}</p>
              <Card tone="raised" className="mt-4">
                <StepVisual index={i} />
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
