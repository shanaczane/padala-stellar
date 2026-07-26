"use client";

import { useEffect } from "react";
import { WalletCard } from "@/components/WalletCard";
import { BalanceCard } from "@/components/BalanceCard";
import { SendForm } from "@/components/SendForm";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";

export default function Home() {
  const { status, isWrongNetwork, isConnecting, connectError, connect, disconnect } = useWallet();
  const balance = useBalance();

  const address = status.state === "connected" ? status.address : null;
  const networkPassphrase = status.state === "connected" ? status.networkPassphrase : null;
  const isConnectedOnTestnet = status.state === "connected" && !isWrongNetwork;

  useEffect(() => {
    if (isConnectedOnTestnet && address) {
      balance.refresh(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnectedOnTestnet, address]);

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-16">
      <main className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold text-slate-50">Padala</h1>

        <WalletCard
          status={status}
          isWrongNetwork={isWrongNetwork}
          isConnecting={isConnecting}
          connectError={connectError}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {isConnectedOnTestnet && address && (
          <BalanceCard
            state={balance.state}
            isLoading={balance.isLoading}
            isFunding={balance.isFunding}
            onRefresh={() => balance.refresh(address)}
            onFund={() => balance.fund(address)}
          />
        )}

        {isConnectedOnTestnet && address && networkPassphrase && balance.state.state === "loaded" && (
          <SendForm
            address={address}
            balance={balance.state.balance}
            networkPassphrase={networkPassphrase}
            onSuccess={() => balance.refresh(address)}
          />
        )}
      </main>
    </div>
  );
}
