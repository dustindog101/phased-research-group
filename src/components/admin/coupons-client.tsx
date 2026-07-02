"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Tag, Check, X } from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function AdminCouponsClient({ coupons: initialCoupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    value: 10,
    minOrder: 0,
    maxUses: "",
    isActive: true,
    expiresAt: "",
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        value: parseFloat(form.value as unknown as string),
        minOrder: parseFloat(form.minOrder as unknown as string),
        isActive: form.isActive,
      };
      if (form.maxUses) body.maxUses = parseInt(form.maxUses);
      if (form.expiresAt) body.expiresAt = new Date(form.expiresAt).toISOString();

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");

      toast.success("Coupon created");
      setShowForm(false);
      setForm({ code: "", discountType: "PERCENT", value: 10, minOrder: 0, maxUses: "", isActive: true, expiresAt: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Coupon deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 mb-4">
          <h3 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Create Coupon
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
                placeholder="SUMMER20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              >
                <option value="PERCENT">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Value * ({form.discountType === "PERCENT" ? "%" : "$"})</label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Min Order ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Max Uses (blank = unlimited)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Expires At</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving || !form.code}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--prg-border)] text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-bg-alt)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Code</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Type</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Value</th>
                <th className="text-center py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Used</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Expires</th>
                <th className="text-center py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Active</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--prg-text-muted)]">
                    <Tag size={32} className="mx-auto mb-2 opacity-40" />
                    No coupons yet
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--prg-border)] hover:bg-[var(--prg-bg-alt)]">
                    <td className="py-3 px-4 font-mono font-medium">{c.code}</td>
                    <td className="py-3 px-4 text-xs">{c.discountType}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {c.discountType === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {c.usedCount}
                      {c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(c.id, c.isActive)}
                        className={`prg-badge text-[9px] py-0.5 px-2 cursor-pointer ${
                          c.isActive ? "prg-badge--success" : "prg-badge--danger"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="text-[var(--prg-text-muted)] hover:text-[var(--prg-danger)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
