"use client";

export type TxResult =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; hash: string }
  | { status: "error"; message: string; details?: string };

interface TxStatusProps {
  result: TxResult;
}

export function TxStatus({ result }: TxStatusProps) {
  if (result.status === "idle") {
    return null;
  }

  if (result.status === "pending") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-300">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
        Submitting transaction...
      </div>
    );
  }

  if (result.status === "success") {
    const truncatedHash = `${result.hash.slice(0, 8)}...${result.hash.slice(-8)}`;
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-300">
        <p className="font-medium">Transaction successful</p>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span>{truncatedHash}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(result.hash)}
            className="text-cyan-400 transition-colors hover:text-cyan-200"
          >
            Copy
          </button>
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-xs font-medium text-cyan-400 underline transition-colors hover:text-cyan-200"
        >
          View on stellar.expert
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-pink-500/40 bg-pink-500/10 p-3 text-sm text-pink-300">
      <p>{result.message}</p>
      {result.details && (
        <details className="text-xs text-pink-400">
          <summary className="cursor-pointer">Details</summary>
          <pre className="mt-1 whitespace-pre-wrap break-all">{result.details}</pre>
        </details>
      )}
    </div>
  );
}
