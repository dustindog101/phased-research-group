"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { effectiveIntentStatus, intentStatusLabel, type EffectiveStatus } from "@/lib/payments/intentStatus";

interface PaymentIntentLike {
  intentId: string;
  orderId: string;
  asset: string;
  assetLabel: string;
  assetSymbol: string;
  depositAddress: string;
  expectedAmount: string;
  expectedAtomic: string;
  status: string;
  txHash: string | null;
  confirmations: number;
  expiresAt: string;
  createdAt: string;
  confirmedAt: string | null;
}

interface CryptoPayModalProps {
  orderId: string;
  payToken?: string | null;
  open: boolean;
  onClose: () => void;
  onPaid?: () => void;
}

export function CryptoPayModal({ orderId, payToken, open, onClose, onPaid }: CryptoPayModalProps) {
  const [intent, setIntent] = useState<PaymentIntentLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);

  const loadIntent = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", orderId, payToken }),
      });
      if (!res.ok) throw new Error("Failed to fetch intent");
      const data = await res.json();
      setIntent(data.intent);
    } catch (e) {
      console.error("Load intent error:", e);
    } finally {
      setLoading(false);
    }
  }, [orderId, payToken]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    loadIntent();
  }, [open, loadIntent]);

  const resolvedStatus: EffectiveStatus | null = intent
    ? effectiveIntentStatus({
        status: intent.status as EffectiveStatus,
        expiresAt: new Date(intent.expiresAt),
      })
    : null;

  // Poll for payment status
  useEffect(() => {
    if (!open || !intent || !resolvedStatus) return;
    if (["CONFIRMED", "EXPIRED", "CANCELLED"].includes(resolvedStatus)) {
      if (resolvedStatus === "CONFIRMED") {
        onPaid?.();
        const t = setTimeout(onClose, 2000);
        return () => clearTimeout(t);
      }
      return;
    }
    const id = setInterval(async () => {
      setPolling(true);
      try {
        const res = await fetch("/api/payments/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, payToken }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.intent) setIntent(data.intent);
        }
      } catch (e) {
        console.error("Poll error:", e);
      } finally {
        setPolling(false);
      }
    }, 15000);
    return () => clearInterval(id);
  }, [open, intent, resolvedStatus, orderId, payToken, onPaid, onClose]);

  if (!open) return null;

  const copyAddress = () => {
    if (!intent) return;
    navigator.clipboard.writeText(intent.depositAddress);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const expiresIn = intent
    ? Math.max(0, Math.floor((new Date(intent.expiresAt).getTime() - Date.now()) / 60000))
    : 0;

  const qrValue = intent
    ? `${intent.assetSymbol}:${intent.depositAddress}?amount=${intent.expectedAmount}`
    : "";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-[var(--prg-radius-lg)] max-w-md w-full max-h-[90vh] overflow-y-auto prg-scroll shadow-[var(--prg-shadow-lg)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--prg-border)]">
          <h3
            className="text-[18px] font-semibold uppercase tracking-[2px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {intent ? `Pay with ${intent.assetLabel}` : "Crypto Payment"}
          </h3>
          <button onClick={onClose} className="text-[var(--prg-text-muted)] hover:text-[var(--prg-text)]">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[var(--prg-accent)]" size={32} />
            <p className="text-sm text-[var(--prg-text-muted)]">Loading payment details...</p>
          </div>
        ) : !intent ? (
          <div className="p-8 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-[var(--prg-text-muted)]" />
            <p className="text-sm text-[var(--prg-text-secondary)] mb-4">
              No active payment invoice. Create one to continue.
            </p>
          </div>
        ) : resolvedStatus === "CONFIRMED" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--prg-success)]/10 flex items-center justify-center">
              <Check size={32} className="text-[var(--prg-success)]" />
            </div>
            <h4
              className="text-[20px] font-semibold uppercase tracking-[2px] mb-2"
              style={{ fontFamily: "var(--prg-display)" }}
            >
              Payment Confirmed
            </h4>
            <p className="text-sm text-[var(--prg-text-muted)]">
              Your payment has been confirmed on the blockchain. We&apos;ll process your order shortly.
            </p>
          </div>
        ) : resolvedStatus === "EXPIRED" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--prg-warning)]/10 flex items-center justify-center">
              <Clock size={32} className="text-[var(--prg-warning)]" />
            </div>
            <h4
              className="text-[20px] font-semibold uppercase tracking-[2px] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Invoice Expired
            </h4>
            <p className="text-sm text-[var(--prg-text-muted)] mb-4">
              This payment invoice has expired. Please create a new one.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Status badge */}
            <div className="flex items-center justify-between">
              <span
                className={`prg-badge ${
                  resolvedStatus === "DETECTED"
                    ? "prg-badge--teal"
                    : "prg-badge--success"
                }`}
              >
                {resolvedStatus === "DETECTED" ? "Payment Detected" : "Awaiting Payment"}
              </span>
              <span className="text-xs text-[var(--prg-text-muted)] flex items-center gap-1">
                <Clock size={12} /> Expires in {expiresIn}m
              </span>
            </div>

            {resolvedStatus === "DETECTED" && (
              <div className="p-3 bg-[rgba(13,148,136,0.05)] border border-[rgba(13,148,136,0.2)] rounded-[var(--prg-radius)] text-sm text-[var(--prg-teal)] flex items-center gap-2">
                <Check size={16} /> Payment detected! Waiting for confirmations...
              </div>
            )}

            {/* Amount + QR */}
            <div className="text-center">
              <p className="text-xs uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-1">
                Send exactly
              </p>
              <p className="text-[28px] font-bold text-[var(--prg-accent)] mb-1">
                {intent.expectedAmount} {intent.assetSymbol}
              </p>
              <p className="text-xs text-[var(--prg-text-muted)]">
                to the address below
              </p>
            </div>

            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-[var(--prg-border)] rounded-[var(--prg-radius-lg)]">
                <QRCodeSVG value={qrValue} size={180} includeMargin={false} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
                Deposit Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={intent.depositAddress}
                  className="flex-1 px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-xs font-mono bg-[var(--prg-bg-alt)]"
                />
                <button
                  onClick={copyAddress}
                  className="px-3 py-2 bg-[var(--prg-accent)] text-white rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 bg-[rgba(217,119,6,0.05)] border border-[rgba(217,119,6,0.2)] rounded-[var(--prg-radius)] text-xs text-[var(--prg-warning)] flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>
                Send the <strong>exact amount</strong> shown above from a wallet, not an exchange.
                The unique amount identifies your payment. Underpayment will not be credited.
              </span>
            </div>

            {/* Polling indicator */}
            {polling && (
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--prg-text-muted)]">
                <Loader2 size={12} className="animate-spin" /> Checking for payment...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
