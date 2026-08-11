"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { ProductImage, resolveProductImageBlob } from "@/components/store/product-image";
import { formatPrice, CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";
import type { ProductWithVariants } from "@/lib/products";

export default function ProductListClient({ products }: { products: ProductWithVariants[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const addItem = useCart((s) => s.addItem);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          (p.variants ?? []).some(
            (v) =>
              v.dosage.toLowerCase().includes(q) ||
              v.displayName.toLowerCase().includes(q) ||
              v.sku.toLowerCase().includes(q)
          )
      );
    }
    // Group by category
    const grouped: Record<string, ProductWithVariants[]> = {};
    for (const p of list) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }
    return grouped;
  }, [products, category, query]);

  const handleAdd = (product: ProductWithVariants) => {
    const firstInStock = product.variants?.find((v) => v.inStock) ?? product.variants?.[0];
    if (!firstInStock) return;

    addItem({
      variantId: firstInStock.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      displayName: firstInStock.displayName,
      dosage: firstInStock.dosage,
      price: firstInStock.price,
      capColor: firstInStock.capColor,
      isKit: false,
    });
    setAddedIds((s) => new Set(s).add(product.id));
    toast.success(`${firstInStock.displayName} added to cart`);
    setTimeout(() => {
      setAddedIds((s) => {
        const next = new Set(s);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const totalCount = Object.values(filtered).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <section className="py-10">
      <div className="prg-container">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold uppercase tracking-[3px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Product List
          </h1>
          <p className="text-sm text-[var(--prg-text-muted)]">
            Quick-add table view of all {products.length} research peptides
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex-1 max-w-[480px] relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full py-3 pl-10 pr-4 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory("all")}
              className={`px-3 py-2 rounded-full text-xs font-medium ${
                category === "all"
                  ? "bg-[var(--prg-accent)] text-white"
                  : "border border-[var(--prg-border)] text-[var(--prg-text-muted)] hover:border-[var(--prg-accent)]"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-2 rounded-full text-xs font-medium ${
                  category === c.id
                    ? "bg-[var(--prg-accent)] text-white"
                    : "border border-[var(--prg-border)] text-[var(--prg-text-muted)] hover:border-[var(--prg-accent)]"
                }`}
              >
                {c.label.split(" ")[0]}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--prg-text-muted)] whitespace-nowrap">
            {totalCount} compound{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-[1.2px] text-[var(--prg-text-muted)]" style={{ fontFamily: "var(--font-display)" }}>
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-[1.2px] text-[var(--prg-text-muted)]" style={{ fontFamily: "var(--font-display)" }}>
                    Dosage Variations
                  </th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-[1.2px] text-[var(--prg-text-muted)]" style={{ fontFamily: "var(--font-display)" }}>
                    Price Range
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(filtered).map(([catId, catProducts]) => (
                  <CategoryGroup key={catId} catId={catId} products={catProducts} onAdd={handleAdd} addedIds={addedIds} />
                ))}
                {totalCount === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--prg-text-muted)]">
                      No products match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGroup({
  catId,
  products,
  onAdd,
  addedIds,
}: {
  catId: string;
  products: ProductWithVariants[];
  onAdd: (p: ProductWithVariants) => void;
  addedIds: Set<string>;
}) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return (
    <>
      <tr className="bg-[var(--prg-bg-elevated)] border-y border-[var(--prg-border)]">
        <td colSpan={4} className="py-3.5 px-4">
          <span className="font-semibold uppercase tracking-[1px] text-[14px]" style={{ fontFamily: "var(--font-display)" }}>
            {cat?.label ?? catId}
          </span>
          <span className="ml-2 inline-block bg-[var(--prg-border)] text-[var(--prg-text-secondary)] text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        </td>
      </tr>
      {products.map((p) => {
        const variants = p.variants ?? [];
        const firstVar = variants[0];
        const capColor = firstVar?.capColor ?? "#0d9488";
        const prices = variants.map((v) => v.price).filter(Boolean);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const priceStr =
          prices.length <= 1 || minPrice === maxPrice
            ? formatPrice(minPrice)
            : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
        const hasStock = variants.some((v) => v.inStock);

        return (
          <tr key={p.id} className="border-b border-[#f1f5f9] hover:bg-[var(--prg-bg-alt)]">
            <td className="py-3 px-4">
              <div className="flex items-center gap-3">
                <Link href={`/products/${p.slug}`} className="shrink-0">
                  <ProductImage
                    slug={p.slug}
                    capColor={capColor}
                    alt={`${p.name} research peptide`}
                    variant="table"
                    blobImages={resolveProductImageBlob(p)}
                  />
                </Link>
                <Link href={`/products/${p.slug}`} className="font-medium hover:text-[var(--prg-accent)]">
                  {p.name}
                </Link>
                {p.featured && (
                  <span className="prg-badge prg-badge--teal text-[9px] py-0.5 px-2">Featured</span>
                )}
              </div>
            </td>
            <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)] font-mono">
              {variants.map((v) => v.dosage).join(" • ")}
            </td>
            <td className="py-3 px-4 text-right font-medium text-[var(--prg-accent)] whitespace-nowrap">
              {priceStr}
            </td>
            <td className="py-3 px-4 text-right">
              <button
                onClick={() => onAdd(p)}
                disabled={!hasStock || addedIds.has(p.id)}
                className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.5px] rounded-[6px] text-white whitespace-nowrap transition-colors ${
                  addedIds.has(p.id)
                    ? "bg-[var(--prg-success)]"
                    : "bg-[var(--prg-accent)] hover:bg-[var(--prg-accent-hover)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addedIds.has(p.id) ? (
                  <span className="flex items-center gap-1">
                    <Check size={12} /> Added
                  </span>
                ) : hasStock ? (
                  "Add"
                ) : (
                  "Sold Out"
                )}
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}
