"use client";

import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { DEMO_MERCHANT } from "@/lib/orders";
import { walletStore } from "@/lib/wallet-store";
import {
  addressKind,
  demoWallet,
  NETWORKS,
  networkLabel,
  validateWalletAddress,
  type Network,
  type SettlementWallet,
} from "@/lib/wallet";
import { ConnectWallet, WALLETCONNECT_ENABLED } from "./connect-wallet";

/** Step 1: choose where the merchant receives the USDC */
export function WalletStep({
  initial,
  onContinue,
}: {
  /** The saved wallet, if there is one. The parent remounts this when it loads */
  initial: SettlementWallet | null;
  onContinue: (wallet: SettlementWallet) => void;
}) {
  const [address, setAddress] = useState(initial?.address ?? "");
  const [network, setNetwork] = useState<Network>(initial?.network ?? "base");
  const [error, setError] = useState<string>();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = validateWalletAddress(address, network);
    setError(message);
    if (message) {
      document.getElementById("pay-wallet")?.focus();
      return;
    }
    onContinue({ address: address.trim(), network });
  }

  function chooseNetwork(next: Network) {
    setNetwork(next);
    // Only re-check when there is already a message on screen
    if (error) setError(validateWalletAddress(address, next));
  }

  function fill(wallet: SettlementWallet) {
    setAddress(wallet.address);
    setNetwork(wallet.network);
    setError(undefined);
  }

  /** A connected wallet was disconnected: forget it here and in the saved settings */
  function handleDisconnected(disconnected: string) {
    setAddress((current) => (current.trim() === disconnected ? "" : current));
    setError(undefined);
    if (initial?.address === disconnected) walletStore.clear();
  }

  const solana = addressKind(network) === "solana";

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="wallet-title"
      className="mt-6 w-full lg:mt-5"
    >
      <h2
        id="wallet-title"
        className="text-xl font-semibold tracking-[-0.02em]"
      >
        Where should {DEMO_MERCHANT.name} receive the money?
      </h2>
      <p className="mt-2 text-sm text-muted">
        The customer pays by card. You are paid in USDC, sent to this wallet.
      </p>

      <fieldset className="mt-6 min-w-0">
        <legend className="mb-1.5 text-sm font-medium text-muted">
          Network
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {NETWORKS.map(({ id, label }) => (
            <label key={id} className="relative cursor-pointer">
              <input
                type="radio"
                name="network"
                value={id}
                checked={network === id}
                onChange={() => chooseNetwork(id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex h-12 items-center justify-center rounded-xl text-sm",
                  "bg-raised text-fg/80 ring-1 ring-transparent transition",
                  "hover:bg-hover hover:text-fg",
                  "peer-checked:bg-accent/10 peer-checked:text-accent peer-checked:ring-accent/50",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                )}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <Input
          id="pay-wallet"
          label="Wallet address"
          mono
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={solana ? "Solana address" : "0x…"}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (error) setError(validateWalletAddress(e.target.value, network));
          }}
          onBlur={() => {
            if (address) setError(validateWalletAddress(address, network));
          }}
          error={error}
          hint={`USDC on ${networkLabel(network)}. Double-check it: transfers can't be undone.`}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ConnectWallet onConnected={fill} onDisconnected={handleDisconnected} />
        <Button
          variant={WALLETCONNECT_ENABLED ? "ghost" : "secondary"}
          size="sm"
          onClick={() => fill(demoWallet(network))}
        >
          Use demo wallet
        </Button>
      </div>
      {process.env.NODE_ENV !== "production" && !WALLETCONNECT_ENABLED && (
        <p className="mt-2 text-xs text-faint">
          Dev note: WalletConnect is off. Add NEXT_PUBLIC_REOWN_PROJECT_ID to
          .env.local to enable the Connect wallet button.
        </p>
      )}

      <Button type="submit" size="lg" className="mt-5 w-full">
        Continue to payment
        <ArrowRight aria-hidden className="size-5" />
      </Button>

      <p className="mt-4 text-center text-xs text-faint">
        Demo only. No real funds move.
      </p>
    </form>
  );
}
