import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Logo({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      role="img"
      aria-label="Paylane"
      className={cn(
        "inline-flex items-baseline text-xl font-semibold tracking-[-0.04em] text-fg",
        className,
      )}
      {...props}
    >
      <span aria-hidden>paylane</span>
      <span aria-hidden className="ml-px text-accent">
        .
      </span>
    </span>
  );
}
