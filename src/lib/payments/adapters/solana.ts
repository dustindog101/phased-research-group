/**
 * Solana JSON-RPC adapter for native SOL and SPL USDC
 * Ported from Python solana_rpc.py
 *
 * Uses Helius (if HELIUS_API_KEY set) or public mainnet RPC as fallback.
 * Free tier: Helius 100k req/mo, public RPC rate-limited.
 */

interface SolanaTransfer {
  txHash: string;
  amountAtomic: string;
  confirmations: number;
  timestamp: number | null;
}

interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

function getRpcUrl(): string {
  const helius = process.env.HELIUS_API_KEY?.trim();
  if (helius) return `https://mainnet.helius-rpc.com/?api-key=${helius}`;
  return process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const res = await fetch(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Solana RPC HTTP ${res.status}`);
  const data = (await res.json()) as RpcResponse<T>;
  if (data.error) throw new Error(`Solana RPC error: ${JSON.stringify(data.error)}`);
  if (!data.result) throw new Error("Solana RPC: no result");
  return data.result;
}

interface SignatureInfo {
  signature: string;
  blockTime?: number | null;
  confirmationStatus?: "processed" | "confirmed" | "finalized";
}

interface TxMeta {
  meta: {
    preBalances?: number[];
    postBalances?: number[];
    preTokenBalances?: Array<{
      accountIndex: number;
      mint: string;
      owner: string;
      uiTokenAmount: { amount: string };
    }>;
    postTokenBalances?: Array<{
      accountIndex: number;
      mint: string;
      owner: string;
      uiTokenAmount: { amount: string };
    }>;
  } | null;
  transaction: {
    message: {
      accountKeys: Array<string | { pubkey: string }>;
    };
  };
}

export async function fetchSolTransfers(
  depositAddress: string,
  limit = 30
): Promise<SolanaTransfer[]> {
  const sigs = await rpc<SignatureInfo[]>("getSignaturesForAddress", [
    depositAddress,
    { limit },
  ]);
  if (!sigs?.length) return [];

  const results: SolanaTransfer[] = [];
  for (const entry of sigs) {
    const sig = entry.signature;
    if (!sig) continue;
    const tx = await rpc<TxMeta>("getTransaction", [
      sig,
      { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
    ]);
    if (!tx?.meta) continue;

    const accountKeys = tx.transaction.message.accountKeys;
    const indices = accountKeys
      .map((k, i) => ({ i, k: typeof k === "string" ? k : k.pubkey }))
      .filter((x) => x.k === depositAddress)
      .map((x) => x.i);
    if (!indices.length) continue;

    const idx = indices[0];
    const pre = tx.meta.preBalances ?? [];
    const post = tx.meta.postBalances ?? [];
    if (idx >= pre.length || idx >= post.length) continue;

    const delta = post[idx] - pre[idx];
    if (delta <= 0) continue;

    let conf = entry.confirmationStatus === "finalized" ? 32 : 1;
    if (entry.confirmationStatus === "processed") conf = 0;

    results.push({
      txHash: sig,
      amountAtomic: String(delta),
      confirmations: conf,
      timestamp: entry.blockTime ?? null,
    });
  }
  return results;
}

export async function fetchUsdcSplTransfers(
  depositAddress: string,
  limit = 30
): Promise<SolanaTransfer[]> {
  const sigs = await rpc<SignatureInfo[]>("getSignaturesForAddress", [
    depositAddress,
    { limit },
  ]);
  if (!sigs?.length) return [];

  const results: SolanaTransfer[] = [];
  for (const entry of sigs) {
    const sig = entry.signature;
    if (!sig) continue;
    const tx = await rpc<TxMeta>("getTransaction", [
      sig,
      { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
    ]);
    if (!tx?.meta) continue;

    const preMap = new Map<number, number>();
    const postMap = new Map<number, number>();
    for (const bal of tx.meta.preTokenBalances ?? []) {
      if (bal.mint === USDC_MINT && bal.owner === depositAddress) {
        preMap.set(bal.accountIndex, parseInt(bal.uiTokenAmount.amount, 10));
      }
    }
    for (const bal of tx.meta.postTokenBalances ?? []) {
      if (bal.mint === USDC_MINT && bal.owner === depositAddress) {
        postMap.set(bal.accountIndex, parseInt(bal.uiTokenAmount.amount, 10));
      }
    }
    const allKeys = new Set([...preMap.keys(), ...postMap.keys()]);
    let delta = 0;
    for (const k of allKeys) {
      delta += (postMap.get(k) ?? 0) - (preMap.get(k) ?? 0);
    }
    if (delta <= 0) continue;

    let conf = entry.confirmationStatus === "finalized" ? 32 : 1;
    if (entry.confirmationStatus === "processed") conf = 0;

    results.push({
      txHash: sig,
      amountAtomic: String(delta),
      confirmations: conf,
      timestamp: entry.blockTime ?? null,
    });
  }
  return results;
}
