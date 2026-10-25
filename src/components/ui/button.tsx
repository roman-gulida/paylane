import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

/**
 * Hover and press effects use `not-disabled:` (not `enabled:`) so the same
 * styles work on <button> and on <a>, while a disabled button never reacts.
 * Only the primary button lifts: it is the one action per screen that matters.
 */
const VARIANTS: Record<Variant, string> = {
  primary: [
    "bg-accent text-accent-ink",
    "not-disabled:hover:-translate-y-0.5 not-disabled:hover:bg-accent-hover",
    "not-disabled:hover:shadow-[0_10px_24px_-8px_rgba(45,183,255,0.6)]",
    "not-disabled:active:translate-y-0 not-disabled:active:scale-[0.98] not-disabled:active:shadow-none",
  ].join(" "),
  secondary: "bg-raised text-fg not-disabled:hover:bg-hover",
  ghost:
    "bg-transparent text-fg/80 not-disabled:hover:bg-raised not-disabled:hover:text-fg",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function buttonStyles(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "cursor-pointer select-none",
    "transition-[transform,box-shadow,background-color,color] duration-150 ease-out",
    // Disabled: a flat, clearly "off" surface with readable text (not just dimmed)
    "disabled:cursor-not-allowed disabled:bg-hover disabled:text-muted",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, size, className)}
      {...props}
    />
  );
}

/** A navigation link that looks like a button */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />;
}
