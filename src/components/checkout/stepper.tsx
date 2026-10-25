import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type Step = "wallet" | "payment";

function Dot({ state, n }: { state: "current" | "done" | "todo"; n: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
        state === "current" && "bg-accent text-accent-ink",
        state === "done" && "bg-success/15 text-success",
        state === "todo" && "bg-raised text-faint",
      )}
    >
      {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : n}
    </span>
  );
}

/**
 * Two steps: where the money lands, then how the customer pays.
 * Once the wallet is set, step 1 turns into a button that goes back to edit it
 */
export function Stepper({
  step,
  onEditWallet,
  disabled,
}: {
  step: Step;
  onEditWallet: () => void;
  disabled?: boolean;
}) {
  const walletDone = step === "payment";
  return (
    <nav aria-label="Checkout steps">
      <ol className="flex items-center gap-3 text-sm">
        <li>
          {walletDone ? (
            <button
              type="button"
              onClick={onEditWallet}
              disabled={disabled}
              aria-label="Step 1, wallet. Edit"
              className="group inline-flex cursor-pointer items-center gap-2 text-muted transition-colors not-disabled:hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Dot state="done" n={1} />
              <span className="group-hover:underline group-hover:underline-offset-4">
                Wallet
              </span>
            </button>
          ) : (
            <span
              aria-current="step"
              className="inline-flex items-center gap-2 font-medium"
            >
              <Dot state="current" n={1} />
              Wallet
            </span>
          )}
        </li>
        <li aria-hidden className="h-px flex-1 bg-hover" />
        <li>
          <span
            aria-current={walletDone ? "step" : undefined}
            className={cn(
              "inline-flex items-center gap-2",
              walletDone ? "font-medium" : "text-faint",
            )}
          >
            <Dot state={walletDone ? "current" : "todo"} n={2} />
            Payment
          </span>
        </li>
      </ol>
    </nav>
  );
}
