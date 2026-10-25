"use client";

import { cn } from "@/lib/cn";

export interface PillOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Single-select filter. Plain buttons with aria-pressed, so it is keyboard
 * and screen-reader friendly without any extra library.
 */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group, e.g. "Filter by status" */
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium",
              "transition-colors duration-150",
              selected
                ? "bg-accent/15 text-accent ring-1 ring-accent/40"
                : "bg-surface text-fg/80 hover:bg-raised hover:text-fg",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cn(
                  "num text-xs",
                  selected ? "text-accent/80" : "text-faint",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
