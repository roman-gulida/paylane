"use client";

import {
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const MAX_TILT_DEG = 7;

/**
 * A card that leans toward the mouse and carries a soft light under the cursor.
 *
 * The outer element never moves, so the pointer position is measured against a
 * stable box (measuring the tilted element itself makes the effect jitter at
 * the edges). All visuals are CSS (.tilt in globals.css); this component only
 * writes four CSS variables. Touch and pen input are ignored on purpose.
 */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const card = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = card.current;
    if (!el || reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.dataset.tilt = "active";
    el.style.setProperty(
      "--rx",
      `${((0.5 - y) * 2 * MAX_TILT_DEG).toFixed(2)}deg`,
    );
    el.style.setProperty(
      "--ry",
      `${((x - 0.5) * 2 * MAX_TILT_DEG).toFixed(2)}deg`,
    );
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  }

  function onLeave() {
    const el = card.current;
    if (!el) return;
    delete el.dataset.tilt;
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  }

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="h-full"
      style={{ perspective: "900px" } as CSSProperties}
    >
      <div ref={card} className={cn("tilt h-full", className)}>
        {children}
      </div>
    </div>
  );
}
