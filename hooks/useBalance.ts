"use client";

import { useCallback, useState } from "react";
import { fetchXlmBalance, fundWithFriendbot, StellarError } from "@/lib/stellar";

export type BalanceState =
  | { state: "idle" }
  | { state: "unfunded" }
  | { state: "loaded"; balance: string }
  | { state: "error"; message: string };

interface UseBalanceResult {
  state: BalanceState;
  isLoading: boolean;
  isFunding: boolean;
  refresh: (address: string) => Promise<void>;
  fund: (address: string) => Promise<void>;
}

export function useBalance(): UseBalanceResult {
  const [state, setState] = useState<BalanceState>({ state: "idle" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const refresh = useCallback(async (address: string) => {
    setIsLoading(true);
    try {
      const balance = await fetchXlmBalance(address);
      setState(balance === null ? { state: "unfunded" } : { state: "loaded", balance });
    } catch (err) {
      setState({
        state: "error",
        message: err instanceof StellarError ? err.message : "Failed to fetch balance",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fund = useCallback(
    async (address: string) => {
      setIsFunding(true);
      try {
        await fundWithFriendbot(address);
        await refresh(address);
      } catch (err) {
        setState({
          state: "error",
          message: err instanceof StellarError ? err.message : "Friendbot funding failed",
        });
      } finally {
        setIsFunding(false);
      }
    },
    [refresh],
  );

  return { state, isLoading, isFunding, refresh, fund };
}
