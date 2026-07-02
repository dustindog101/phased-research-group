/**
 * Crypto Payment Gateway — Order helpers
 * Ported from nextjs-boilerplate lib/payments/orderHelpers.ts
 */

import type { CryptoAssetId } from "./constants";
import { ASSETS } from "./constants";

export function parseCryptoAssetFromMethod(method: string | null | undefined): CryptoAssetId | null {
  if (!method) return null;
  const lower = method.toLowerCase();
  // Handle many legacy formats
  if (lower.startsWith("crypto:")) {
    const rest = lower.slice(7).trim();
    for (const id of Object.keys(ASSETS) as CryptoAssetId[]) {
      if (rest.includes(ASSETS[id].symbol.toLowerCase()) || rest.includes(id)) return id;
    }
  }
  if (lower.startsWith("crypto:")) {
    const rest = lower.slice(7).trim();
    for (const id of Object.keys(ASSETS) as CryptoAssetId[]) {
      if (rest.includes(ASSETS[id].symbol.toLowerCase()) || rest.includes(id.replace("_", " "))) return id;
    }
  }
  // Direct asset id match
  if (lower in ASSETS) return lower as CryptoAssetId;
  // Symbol match (e.g. "btc", "Bitcoin", "USDC (Base)")
  for (const id of Object.keys(ASSETS) as CryptoAssetId[]) {
    const meta = ASSETS[id];
    if (lower === meta.symbol.toLowerCase() || lower === meta.label.toLowerCase()) return id;
  }
  return null;
}

export interface OrderLike {
  paymentMethod?: string | null;
  cryptoAsset?: string | null;
  paymentIntentId?: string | null;
  paymentStatus?: string | null;
}

export function isCryptoOrder(order: OrderLike): boolean {
  if (order.cryptoAsset) return true;
  if (order.paymentIntentId) return true;
  if (parseCryptoAssetFromMethod(order.paymentMethod)) return true;
  if (order.paymentMethod?.toLowerCase().startsWith("crypto")) return true;
  return false;
}

export function isOrderUnpaid(order: OrderLike): boolean {
  const status = (order.paymentStatus || "").toUpperCase();
  return status !== "PAID" && status !== "REFUNDED";
}
