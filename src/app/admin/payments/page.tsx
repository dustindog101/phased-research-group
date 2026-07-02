import { db } from "@/db";
import { ASSETS, ASSET_IDS } from "@/lib/payments/constants";
import { getSettings } from "@/lib/payments/settings";
import { AdminPaymentsClient } from "@/components/admin/payments-client";

export default async function AdminPaymentsPage() {
  const settings = await getSettings();

  const gatewayData = ASSET_IDS.map((id) => ({
    id,
    label: ASSETS[id].label,
    symbol: ASSETS[id].symbol,
    icon: ASSETS[id].icon,
    family: ASSETS[id].family,
    defaultConfirmations: ASSETS[id].defaultConfirmations,
    enabled: settings.paymentGateways[id]?.enabled ?? false,
    address: settings.paymentGateways[id]?.address ?? "",
    minConfirmations: settings.paymentGateways[id]?.minConfirmations ?? ASSETS[id].defaultConfirmations,
  }));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Payment Gateway
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)]">
          Configure self-hosted crypto deposit addresses. No third-party processor — payments go directly to your wallets.
        </p>
      </div>

      <AdminPaymentsClient
        gateways={gatewayData}
        ttlHours={settings.paymentIntentTtlHours}
      />
    </div>
  );
}
