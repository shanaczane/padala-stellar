import {
  Asset,
  BASE_FEE,
  Horizon,
  NotFoundError,
  Operation,
  TransactionBuilder,
  TransactionFailedError,
} from "@stellar/stellar-sdk";
import { FreighterError } from "@/lib/freighter";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
export const RESERVE_BUFFER_XLM = 1.5;
export const MIN_CREATE_ACCOUNT_XLM = 1;

export const server = new Horizon.Server(HORIZON_URL);

export class StellarError extends Error {}

/** Returns the native XLM balance, or null if the account is unfunded (404). */
export async function fetchXlmBalance(address: string): Promise<string | null> {
  try {
    const account = await server.loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? native.balance : "0";
  } catch (err) {
    if (err instanceof NotFoundError) {
      return null;
    }
    throw new StellarError(err instanceof Error ? err.message : "Failed to fetch balance");
  }
}

export async function fundWithFriendbot(address: string): Promise<void> {
  const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`);
  if (!response.ok) {
    throw new StellarError("Friendbot funding failed");
  }
}

/** Balance minus the reserve + fee buffer; the max amount safe to send. */
export function getSpendableBalance(balance: string): number {
  const spendable = Number(balance) - RESERVE_BUFFER_XLM;
  return spendable > 0 ? spendable : 0;
}

async function accountExists(address: string): Promise<boolean> {
  try {
    await server.loadAccount(address);
    return true;
  } catch (err) {
    if (err instanceof NotFoundError) {
      return false;
    }
    throw new StellarError(
      err instanceof Error ? err.message : "Failed to look up destination account",
    );
  }
}

export async function buildPaymentXdr(params: {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  networkPassphrase: string;
}): Promise<string> {
  const { sourceAddress, destinationAddress, amount, networkPassphrase } = params;

  const sourceAccount = await server.loadAccount(sourceAddress);
  const destinationExists = await accountExists(destinationAddress);

  if (!destinationExists && Number(amount) < MIN_CREATE_ACCOUNT_XLM) {
    throw new StellarError(
      `This address has never received XLM. Sending it a first payment requires at least ${MIN_CREATE_ACCOUNT_XLM} XLM to create the account.`,
    );
  }

  const operation = destinationExists
    ? Operation.payment({ destination: destinationAddress, asset: Asset.native(), amount })
    : Operation.createAccount({ destination: destinationAddress, startingBalance: amount });

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();

  return transaction.toXDR();
}

export async function submitSignedTransaction(
  signedXdr: string,
  networkPassphrase: string,
): Promise<string> {
  const transaction = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const response = await server.submitTransaction(transaction);
  return response.hash;
}

export function describeTransactionError(err: unknown): { message: string; details?: string } {
  if (err instanceof TransactionFailedError) {
    const { transaction, operations } = err.getResultCodes();

    if (transaction === "tx_bad_seq") {
      return { message: "Sequence error, please retry" };
    }
    if (transaction === "tx_insufficient_balance" || operations.includes("op_underfunded")) {
      return { message: "Insufficient balance" };
    }
    if (operations.includes("op_no_destination")) {
      return { message: "Destination account does not exist" };
    }

    return {
      message: "Transaction failed",
      details: JSON.stringify({ transaction, operations }),
    };
  }

  if (err instanceof FreighterError) {
    return { message: "Transaction cancelled in wallet" };
  }

  if (err instanceof StellarError) {
    return { message: err.message };
  }

  return { message: "Something went wrong. Please try again." };
}
