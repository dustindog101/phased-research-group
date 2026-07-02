"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { VialSVG } from "@/components/store/VialSVG";
import type { Product } from "@prisma/client";

interface ProductFormProps {
  product?: Product;
  mode: "create" | "edit";
}

const DEFAULT_COLORS = ["#0d9488", "#1e3a5f", "#2563eb", "#7c3aed", "#dc2626", "#d97706", "#16a34a", "#64748b"];

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    displayName: product?.displayName ?? "",
    category: product?.category ?? "metabolic",
    categoryLabel: product?.categoryLabel ?? "Metabolic & GLP Agonists",
    dosage: product?.dosage ?? "",
    sku: product?.sku ?? "",
    price: product?.price ?? 0,
    kitPrice: product?.kitPrice ?? 0,
    capColor: product?.capColor ?? "#0d9488",
    featured: product?.featured ?? false,
    inStock: product?.inStock ?? true,
    stockQty: product?.stockQty ?? 0,
    description: product?.description ?? "",
    longDescription: product?.longDescription ?? "",
    coaUrl: product?.coaUrl ?? "",
  });

  const handleCategoryChange = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    setForm({ ...form, category: catId, categoryLabel: cat?.label ?? catId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(mode === "create" ? "Product created" : "Product updated");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== "create" && confirm(`Delete ${product?.displayName}? This cannot be undone.`)) {
      setDeleting(true);
      try {
        const res = await fetch(`/api/admin/products/${product!.id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Delete failed");
        }
        toast.success("Product deleted");
        router.push("/admin/products");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)]"
        >
          <ArrowLeft size={14} /> Back to products
        </Link>
        <div className="flex gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--prg-danger)] text-[var(--prg-danger)] text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-danger)] hover:text-white disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {mode === "create" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main fields */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-4">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
              Product Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                  placeholder="Tirzepatide"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Dosage *</label>
                <input
                  type="text"
                  required
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                  placeholder="5mg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1.5">Display Name *</label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                  placeholder="Tirzepatide 5mg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
                  placeholder="tirzepatide-5mg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">SKU *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
                  placeholder="PRG-TIRZEPAT-5MG"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Category Label</label>
                <input
                  type="text"
                  value={form.categoryLabel}
                  onChange={(e) => setForm({ ...form, categoryLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-4">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Price per Vial ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">5-Vial Kit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.kitPrice}
                  onChange={(e) => setForm({ ...form, kitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-4">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
              Description
            </h2>
            <div>
              <label className="block text-xs font-medium mb-1.5">Short Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                placeholder="Brief product description"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Long Description (Markdown)</label>
              <textarea
                value={form.longDescription ?? ""}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
                placeholder="## Overview&#10;Detailed description in markdown..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">COA URL</label>
              <input
                type="url"
                value={form.coaUrl ?? ""}
                onChange={(e) => setForm({ ...form, coaUrl: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 text-center">
            <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Preview
            </h3>
            <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-[var(--prg-radius)] p-6 mb-3">
              <VialSVG capColor={form.capColor} size={120} />
            </div>
            <p className="text-sm font-semibold">{form.displayName || "Product Name"}</p>
            <p className="text-[var(--prg-accent)] font-bold">${form.price.toFixed(2)}</p>
          </div>

          {/* Cap color */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Vial Cap Color
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {DEFAULT_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setForm({ ...form, capColor: color })}
                  className={`aspect-square rounded-[var(--prg-radius)] border-2 ${
                    form.capColor === color ? "border-[var(--prg-accent)] ring-2 ring-[var(--prg-accent)]/20" : "border-[var(--prg-border)]"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={form.capColor}
              onChange={(e) => setForm({ ...form, capColor: e.target.value })}
              className="w-full h-10 rounded-[var(--prg-radius)] border border-[var(--prg-border)]"
            />
          </div>

          {/* Status */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-3">
            <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
              Status
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="accent-[var(--prg-accent)]"
              />
              <span className="text-sm">Featured product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                className="accent-[var(--prg-accent)]"
              />
              <span className="text-sm">In stock</span>
            </label>
            <div>
              <label className="block text-xs font-medium mb-1.5">Stock Quantity</label>
              <input
                type="number"
                value={form.stockQty}
                onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
