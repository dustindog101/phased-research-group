/**
 * Crypto Payment Gateway — Unique Amount Computation
 * Ported from Python amounts.py
 *
 * Generates a unique on-chain amount (USD total / rate + random suffix)
 * so the watcher can match an on-chain transfer to a specific order.
 */

import { ASSETS, type CryptoAssetId } from "./constants";

interface CoinGeckoResponse {
  [coingeckoId: string]: { usd: number };
}

/**
 * Fetch USD rates for all supported assets from CoinGecko.
 * Free tier: 30 req/min, no API key required for basic endpoint.
 */
export async function fetchCoinGeckoRates(): Promise<CoinGeckoResponse> {
  const ids = [...new Set(Object.values(ASSETS).map((a) => a.coingeckoId))].sort().join(",");
  const apiKey = process.env.COINGECKO_API_KEY;
  let url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  if (apiKey) url += `&x_cg_demo_api_key=${apiKey}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`Unable to fetch exchange rates: HTTP ${res.status}`);
  }
  return res.json();
}

export function getRateForAsset(assetId: CryptoAssetId, rates: CoinGeckoResponse): number {
  const meta = ASSETS[assetId];
  const rate = rates[meta.coingeckoId]?.usd;
  if (!rate || rate <= 0) {
    throw new Error(`Unable to fetch exchange rate for ${assetId}.`);
  }
  return rate;
}

export function atomicToDecimal(atomic: number, decimals: number): string {
  if (decimals === 0) return String(atomic);
  const whole = Math.floor(atomic / 10 ** decimals);
  const frac = atomic % 10 ** decimals;
  return `${whole}.${String(frac).padStart(decimals, "0")}`;
}

export interface ComputedAmount {
  expectedAtomic: string;
  expectedAmount: string;
  uniqueSuffix: number;
  exchangeRate: number;
  baseTotalUsd: number;
}

/**
 * Compute a unique crypto amount for the given USD total.
 * The random suffix (1-9999 atomic units) ties this on-chain transfer to one order.
 */
export function computeUniqueAmount(
  assetId: CryptoAssetId,
  usdTotal: number,
  rates: CoinGeckoResponse
): ComputedAmount {
  const meta = ASSETS[assetId];
  const decimals = meta.decimals;
  const rate = getRateForAsset(assetId, rates);
  const factor = 10 ** decimals;
  const baseAtomic = Math.floor((usdTotal / rate) * factor);
  if (baseAtomic < 1) {
    throw new Error("Order total too small for this asset.");
  }
  // Single attempt — collision retry handled by caller via DB unique check
  const suffix = Math.floor(Math.random() * 9999) + 1;
  const expectedAtomic = baseAtomic + suffix;
  const expectedAmount = atomicToDecimal(expectedAtomic, decimals);
  return {
    expectedAtomic: String(expectedAtomic),
    expectedAmount,
    uniqueSuffix: suffix,
    exchangeRate: rate,
    baseTotalUsd: Math.round(usdTotal * 100) / 100,
  };
}
