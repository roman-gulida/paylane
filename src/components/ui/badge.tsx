import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { TransactionStatus } from "@/lib/types";

const TONES: Record<TransactionStatus, string> = {
  succeeded: "bg-success/15 text-success",
  pending: "bg-pending/15 text-pending",
  failed: "bg-failed/15 text-failed",
  refunded: "bg-refunded/15 text-refunded",
};

const LABELS: Record<TransactionStatus, string> = {
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

export function StatusBadge({
  status,
  className,
  ...props
}: ComponentProps<"span"> & { status: TransactionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONES[status],
        className,
      )}
      {...props}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}

/** Neutral pill for tags like "Demo mode" */
export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-raised px-2.5 py-1 text-xs font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}
