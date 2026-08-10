"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, Trash2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { VialSVG } from "@/components/store/VialSVG";
import { ImageUpload } from "@/components/admin/image-upload";
import type { ProductWithVariants } from "@/lib/products";

interface ProductFormProps {
  product?: ProductWithVariants;
  mode: "create" | "edit";
}

const DEFAULT_COLORS = ["#0d9488", "#1e3a5f", "#2563eb", "#7c3aed", "#dc2626", "#d97706", "#16a34a", "#64748b"];

interface VariantState {
  id?: string;
  dosage: string;
  displayName: string;
  sku: string;
  price: number;
  kitPrice: number;
  capColor: string;
  inStock: boolean;
  stockQty: number;
  coaUrl: string;
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [imageKey, setImageKey] = useState<string | null>(product?.imageKey ?? null);

  const [form, setForm] = useState({
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    category: product?.category ?? "metabolic",
    categoryLabel: product?.categoryLabel ?? "Metabolic & GLP Agonists",
    featured: product?.featured ?? false,
    description: product?.description ?? "",
    longDescription: product?.longDescription ?? "",
  });

  const initialVariants: VariantState[] = product?.variants && product.variants.length > 0
    ? product.variants.map((v) => ({
        id: v.id,
        dosage: v.dosage,
        displayName: v.displayName,
        sku: v.sku,
        price: v.price,
        kitPrice: v.kitPrice,
        capColor: v.capColor,
        inStock: v.inStock,
        stockQty: v.stockQty,
        coaUrl: v.coaUrl ?? "",
      }))
    : [
        {
          dosage: "5mg",
          displayName: "",
          sku: "",
          price: 50,
          kitPrice: 250,
          capColor: "#0d9488",
          inStock: true,
          stockQty: 100,
          coaUrl: "",
        },
      ];

  const [variants, setVariants] = useState<VariantState[]>(initialVariants);

  const handleImageChange = (newKey: string | null) => {
    setImageKey(newKey);
    router.refresh();
  };

  const handleCategoryChange = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    setForm({ ...form, category: catId, categoryLabel: cat?.label ?? catId });
  };

  const handleAddVariant = () => {
    const defaultDosage = `${(variants.length + 1) * 5}mg`;
    const defaultName = form.name ? `${form.name} ${defaultDosage}` : "";
    const defaultSku = form.name
      ? `PRG-${form.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${defaultDosage.toUpperCase()}`
      : "";

    setVariants([
      ...variants,
      {
        dosage: defaultDosage,
        displayName: defaultName,
        sku: defaultSku,
        price: 60,
        kitPrice: 300,
        capColor: variants[0]?.capColor ?? "#0d9488",
        inStock: true,
        stockQty: 100,
        coaUrl: "",
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error("At least one dosage variant is required.");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantField = <K extends keyof VariantState>(
    index: number,
    field: K,
    value: VariantState[K]
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-update displayName & sku if name or dosage changes
    if (field === "dosage" && form.name) {
      const dosageStr = value as string;
      if (!updated[index].displayName || updated[index].displayName.startsWith(form.name)) {
        updated[index].displayName = `${form.name} ${dosageStr}`;
      }
      if (!updated[index].sku || updated[index].sku.startsWith("PRG-")) {
        const cleanName = form.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanDosage = dosageStr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        updated[index].sku = `PRG-${cleanName}-${cleanDosage}`;
      }
    }

    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and Slug are required.");
      return;
    }

    if (variants.length === 0) {
      toast.error("At least one variation is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        imageKey,
        variants: variants.map((v) => ({
          ...v,
          displayName: v.displayName.trim() || `${form.name} ${v.dosage}`,
          sku: v.sku.trim() || `PRG-${form.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${v.dosage.toUpperCase()}`,
        })),
      };

      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(mode === "create" ? "Product created" : "Product updated");
      if (mode === "create") {
        router.push(data.id ? `/admin/products/${data.id}` : "/admin/products");
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1 && document.referrer.includes("/admin/products")) {
      router.back();
    } else {
      router.push("/admin/products");
    }
  };

  const handleDelete = async () => {
    if (mode !== "create" && confirm(`Delete ${product?.name}? This will remove all dosage variations.`)) {
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

  const primaryCapColor = variants[0]?.capColor ?? "#0d9488";
  const firstPrice = variants[0]?.price ?? 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          onClick={handleBack}
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
        <div className="space-y-6">
          {/* Parent Product Info */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-4">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
              Parent Product Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Compound Name *</label>
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
                <label className="block text-xs font-medium mb-1.5">Parent Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
                  placeholder="tirzepatide"
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

          {/* Dosage Variations Builder Table */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
                  Dosage Variations
                </h2>
                <p className="text-xs text-[var(--prg-text-muted)] mt-0.5">
                  Configure dosages, SKUs, single vial prices, and future kit prices
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 py-1.5 px-3 bg-[var(--prg-bg-alt)] border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-xs font-medium text-[var(--prg-accent)] hover:border-[var(--prg-accent)]"
              >
                <Plus size={14} /> Add Dosage
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                    <th className="text-left p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">Dosage</th>
                    <th className="text-left p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">SKU</th>
                    <th className="text-left p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">Price ($)</th>
                    <th className="text-left p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">Kit Price ($)</th>
                    <th className="text-left p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">Stock Qty</th>
                    <th className="text-center p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">In Stock</th>
                    <th className="text-center p-2.5 uppercase tracking-[0.5px] text-[var(--prg-text-muted)]">Cap Color</th>
                    <th className="p-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--prg-border)]">
                  {variants.map((v, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={v.dosage}
                          onChange={(e) => updateVariantField(index, "dosage", e.target.value)}
                          className="w-20 px-2 py-1.5 border border-[var(--prg-border)] rounded text-xs font-semibold"
                          placeholder="5mg"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => updateVariantField(index, "sku", e.target.value)}
                          className="w-36 px-2 py-1.5 border border-[var(--prg-border)] rounded text-xs font-mono"
                          placeholder="PRG-TIRZEPAT-5MG"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={v.price}
                          onChange={(e) => updateVariantField(index, "price", parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1.5 border border-[var(--prg-border)] rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={v.kitPrice}
                          onChange={(e) => updateVariantField(index, "kitPrice", parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1.5 border border-[var(--prg-border)] rounded text-xs font-medium text-[var(--prg-text-muted)]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={v.stockQty}
                          onChange={(e) => updateVariantField(index, "stockQty", parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1.5 border border-[var(--prg-border)] rounded text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={v.inStock}
                          onChange={(e) => updateVariantField(index, "inStock", e.target.checked)}
                          className="accent-[var(--prg-accent)] cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="color"
                          value={v.capColor}
                          onChange={(e) => updateVariantField(index, "capColor", e.target.value)}
                          className="w-7 h-7 rounded border border-[var(--prg-border)] cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-[var(--prg-text-muted)] hover:text-[var(--prg-danger)] p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="w-full py-2 border border-dashed border-[var(--prg-border)] rounded-[var(--prg-radius)] text-xs text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)] hover:border-[var(--prg-accent)] flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add Another Dosage Variant
            </button>
          </div>

          {/* Description */}
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
                placeholder="Brief compound description..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Long Description (Markdown)</label>
              <textarea
                value={form.longDescription ?? ""}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono"
                placeholder="## Research Overview..."
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
              <VialSVG capColor={primaryCapColor} size={120} />
            </div>
            <p className="text-sm font-semibold">{form.name || "Compound Name"}</p>
            <p className="text-[var(--prg-accent)] font-bold">${firstPrice.toFixed(2)}</p>
          </div>

          {/* Image upload (only in edit mode — product must exist to upload) */}
          {mode === "edit" && product && (
            <ImageUpload
              productId={product.id}
              slug={product.slug}
              capColor={primaryCapColor}
              imageKey={imageKey}
              onImageChange={handleImageChange}
            />
          )}
          {mode === "create" && (
            <div className="bg-[var(--prg-bg-alt)] border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 text-center">
              <p className="text-xs text-[var(--prg-text-muted)]">
                Save the product first, then upload an image.
              </p>
            </div>
          )}

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
              <span className="text-sm font-medium">Featured product</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
