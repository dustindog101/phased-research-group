/**
 * Crypto Payment Gateway — Settings helpers
 * Ported from Python settings.py
 */

import { db } from "@/db";
import {
  ASSETS,
  ASSET_IDS,
  DEFAULT_TTL_HOURS,
  type CryptoAssetId,
} from "./constants";
import type {
  PaymentGateways,
  PaymentGatewayConfig,
  SitePaymentSettings,
  CryptoMethod,
} from "./types";

export function defaultGateways(): PaymentGateways {
  const result = {} as PaymentGateways;
  for (const id of ASSET_IDS) {
    result[id] = {
      enabled: false,
      address: "",
      minConfirmations: ASSETS[id].defaultConfirmations,
    };
  }
  return result;
}

export function defaultSettings(): Omit<SitePaymentSettings, "updatedAt"> {
  return {
    id: "site",
    paymentGateways: defaultGateways(),
    paymentIntentTtlHours: DEFAULT_TTL_HOURS,
  };
}

export async function getSettings(): Promise<SitePaymentSettings> {
  const row = await db.paymentSettings.findUnique({ where: { id: "site" } });
  if (!row) {
    // Create default if missing
    const created = await db.paymentSettings.create({
      data: {
        id: "site",
        paymentGateways: defaultGateways() as unknown as Record<string, unknown>,
        paymentIntentTtlHours: DEFAULT_TTL_HOURS,
      },
    });
    return {
      ...defaultSettings(),
      updatedAt: created.updatedAt,
    };
  }
  const stored = row.paymentGateways as unknown as Partial<PaymentGateways>;
  const merged = defaultGateways();
  for (const id of ASSET_IDS) {
    if (stored[id]) {
      merged[id] = { ...merged[id], ...stored[id]! };
    }
  }
  return {
    id: row.id,
    paymentGateways: merged,
    paymentIntentTtlHours: row.paymentIntentTtlHours,
    updatedAt: row.updatedAt,
  };
}

export function isGatewayEnabled(
  settings: Pick<SitePaymentSettings, "paymentGateways">,
  assetId: CryptoAssetId
): boolean {
  const cfg = settings.paymentGateways[assetId];
  return Boolean(cfg?.enabled && cfg?.address);
}

export function listEnabledAssetIds(
  settings: Pick<SitePaymentSettings, "paymentGateways">
): CryptoAssetId[] {
  return ASSET_IDS.filter((id) => isGatewayEnabled(settings, id));
}

export function listEnabledCryptoMethods(
  settings: Pick<SitePaymentSettings, "paymentGateways">
): CryptoMethod[] {
  return listEnabledAssetIds(settings).map((id) => ({
    id,
    label: ASSETS[id].label,
    icon: ASSETS[id].icon,
    symbol: ASSETS[id].symbol,
  }));
}

export function computeExpiresAt(
  ttlHours: number,
  orderOverride: Date | null = null
): Date {
  if (orderOverride) return orderOverride;
  return new Date(Date.now() + ttlHours * 60 * 60 * 1000);
}

export function sanitizeIntentForClient(
  intent: {
    id: string;
    orderId: string;
    userId: string | null;
    asset: string;
    depositAddress: string;
    expectedAmount: string;
    expectedAtomic: string;
    status: string;
    txHash: string | null;
    confirmations: number;
    expiresAt: Date;
    createdAt: Date;
    confirmedAt: Date | null;
    exchangeRate: number | null;
    baseTotalUsd: number;
  }
) {
  const asset = intent.asset as CryptoAssetId;
  const meta = ASSETS[asset];
  return {
    intentId: intent.id,
    orderId: intent.orderId,
    userId: intent.userId,
    asset,
    assetLabel: meta?.label ?? asset,
    assetSymbol: meta?.symbol ?? "",
    depositAddress: intent.depositAddress,
    expectedAmount: intent.expectedAmount,
    expectedAtomic: intent.expectedAtomic,
    status: intent.status,
    txHash: intent.txHash,
    confirmations: intent.confirmations,
    expiresAt: intent.expiresAt.toISOString(),
    createdAt: intent.createdAt.toISOString(),
    confirmedAt: intent.confirmedAt?.toISOString() ?? null,
    exchangeRate: intent.exchangeRate,
    baseTotalUsd: intent.baseTotalUsd,
  };
}
