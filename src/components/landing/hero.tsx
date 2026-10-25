"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  useEffect,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { FEE_LABEL } from "./fee-label";
import { PaymentFlow } from "./payment-flow";

const METHODS = ["Visa", "Mastercard", "Apple Pay", "Google Pay"];

// Entrance animations are plain CSS, not JavaScript, so the hero always ends up visible, even if scripts fail
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** One line of the headline, sliding up from behind a mask */
function HeadlineLine({
  children,
  seconds,
}: {
  children: ReactNode;
  seconds: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.12em]">
      <span className="line-up block" style={delay(seconds)}>
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  const reduce = usePrefersReducedMotion();

  // Play the entrance once per browser session. After it finishes, mark the page
  // as "seen" so nothing replays
  useEffect(() => {
    try {
      sessionStorage.setItem("pl-intro", "1");
    } catch {}
    const t = window.setTimeout(() => {
      document.documentElement.dataset.intro = "seen";
    }, 2200);
    return () => window.clearTimeout(t);
  }, []);

  // A soft azure glow that trails the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glowX = useSpring(mx, { stiffness: 50, damping: 20 });
  const glowY = useSpring(my, { stiffness: 50, damping: 20 });

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.18);
    my.set((e.clientY - r.top - r.height / 2) * 0.18);
  }

  return (
    <section
      onPointerMove={onPointerMove}
      className="relative overflow-x-clip pb-20 pt-12 sm:pt-16 lg:pb-28 lg:pt-24"
    >
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-1/2 top-0 -z-10 size-155 -translate-x-1/2 rounded-full bg-accent/15 blur-[130px]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <div className="rise" style={delay(0)}>
            <Badge>Demo product · no real payments</Badge>
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            <HeadlineLine seconds={0.05}>Accept cards.</HeadlineLine>
            <HeadlineLine seconds={0.18}>
              Settle in <span className="text-shimmer">USDC</span>
            </HeadlineLine>
          </h1>

          <p
            className="rise mt-6 max-w-lg text-lg text-muted"
            style={delay(0.45)}
          >
            Take Visa, Mastercard, Apple Pay and Google Pay at checkout, and
            receive the money in USDC. One visible fee: {FEE_LABEL} per
            successful payment.
          </p>

          <div className="rise mt-8 flex flex-wrap gap-3" style={delay(0.58)}>
            <ButtonLink href="/pay" size="lg">
              Try the demo
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
            <ButtonLink href="/dashboard" size="lg" variant="secondary">
              See the dashboard
            </ButtonLink>
          </div>

          <ul
            aria-label="Supported payment methods"
            className="rise mt-10 flex flex-wrap items-center gap-2"
            style={delay(0.7)}
          >
            {METHODS.map((m) => (
              <li
                key={m}
                className="rounded-full bg-surface px-3.5 py-1.5 text-sm text-muted ring-1 ring-line"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="rise-lg" style={delay(0.3)}>
          <PaymentFlow />
        </div>
      </div>
    </section>
  );
}
