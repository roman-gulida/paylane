"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

type InputProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
  /** Use the mono font for card numbers, amounts, IDs */
  mono?: boolean;
};

export function Input({
  label,
  hint,
  error,
  mono,
  className,
  id,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          "h-12 rounded-xl bg-raised px-4 text-fg placeholder:text-faint",
          "outline-none ring-1 ring-transparent transition",
          "hover:bg-hover focus:ring-accent",
          error && "ring-failed focus:ring-failed",
          "disabled:opacity-40",
          mono && "num",
          className,
        )}
        {...props}
      />
      {message && (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-failed" : "text-faint")}
        >
          {message}
        </p>
      )}
    </div>
  );
}
