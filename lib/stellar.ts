import { Horizon, NotFoundError } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

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
