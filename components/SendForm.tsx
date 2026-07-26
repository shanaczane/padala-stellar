"use client";

import { useState, type FormEvent } from "react";
import { StrKey } from "@stellar/stellar-sdk";
import { signWithFreighter } from "@/lib/freighter";
import {
  buildPaymentXdr,
  submitSignedTransaction,
  describeTransactionError,
  getSpendableBalance,
} from "@/lib/stellar";
import { sanitizeAmountInput } from "@/lib/format";
import { TxStatus, type TxResult } from "@/components/TxStatus";

interface SendFormProps {
  address: string;
  balance: string;
  networkPassphrase: string;
  onSuccess: () => void;
}

export function SendForm({ address, balance, networkPassphrase, onSuccess }: SendFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selfSendWarning, setSelfSendWarning] = useState(false);
  const [txResult, setTxResult] = useState<TxResult>({ status: "idle" });

  const spendable = getSpendableBalance(balance);
  const isSubmitting = txResult.status === "pending";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSelfSendWarning(false);

    const trimmedDestination = destination.trim();

    if (!StrKey.isValidEd25519PublicKey(trimmedDestination)) {
      setFormError("Enter a valid Stellar address");
      return;
    }

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setFormError("Enter an amount greater than 0");
      return;
    }

    if (amountNumber > spendable) {
      setFormError(`Amount exceeds spendable balance (${spendable.toFixed(7)} XLM)`);
      return;
    }

    if (trimmedDestination === address) {
      setSelfSendWarning(true);
    }

    setTxResult({ status: "pending" });

    try {
      const unsignedXdr = await buildPaymentXdr({
        sourceAddress: address,
        destinationAddress: trimmedDestination,
        amount,
        networkPassphrase,
      });

      const signedXdr = await signWithFreighter(unsignedXdr, networkPassphrase, address);
      const hash = await submitSignedTransaction(signedXdr, networkPassphrase);

      setTxResult({ status: "success", hash });
      setDestination("");
      setAmount("");
      onSuccess();
    } catch (err) {
      const { message, details } = describeTransactionError(err);
      setTxResult({ status: "error", message, details });
    }
  }

  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">Send XLM</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Destination address
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            disabled={isSubmitting}
            placeholder="G..."
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Amount (XLM)
          <input
            value={amount}
            onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))}
            disabled={isSubmitting}
            placeholder="0.00"
            inputMode="decimal"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 disabled:opacity-50"
          />
        </label>
        <p className="text-xs text-zinc-500">Spendable: {spendable.toFixed(2)} XLM</p>

        {selfSendWarning && (
          <p className="text-sm text-amber-400">Heads up: this is your own address.</p>
        )}
        {formError && <p className="text-sm text-pink-400">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Send"}
        </button>
      </form>

      <div className="mt-4">
        <TxStatus result={txResult} />
      </div>
    </div>
  );
}
