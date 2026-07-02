/**
 * Crypto Payment Gateway — Asset Metadata
 * Ported from nextjs-boilerplate lib/paymentConstants.ts + Python config.py
 */

export type CryptoAssetId =
  | "btc"
  | "ltc"
  | "sol"
  | "usdc_ethereum"
  | "usdc_polygon"
  | "usdc_base"
  | "usdc_solana";

export interface CryptoAssetMeta {
  id: CryptoAssetId;
  label: string;
  symbol: string;
  icon: string;
  decimals: number;
  coingeckoId: string;
  defaultConfirmations: number;
  family: "esplora" | "etherscan" | "solana" | "solana_usdc";
  esploraBase?: string;
  chainId?: number;
  contract?: string;
  mint?: string;
}

export const ASSETS: Record<CryptoAssetId, CryptoAssetMeta> = {
  btc: {
    id: "btc", label: "Bitcoin", symbol: "BTC", icon: "₿",
    decimals: 8, coingeckoId: "bitcoin", defaultConfirmations: 1,
    family: "esplora", esploraBase: "https://blockstream.info/api",
  },
  ltc: {
    id: "ltc", label: "Litecoin", symbol: "LTC", icon: "Ł",
    decimals: 8, coingeckoId: "litecoin", defaultConfirmations: 1,
    family: "esplora", esploraBase: "https://litecoinspace.org/api",
  },
  sol: {
    id: "sol", label: "Solana", symbol: "SOL", icon: "◎",
    decimals: 9, coingeckoId: "solana", defaultConfirmations: 1,
    family: "solana",
  },
  usdc_ethereum: {
    id: "usdc_ethereum", label: "USDC (Ethereum)", symbol: "USDC", icon: "$",
    decimals: 6, coingeckoId: "usd-coin", defaultConfirmations: 12,
    family: "etherscan", chainId: 1,
    contract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  usdc_polygon: {
    id: "usdc_polygon", label: "USDC (Polygon)", symbol: "USDC", icon: "$",
    decimals: 6, coingeckoId: "usd-coin", defaultConfirmations: 12,
    family: "etherscan", chainId: 137,
    contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
  usdc_base: {
    id: "usdc_base", label: "USDC (Base)", symbol: "USDC", icon: "$",
    decimals: 6, coingeckoId: "usd-coin", defaultConfirmations: 12,
    family: "etherscan", chainId: 8453,
    contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  usdc_solana: {
    id: "usdc_solana", label: "USDC (Solana)", symbol: "USDC", icon: "$",
    decimals: 6, coingeckoId: "usd-coin", defaultConfirmations: 1,
    family: "solana_usdc", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
};

export const ASSET_IDS = Object.keys(ASSETS) as CryptoAssetId[];
export const DEFAULT_TTL_HOURS = 48;

export const MANUAL_METHODS = [
  { id: "zelle", label: "Zelle", icon: "zelle", status: "coming_soon" as const },
  { id: "cashapp", label: "Cash App", icon: "cash-app", status: "coming_soon" as const },
];

export function isCryptoPaymentsEnabled(): boolean {
  const v = process.env.CRYPTO_PAYMENTS_ENABLED;
  if (v === undefined) return true;
  return !["0", "false", "no"].includes(v.toLowerCase());
}
