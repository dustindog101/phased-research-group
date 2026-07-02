/**
 * Blockstream / Litecoin Space Esplora API adapter
 * Ported from Python esplora.py
 *
 * Fetches inbound transfers to a deposit address for BTC and LTC.
 * Free, no API key required.
 */

interface EsploraTransfer {
  txHash: string;
  amountAtomic: string;
  confirmations: number;
  timestamp: number | null;
}

interface EsploraTx {
  txid: string;
  status: {
    confirmed: boolean;
    block_time?: number;
    confirmations?: number;
  };
  vout: Array<{
    scriptpubkey_address?: string;
    value: number;
  }>;
}

export async function fetchInboundTransfers(
  baseUrl: string,
  address: string
): Promise<EsploraTransfer[]> {
  const url = `${baseUrl.replace(/\/$/, "")}/address/${address}/txs`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "prg-payment-watcher/1.0",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`Esplora HTTP ${res.status} for ${address}`);
  }
  const txs = (await res.json()) as EsploraTx[];

  const results: EsploraTransfer[] = [];
  for (const tx of txs) {
    const status = tx.status || {};
    let totalSats = 0;
    for (const vout of tx.vout || []) {
      if (vout.scriptpubkey_address === address) {
        totalSats += Math.floor(vout.value);
      }
    }
    if (totalSats <= 0) continue;

    let conf = 0;
    if (status.confirmed) {
      conf = Math.max(1, status.confirmations ?? 1);
    }
    results.push({
      txHash: tx.txid,
      amountAtomic: String(totalSats),
      confirmations: conf,
      timestamp: status.block_time ?? null,
    });
  }
  return results;
}
