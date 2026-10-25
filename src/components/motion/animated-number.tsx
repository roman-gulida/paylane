"use client";

import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Counts from the previous value to the new one. Works on integers
 * (cents, micro-USDC) so the displayed number is always a real amount.
 * The server and first render show the final value, so it reads correctly
 * even before scripts run.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.6,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(current.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        current.current = v;
        setDisplay(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span className={className}>{format(reduce ? value : display)}</span>;
}
