"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface AdminOrderActionsProps {
  orderId: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string;
  adminNotes: string;
  customerNotice: string;
}

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "PARTIAL", "REFUNDED"];

export function AdminOrderActions({
  orderId,
  status,
  paymentStatus,
  trackingNumber,
  adminNotes,
  customerNotice,
}: AdminOrderActionsProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    status,
    paymentStatus,
    trackingNumber,
    adminNotes,
    customerNotice,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      toast.success("Order updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
        Actions
      </h3>

      <div>
        <label className="block text-xs font-medium mb-1.5">Order Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5">Payment Status</label>
        <select
          value={form.paymentStatus}
          onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5">Tracking Number</label>
        <input
          type="text"
          value={form.trackingNumber}
          onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
          placeholder="e.g. 1Z999AA10123456784"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5">Admin Notes</label>
        <textarea
          value={form.adminNotes}
          onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
          placeholder="Internal notes (not visible to customer)"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5">Customer Notice</label>
        <textarea
          value={form.customerNotice}
          onChange={(e) => setForm({ ...form, customerNotice: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
          placeholder="Notice shown to customer"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save Changes
      </button>
    </div>
  );
}
