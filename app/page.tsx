"use client";

import { WalletCard } from "@/components/WalletCard";
import { BalanceCard } from "@/components/BalanceCard";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const { status, isWrongNetwork, connectError, connect, disconnect } = useWallet();

  const showBalance = status.state === "connected" && !isWrongNetwork;

  return (
    <div className="flex flex-1 items-start justify-center bg-zinc-950 px-4 py-16">
      <main className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold text-zinc-50">Padala</h1>
        <WalletCard
          status={status}
          isWrongNetwork={isWrongNetwork}
          connectError={connectError}
          onConnect={connect}
          onDisconnect={disconnect}
        />
        {showBalance && <BalanceCard address={status.address} />}
      </main>
    </div>
  );
}
