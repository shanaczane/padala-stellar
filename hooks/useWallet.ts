"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkFreighterInstalled,
  connectFreighter,
  FreighterError,
  TESTNET_NETWORK,
} from "@/lib/freighter";

export type WalletStatus =
  | { state: "checking" }
  | { state: "not-installed" }
  | { state: "disconnected" }
  | {
      state: "connected";
      address: string;
      network: string;
      networkPassphrase: string;
    };

interface UseWalletResult {
  status: WalletStatus;
  isWrongNetwork: boolean;
  isConnecting: boolean;
  connectError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): UseWalletResult {
  const [status, setStatus] = useState<WalletStatus>({ state: "checking" });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    checkFreighterInstalled()
      .then((installed) => {
        if (cancelled) return;
        setStatus(installed ? { state: "disconnected" } : { state: "not-installed" });
      })
      .catch(() => {
        if (cancelled) return;
        setStatus({ state: "not-installed" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setConnectError(null);
    setIsConnecting(true);
    try {
      const connection = await connectFreighter();
      setStatus({ state: "connected", ...connection });
    } catch (err) {
      setConnectError(err instanceof FreighterError ? err.message : "Failed to connect to Freighter");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Freighter has no programmatic session revoke; disconnect only clears app state.
  const disconnect = useCallback(() => {
    setConnectError(null);
    setStatus({ state: "disconnected" });
  }, []);

  const isWrongNetwork = status.state === "connected" && status.network !== TESTNET_NETWORK;

  return { status, isWrongNetwork, isConnecting, connectError, connect, disconnect };
}
