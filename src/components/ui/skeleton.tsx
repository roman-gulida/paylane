import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Loading placeholder. Give it the size of the content it stands in for */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-raised", className)}
      {...props}
    />
  );
}
