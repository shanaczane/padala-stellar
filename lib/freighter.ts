import { isConnected, requestAccess, getNetwork, signTransaction } from "@stellar/freighter-api";

export const TESTNET_NETWORK = "TESTNET";

export class FreighterError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "FreighterError";
    this.code = code;
  }
}

export interface WalletConnection {
  address: string;
  network: string;
  networkPassphrase: string;
}

export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  if (result.error) {
    throw new FreighterError(result.error.message, result.error.code);
  }
  return result.isConnected;
}

export async function fetchNetwork(): Promise<{
  network: string;
  networkPassphrase: string;
}> {
  const result = await getNetwork();
  if (result.error) {
    throw new FreighterError(result.error.message, result.error.code);
  }
  return { network: result.network, networkPassphrase: result.networkPassphrase };
}

export async function connectFreighter(): Promise<WalletConnection> {
  const access = await requestAccess();
  if (access.error) {
    throw new FreighterError(access.error.message, access.error.code);
  }

  const { network, networkPassphrase } = await fetchNetwork();

  return { address: access.address, network, networkPassphrase };
}

export async function signWithFreighter(
  xdr: string,
  networkPassphrase: string,
  address: string,
): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase, address });
  if (result.error) {
    throw new FreighterError(result.error.message, result.error.code);
  }
  return result.signedTxXdr;
}
