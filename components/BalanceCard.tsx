"use client";

import type { BalanceState } from "@/hooks/useBalance";

interface BalanceCardProps {
  state: BalanceState;
  isLoading: boolean;
  isFunding: boolean;
  onRefresh: () => void;
  onFund: () => void;
}

export function BalanceCard({ state, isLoading, isFunding, onRefresh, onFund }: BalanceCardProps) {
  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">Balance</h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300 disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {state.state === "idle" && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          Loading balance...
        </div>
      )}

      {state.state === "unfunded" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-400">Not funded yet</p>
          <button
            onClick={onFund}
            disabled={isFunding}
            className="w-fit rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
          >
            {isFunding ? "Funding..." : "Fund with Friendbot"}
          </button>
        </div>
      )}

      {state.state === "loaded" && (
        <p className="font-mono text-2xl text-slate-50">
          {Number(state.balance).toFixed(2)} <span className="text-sm text-slate-400">XLM</span>
        </p>
      )}

      {state.state === "error" && <p className="text-sm text-pink-400">{state.message}</p>}
    </div>
  );
}
