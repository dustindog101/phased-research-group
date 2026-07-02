"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2, CheckCircle2, AlertCircle, Clock, Activity, Bitcoin } from "lucide-react";

interface Gateway {
  id: string;
  label: string;
  symbol: string;
  icon: string;
  family: string;
  defaultConfirmations: number;
  enabled: boolean;
  address: string;
  minConfirmations: number;
}

interface ActivityItem {
  intentId: string;
  orderId: string;
  asset: string;
  assetLabel: string;
  assetSymbol: string;
  depositAddress: string;
  expectedAmount: string;
  status: string;
  txHash: string | null;
  confirmations: number;
  expiresAt: string;
  createdAt: string;
  baseTotalUsd: number;
  order?: {
    orderId: string;
    userEmail?: string;
    paymentStatus: string;
    status: string;
    orderTotal: number | null;
  } | null;
}

interface Summary {
  active: number;
  pending: number;
  detected: number;
  confirmed: number;
  confirmedLast7Days: number;
  expired: number;
  cancelled: number;
  enabledCryptoAssets: number;
}

export function AdminPaymentsClient({
  gateways: initialGateways,
  ttlHours: initialTtl,
}: {
  gateways: Gateway[];
  ttlHours: number;
}) {
  const [tab, setTab] = useState<"gateways" | "activity">("gateways");
  const [gateways, setGateways] = useState(initialGateways);
  const [ttlHours, setTtlHours] = useState(initialTtl);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const saveGateways = async () => {
    setSaving(true);
    try {
      const paymentGateways: Record<string, { enabled: boolean; address: string; minConfirmations: number }> = {};
      for (const g of gateways) {
        paymentGateways[g.id] = {
          enabled: g.enabled,
          address: g.address.trim(),
          minConfirmations: g.minConfirmations,
        };
      }
      const res = await fetch("/api/admin/payments/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentGateways, paymentIntentTtlHours: ttlHours }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
      toast.success("Payment settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loadActivity = async () => {
    setLoadingActivity(true);
    try {
      const [summaryRes, activityRes] = await Promise.all([
        fetch("/api/admin/payments/summary"),
        fetch("/api/admin/payments/intents?limit=50"),
      ]);
      const [summaryData, activityData] = await Promise.all([
        summaryRes.json(),
        activityRes.json(),
      ]);
      if (summaryRes.ok) setSummary(summaryData);
      if (activityRes.ok) setActivity(activityData.intents ?? []);
    } catch (e) {
      console.error("Load activity error:", e);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (tab === "activity" && !summary) loadActivity();
  }, [tab, summary]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--prg-border)]">
        <button
          onClick={() => setTab("gateways")}
          className={`px-4 py-2 text-sm font-medium uppercase tracking-[1px] border-b-2 -mb-px ${
            tab === "gateways"
              ? "border-[var(--prg-accent)] text-[var(--prg-accent)]"
              : "border-transparent text-[var(--prg-text-muted)] hover:text-[var(--prg-text)]"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          Gateways
        </button>
        <button
          onClick={() => setTab("activity")}
          className={`px-4 py-2 text-sm font-medium uppercase tracking-[1px] border-b-2 -mb-px ${
            tab === "activity"
              ? "border-[var(--prg-accent)] text-[var(--prg-accent)]"
              : "border-transparent text-[var(--prg-text-muted)] hover:text-[var(--prg-text)]"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          Activity
        </button>
      </div>

      {tab === "gateways" ? (
        <div>
          <div className="bg-[rgba(30,58,95,0.05)] border border-[rgba(30,58,95,0.15)] rounded-[var(--prg-radius-lg)] p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-[var(--prg-accent)] mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-[var(--prg-accent)] mb-1">Self-Hosted Wallet Setup</p>
              <p className="text-[var(--prg-text-secondary)]">
                Enter your deposit wallet addresses (public keys only — no private keys ever touch the server).
                Customers pay directly to your wallets. The payment watcher matches on-chain transfers by exact amount.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {gateways.map((g) => (
              <div
                key={g.id}
                className={`bg-white border rounded-[var(--prg-radius-lg)] p-5 ${
                  g.enabled ? "border-[var(--prg-accent)]" : "border-[var(--prg-border)]"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[var(--prg-bg-elevated)] flex items-center justify-center text-xl">
                      {g.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{g.label}</div>
                      <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px]">
                        {g.family} · {g.symbol}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={g.enabled}
                      onChange={(e) =>
                        setGateways(gateways.map((x) => (x.id === g.id ? { ...x, enabled: e.target.checked } : x)))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--prg-border)] rounded-full peer peer-checked:bg-[var(--prg-accent)] peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Deposit Address</label>
                    <input
                      type="text"
                      value={g.address}
                      onChange={(e) =>
                        setGateways(gateways.map((x) => (x.id === g.id ? { ...x, address: e.target.value } : x)))
                      }
                      disabled={!g.enabled}
                      className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono disabled:bg-[var(--prg-bg-alt)] disabled:opacity-50"
                      placeholder={g.id === "btc" ? "bc1q..." : g.id === "sol" || g.id === "usdc_solana" ? "..." : "0x..."}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Min Confirmations</label>
                    <input
                      type="number"
                      min={1}
                      value={g.minConfirmations}
                      onChange={(e) =>
                        setGateways(
                          gateways.map((x) =>
                            x.id === g.id ? { ...x, minConfirmations: parseInt(e.target.value) || 1 } : x
                          )
                        )
                      }
                      disabled={!g.enabled}
                      className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm disabled:bg-[var(--prg-bg-alt)] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 mb-6">
            <label className="block text-xs font-medium mb-1.5">Payment Intent TTL (hours)</label>
            <input
              type="number"
              min={1}
              max={168}
              value={ttlHours}
              onChange={(e) => setTtlHours(parseInt(e.target.value) || 48)}
              className="w-32 px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
            />
            <p className="text-xs text-[var(--prg-text-muted)] mt-1.5">
              How long a payment invoice remains valid before expiring (1-168 hours, default 48).
            </p>
          </div>

          <button
            onClick={saveGateways}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      ) : (
        <div>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-[var(--prg-warning)]" />
                  <span className="text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Active</span>
                </div>
                <div className="text-2xl font-bold">{summary.active}</div>
              </div>
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-[var(--prg-success)]" />
                  <span className="text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Confirmed (7d)</span>
                </div>
                <div className="text-2xl font-bold">{summary.confirmedLast7Days}</div>
              </div>
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-[var(--prg-text-muted)]" />
                  <span className="text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Expired</span>
                </div>
                <div className="text-2xl font-bold">{summary.expired}</div>
              </div>
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bitcoin size={16} className="text-[var(--prg-accent)]" />
                  <span className="text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Assets Enabled</span>
                </div>
                <div className="text-2xl font-bold">{summary.enabledCryptoAssets}</div>
              </div>
            </div>
          )}

          {/* Activity table */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--prg-border)]">
              <h3 className="text-sm font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
                Payment Intents
              </h3>
              <button
                onClick={loadActivity}
                disabled={loadingActivity}
                className="text-xs text-[var(--prg-accent)] hover:underline"
              >
                {loadingActivity ? "Loading..." : "Refresh"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Order</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Asset</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Amount</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Status</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Created</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[var(--prg-text-muted)]">
                        No payment intents yet
                      </td>
                    </tr>
                  ) : (
                    activity.map((item) => (
                      <tr key={item.intentId} className="border-b border-[var(--prg-border)] hover:bg-[var(--prg-bg-alt)]">
                        <td className="py-3 px-4">
                          <a href={`/admin/orders/${item.orderId}`} className="text-xs font-mono hover:text-[var(--prg-accent)]">
                            {item.orderId.slice(0, 8)}...
                          </a>
                        </td>
                        <td className="py-3 px-4 text-xs">{item.assetLabel}</td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {item.expectedAmount} {item.assetSymbol}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                            item.status === "CONFIRMED" ? "prg-badge--success" :
                            item.status === "EXPIRED" || item.status === "CANCELLED" ? "prg-badge--danger" :
                            "prg-badge--teal"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {item.txHash ? (
                            <span title={item.txHash}>{item.txHash.slice(0, 12)}...</span>
                          ) : (
                            <span className="text-[var(--prg-text-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
