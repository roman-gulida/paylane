"use client";

import { Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import type { SettlementWallet } from "@/lib/wallet";

export const WALLETCONNECT_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
);

const ConnectWalletButton = dynamic(() => import("./connect-wallet-button"), {
  ssr: false,
  loading: () => (
    <Button variant="secondary" size="sm" disabled>
      <Wallet aria-hidden className="size-4" />
      Connect wallet
    </Button>
  ),
});

export function ConnectWallet({
  onConnected,
  onDisconnected,
}: {
  onConnected: (wallet: SettlementWallet) => void;
  /** Called with the address that was just disconnected */
  onDisconnected: (address: string) => void;
}) {
  if (!WALLETCONNECT_ENABLED) return null;
  return (
    <ConnectWalletButton
      onConnected={onConnected}
      onDisconnected={onDisconnected}
    />
  );
}
