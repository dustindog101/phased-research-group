/**
 * Crypto Payment Gateway — Type Definitions
 * Ported from nextjs-boilerplate lib/paymentTypes.ts + Python handlers.py
 */

import type { CryptoAssetId } from "./constants";

export type PaymentIntentStatus =
  | "PENDING"
  | "DETECTED"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED";

export interface PaymentIntent {
  id: string;
  orderId: string;
  userId: string | null;
  asset: CryptoAssetId;
  depositAddress: string;
  expectedAmount: string; // human-readable, e.g. "0.00123456"
  expectedAtomic: string; // integer string for exact on-chain match
  uniqueSuffix: number;
  baseTotalUsd: number;
  exchangeRate: number | null;
  status: PaymentIntentStatus;
  txHash: string | null;
  confirmations: number;
  expiresAt: Date;
  createdAt: Date;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  assetLabel?: string;
  assetSymbol?: string;
}

export interface PaymentGatewayConfig {
  enabled: boolean;
  address: string;
  minConfirmations: number;
}

export type PaymentGateways = Record<CryptoAssetId, PaymentGatewayConfig>;

export interface SitePaymentSettings {
  id: string;
  paymentGateways: PaymentGateways;
  paymentIntentTtlHours: number;
  updatedAt: Date;
}

export interface CryptoMethod {
  id: CryptoAssetId;
  label: string;
  icon: string;
  symbol: string;
}

export interface PaymentActivitySummary {
  active: number;
  pending: number;
  detected: number;
  confirmed: number;
  confirmedLast7Days: number;
  expired: number;
  cancelled: number;
  enabledCryptoAssets: number;
}

export interface PaymentActivityItem extends PaymentIntent {
  rail: string;
  order?: {
    orderId: string;
    userId: string | null;
    source: string | null;
    paymentStatus: string;
    paymentMethod: string | null;
    status: string;
    orderTotal: number | null;
    createdAt: Date;
  } | null;
}

// ============ API Request/Response Types ============

export type PaymentRequestType =
  | "list_crypto_methods"
  | "create_payment_intent"
  | "get_payment_intent"
  | "cancel_payment_intent";

export type PaymentAdminRequestType =
  | "get_payment_settings"
  | "update_payment_settings"
  | "set_order_payment_expiry"
  | "get_order_payment_intent"
  | "admin_create_payment_intent"
  | "admin_cancel_payment_intent"
  | "get_payment_activity_summary"
  | "list_payment_intents";

export interface CreatePaymentIntentRequest {
  orderId: string;
  asset: CryptoAssetId;
}

export interface PaySessionResponse {
  payToken: string;
  expiresAt: string;
}
