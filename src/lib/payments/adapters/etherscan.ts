/**
 * EVM USDC transfer adapter — Etherscan V2 + Blockscout fallback
 * Ported from Python etherscan_v2.py
 *
 * Etherscan V2 free tier does not cover Base (8453) or Optimism (10).
 * Blockscout explorer APIs are Etherscan-compatible and work without a paid plan.
 */

interface EtherscanTransfer {
  txHash: string;
  amountAtomic: string;
  confirmations: number;
  timestamp: number;
}

interface EtherscanTokentxResponse {
  status: string;
  message: string;
  result: Array<{
    hash: string;
    value: string;
    confirmations: string;
    timeStamp: string;
    to: string;
  }> | string;
}

// chain_id -> Blockscout-compatible explorer API base (no key required)
const BLOCKSCOUT_EXPLORER_API: Record<number, string> = {
  8453: "https://base.blockscout.com/api",
  10: "https://optimism.blockscout.com/api",
};

async function httpGetJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "prg-payment-watcher/1.0",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function parseTokentxResponse(
  data: EtherscanTokentxResponse,
  depositAddress: string
): EtherscanTransfer[] | null {
  if (data.status !== "1" || !Array.isArray(data.result)) {
    return null;
  }
  const depositLower = depositAddress.toLowerCase();
  return data.result
    .filter((tx) => (tx.to || "").toLowerCase() === depositLower)
    .map((tx) => ({
      txHash: tx.hash,
      amountAtomic: String(tx.value || "0"),
      confirmations: parseInt(tx.confirmations || "0", 10),
      timestamp: parseInt(tx.timeStamp || "0", 10),
    }));
}

async function fetchBlockscoutTokentx(
  explorerApi: string,
  contract: string,
  depositAddress: string
): Promise<EtherscanTransfer[]> {
  const params = new URLSearchParams({
    module: "account",
    action: "tokentx",
    contractaddress: contract,
    address: depositAddress,
    page: "1",
    offset: "50",
    sort: "desc",
  });
  const url = `${explorerApi}?${params}`;
  try {
    const data = (await httpGetJson(url)) as EtherscanTokentxResponse;
    const transfers = parseTokentxResponse(data, depositAddress);
    return transfers ?? [];
  } catch (e) {
    console.error(`[blockscout] HTTP error ${explorerApi}:`, e);
    return [];
  }
}

async function fetchEtherscanV2Tokentx(
  chainId: number,
  contract: string,
  depositAddress: string,
  apiKey: string
): Promise<EtherscanTransfer[] | null> {
  const params = new URLSearchParams({
    chainid: String(chainId),
    module: "account",
    action: "tokentx",
    contractaddress: contract,
    address: depositAddress,
    page: "1",
    offset: "50",
    sort: "desc",
    apikey: apiKey,
  });
  const url = `https://api.etherscan.io/v2/api?${params}`;
  try {
    const data = (await httpGetJson(url)) as EtherscanTokentxResponse;
    return parseTokentxResponse(data, depositAddress);
  } catch (e) {
    console.error(`[etherscan] HTTP error chain=${chainId}:`, e);
    return null;
  }
}

export async function fetchUsdcTransfers(
  chainId: number,
  contract: string,
  depositAddress: string
): Promise<EtherscanTransfer[]> {
  const apiKey = process.env.ETHERSCAN_API_KEY ?? "";
  const blockscoutApi = BLOCKSCOUT_EXPLORER_API[chainId];

  // Try Blockscout first for chains it supports (Base, Optimism)
  if (blockscoutApi) {
    const transfers = await fetchBlockscoutTokentx(blockscoutApi, contract, depositAddress);
    if (transfers.length > 0) return transfers;
  }

  // Try Etherscan V2 if we have a key
  if (apiKey) {
    const transfers = await fetchEtherscanV2Tokentx(chainId, contract, depositAddress, apiKey);
    if (transfers) return transfers;
  }

  // Final fallback to Blockscout
  if (blockscoutApi) {
    return fetchBlockscoutTokentx(blockscoutApi, contract, depositAddress);
  }

  return [];
}
