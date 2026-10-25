"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { deleteMyOrders } from "@/lib/live-orders";
import { networkLabel, shortAddress } from "@/lib/wallet";
import { useSettlementWallet, walletStore } from "@/lib/wallet-store";

/** Where the USDC goes, as chosen in step 1 of the checkout */
export function WalletCard({ className }: { className?: string }) {
  const wallet = useSettlementWallet();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
    } catch {
      // Clipboard blocked: the full address is still in the tooltip
    }
  }

  return (
    <div className={cn("rounded-xl bg-raised/60 p-3", className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-faint">
        Settlement wallet
      </p>
      {wallet ? (
        <>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="num text-sm" title={wallet.address}>
              {shortAddress(wallet.address)}
            </span>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy wallet address"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-fg"
            >
              {copied ? (
                <Check aria-hidden className="size-4 text-success" />
              ) : (
                <Copy aria-hidden className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            USDC on {networkLabel(wallet.network)}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <Link href="/pay" className="text-accent hover:underline">
              Change
            </Link>
            <button
              type="button"
              onClick={() => walletStore.clear()}
              className="cursor-pointer text-muted transition-colors hover:text-fg hover:underline"
            >
              Remove
            </button>
          </div>
          <span className="sr-only" role="status">
            {copied ? "Address copied" : ""}
          </span>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">
          None yet.{" "}
          <Link href="/pay" className="text-accent hover:underline">
            Choose one in checkout
          </Link>
        </p>
      )}
    </div>
  );
}

/** Removes your own payments and your saved wallet. Needs a second click */
export function ResetDemo({ className }: { className?: string }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);

  async function handleClick() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    walletStore.clear();
    // Only the payments this browser made are removed; other visitors keep theirs
    await deleteMyOrders();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "justify-start",
        armed &&
          "bg-failed/10 text-failed not-disabled:hover:bg-failed/15 not-disabled:hover:text-failed",
        className,
      )}
    >
      <RotateCcw aria-hidden className="size-4" />
      {armed ? "Click again to confirm" : "Reset demo"}
    </Button>
  );
}

/** Mobile and tablet: the sidebar's wallet and reset controls, at the end of the page */
export function MobileDemoFooter() {
  return (
    <div className="mx-auto mt-10 grid w-full max-w-6xl gap-3 px-4 pb-10 sm:grid-cols-2 sm:px-8 lg:hidden">
      <WalletCard />
      <div className="flex flex-col justify-end">
        <ResetDemo />
        <p className="mt-1 px-3 text-xs text-faint">
          Removes the payments you made and your saved wallet. Other
          visitors\u2019 payments stay.
        </p>
      </div>
    </div>
  );
}
