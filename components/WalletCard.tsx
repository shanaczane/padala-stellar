"use client";

import type { WalletStatus } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";

interface WalletCardProps {
  status: WalletStatus;
  isWrongNetwork: boolean;
  connectError: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletCard({
  status,
  isWrongNetwork,
  connectError,
  onConnect,
  onDisconnect,
}: WalletCardProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">
        Wallet
      </h2>

      {status.state === "checking" && (
        <p className="text-sm text-zinc-400">Checking for Freighter...</p>
      )}

      {status.state === "not-installed" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-400">Freighter extension not detected.</p>
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-fit rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
          >
            Install Freighter
          </a>
        </div>
      )}

      {status.state === "disconnected" && (
        <div className="flex flex-col gap-3">
          <button
            onClick={onConnect}
            className="w-fit rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
          >
            Connect Wallet
          </button>
          {connectError && <p className="text-sm text-pink-400">{connectError}</p>}
        </div>
      )}

      {status.state === "connected" && (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm text-zinc-100">{truncateAddress(status.address)}</p>

          {isWrongNetwork ? (
            <div className="rounded-lg border border-pink-500/40 bg-pink-500/10 p-3 text-sm text-pink-300">
              Switch Freighter to Testnet. Open the Freighter extension, select the
              network dropdown, and choose &quot;Test Net&quot;.
            </div>
          ) : (
            <span className="w-fit rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-400">
              Testnet
            </span>
          )}

          <button
            onClick={onDisconnect}
            className="w-fit rounded-full border border-pink-500/40 px-4 py-2 text-sm font-medium text-pink-400 transition-colors hover:bg-pink-500/10"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
