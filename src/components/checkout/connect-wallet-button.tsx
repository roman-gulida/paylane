"use client";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { base, mainnet, solana } from "@reown/appkit/networks";
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { OptionsController } from "@reown/appkit-controllers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Unplug, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WagmiProvider } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  shortAddress,
  type Network,
  type SettlementWallet,
} from "@/lib/wallet";

/**
 * WalletConnect through Reown AppKit: one modal for EVM wallets (Base, Ethereum)
 * and Solana wallets. This file is only ever loaded in the browser, on demand
 * (see connect-wallet.tsx), because the wallet libraries are large.
 *
 * It only reads the connected address. Nothing is signed and nothing is sent.
 */

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base, mainnet],
});

createAppKit({
  projectId,
  adapters: [wagmiAdapter, new SolanaAdapter()],
  networks: [base, mainnet, solana],
  metadata: {
    name: "Paylane (demo)",
    description: "Demo payment gateway. Reads your address only",
    url: window.location.origin,
    icons: [],
  },
  enableCoinbase: false,
  themeMode: "dark",
  themeVariables: { "--w3m-accent": "#2DB7FF" },
  features: { analytics: false, email: false, socials: false },
});

// createAppKit forwards `enableCoinbase` but not `enableBaseAccount` (as of
// @reown/appkit 1.8.24), so the Base Account connector would still start and
// load Coinbase's analytics script. Setting it directly, before the adapter
// adds its connectors, switches it off. Safe to remove once Reown forwards it
OptionsController.setEnableBaseAccount(false);

const queryClient = new QueryClient();

/** "eip155:8453:0xabc…" => the wallet on one of our three networks, or null */
function toSettlementWallet(
  caipAddress: string | undefined,
): SettlementWallet | null {
  if (!caipAddress) return null;
  const [namespace, chainId, address] = caipAddress.split(":");
  if (!address) return null;
  let network: Network | null = null;
  if (namespace === "solana") network = "solana";
  else if (namespace === "eip155" && chainId === String(base.id))
    network = "base";
  else if (namespace === "eip155" && chainId === String(mainnet.id))
    network = "ethereum";
  return network ? { address, network } : null;
}

function ConnectButton({
  onConnected,
  onDisconnected,
}: {
  onConnected: (wallet: SettlementWallet) => void;
  onDisconnected: (address: string) => void;
}) {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { caipAddress, isConnected } = useAppKitAccount();
  const wallet = isConnected ? toSettlementWallet(caipAddress) : null;
  const address = wallet?.address;
  const network = wallet?.network;

  // Only fill the form after the visitor presses the button. A wallet that was
  // connected on an earlier visit must not silently change the form
  const waiting = useRef(false);
  const [attempted, setAttempted] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    if (!waiting.current || !address || !network) return;
    waiting.current = false;
    onConnected({ address, network });
  }, [address, network, onConnected]);

  function handleClick() {
    setAttempted(true);
    if (address && network) {
      onConnected({ address, network });
      return;
    }
    waiting.current = true;
    void open({ view: "Connect" });
  }

  async function handleDisconnect() {
    const previous = address;
    setDisconnecting(true);
    waiting.current = false;
    try {
      await disconnect();
      if (previous) onDisconnected(previous);
      setAttempted(false);
    } catch {
      // The wallet refused or the session was already gone. Nothing to undo
    } finally {
      setDisconnecting(false);
    }
  }

  // Connected, but on a chain the demo does not settle to
  const unsupported = attempted && isConnected && !wallet;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleClick}>
        <Wallet aria-hidden className="size-4" />
        {address ? (
          <>
            Connected{" "}
            <span className="num text-muted">{shortAddress(address)}</span>
          </>
        ) : (
          "Connect wallet"
        )}
      </Button>
      {isConnected && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={disconnecting}
        >
          <Unplug aria-hidden className="size-4" />
          {disconnecting ? "Disconnecting…" : "Disconnect"}
        </Button>
      )}
      {unsupported && (
        <p role="alert" className="basis-full text-xs text-failed">
          Switch your wallet to Base, Ethereum or Solana, then try again.
        </p>
      )}
    </>
  );
}

export default function ConnectWalletButton({
  onConnected,
  onDisconnected,
}: {
  onConnected: (wallet: SettlementWallet) => void;
  onDisconnected: (address: string) => void;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectButton
          onConnected={onConnected}
          onDisconnected={onDisconnected}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
