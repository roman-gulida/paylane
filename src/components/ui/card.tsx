import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** `surface` sits on the page background; `raised` sits on top of a surface */
export function Card({
  tone = "surface",
  className,
  ...props
}: ComponentProps<"div"> & { tone?: "surface" | "raised" }) {
  return (
    <div
      className={cn(
        "rounded-(--radius-card) p-5 sm:p-6",
        tone === "surface" ? "bg-surface shadow-(--shadow-card)" : "bg-raised",
        className,
      )}
      {...props}
    />
  );
}

/** Small muted label above a value, e.g. "USDC balance" */
export function CardLabel({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
