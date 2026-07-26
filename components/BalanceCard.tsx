"use client";

import { useEffect } from "react";
import { useBalance } from "@/hooks/useBalance";

interface BalanceCardProps {
  address: string;
}

export function BalanceCard({ address }: BalanceCardProps) {
  const { state, isLoading, isFunding, refresh, fund } = useBalance();

  useEffect(() => {
    refresh(address);
  }, [address, refresh]);

  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">Balance</h2>
        <button
          onClick={() => refresh(address)}
          disabled={isLoading}
          className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300 disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {state.state === "idle" && <p className="text-sm text-zinc-400">Loading balance...</p>}

      {state.state === "unfunded" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-400">Not funded yet</p>
          <button
            onClick={() => fund(address)}
            disabled={isFunding}
            className="w-fit rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
          >
            {isFunding ? "Funding..." : "Fund with Friendbot"}
          </button>
        </div>
      )}

      {state.state === "loaded" && (
        <p className="font-mono text-2xl text-zinc-50">
          {Number(state.balance).toFixed(2)} <span className="text-sm text-zinc-400">XLM</span>
        </p>
      )}

      {state.state === "error" && <p className="text-sm text-pink-400">{state.message}</p>}
    </div>
  );
}
