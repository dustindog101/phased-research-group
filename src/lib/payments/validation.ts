/**
 * Crypto Payment Gateway — Address Validation
 * Ported from Python validation.py
 */

import { ASSET_IDS, type CryptoAssetId } from "./constants";

const BTC_RE = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
const LTC_RE = /^(ltc1|[LM3])[a-zA-HJ-NP-Z0-9]{25,62}$/;
const SOL_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_RE = /^0x[a-fA-F0-9]{40}$/;

export function validateAddress(assetId: CryptoAssetId, address: string): boolean {
  const addr = (address || "").trim();
  if (!addr) return false;
  if (assetId === "btc") return BTC_RE.test(addr);
  if (assetId === "ltc") return LTC_RE.test(addr);
  if (assetId === "sol" || assetId === "usdc_solana") return SOL_RE.test(addr);
  if (assetId === "usdc_ethereum" || assetId === "usdc_polygon" || assetId === "usdc_base") {
    return EVM_RE.test(addr);
  }
  return false;
}

export function validateGatewaySettings(
  gateways: Record<string, Partial<{ enabled: boolean; address: string; minConfirmations: number }>>
): string[] {
  const errors: string[] = [];
  for (const assetId of ASSET_IDS) {
    const cfg = gateways[assetId] || {};
    const enabled = Boolean(cfg.enabled);
    const address = (cfg.address || "").trim();
    if (enabled && !address) {
      errors.push(`${assetId}: address required when enabled.`);
    } else if (enabled && !validateAddress(assetId, address)) {
      errors.push(`${assetId}: invalid address format.`);
    }
  }
  return errors;
}
