"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { VialThumb } from "@/components/store/VialSVG";
import { ProductImage } from "@/components/store/product-image";
import { formatPrice, CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";
import type { Product } from "@prisma/client";

export default function ProductListClient({ products }: { products: Product[] }) {
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
          p.displayName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    // Group by category
    const grouped: Record<string, Product[]> = {};
    for (const p of list) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }
    return grouped;
  }, [products, category, query]);

  const handleAdd = (product: Product) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      displayName: product.displayName,
      dosage: product.dosage,
      price: product.price,
      capColor: product.capColor,
      isKit: false,
    });
    setAddedIds((s) => new Set(s).add(product.id));
    toast.success(`${product.displayName} added to cart`);
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
            {totalCount} product{totalCount !== 1 ? "s" : ""}
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
                    Dosage
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-[1.2px] text-[var(--prg-text-muted)]" style={{ fontFamily: "var(--font-display)" }}>
                    SKU
                  </th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-[1.2px] text-[var(--prg-text-muted)]" style={{ fontFamily: "var(--font-display)" }}>
                    Price
                  </th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-[1.2px] text-[var(--prg-text-muted)]" style={{ fontFamily: "var(--font-display)" }}>
                    Kit Price
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
                    <td colSpan={6} className="py-12 text-center text-[var(--prg-text-muted)]">
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
  products: Product[];
  onAdd: (p: Product) => void;
  addedIds: Set<string>;
}) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return (
    <>
      <tr className="bg-[var(--prg-bg-elevated)] border-y border-[var(--prg-border)]">
        <td colSpan={6} className="py-3.5 px-4">
          <span className="font-semibold uppercase tracking-[1px] text-[14px]" style={{ fontFamily: "var(--font-display)" }}>
            {cat?.label ?? catId}
          </span>
          <span className="ml-2 inline-block bg-[var(--prg-border)] text-[var(--prg-text-secondary)] text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        </td>
      </tr>
      {products.map((p) => (
        <tr key={p.id} className="border-b border-[#f1f5f9] hover:bg-[var(--prg-bg-alt)]">
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Link href={`/products/${p.slug}`} className="shrink-0">
                <ProductImage
                  slug={p.slug}
                  capColor={p.capColor}
                  alt={`${p.displayName} research peptide`}
                  variant="table"
                />
              </Link>
              <Link href={`/products/${p.slug}`} className="font-medium hover:text-[var(--prg-accent)]">
                {p.displayName}
              </Link>
              {p.featured && (
                <span className="prg-badge prg-badge--teal text-[9px] py-0.5 px-2">Featured</span>
              )}
            </div>
          </td>
          <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">{p.dosage}</td>
          <td className="py-3 px-4 text-xs font-mono">{p.sku}</td>
          <td className="py-3 px-4 text-right font-medium whitespace-nowrap">{formatPrice(p.price)}</td>
          <td className="py-3 px-4 text-right text-xs text-[var(--prg-text-muted)] whitespace-nowrap">
            {formatPrice(p.kitPrice)}
          </td>
          <td className="py-3 px-4 text-right">
            <button
              onClick={() => onAdd(p)}
              disabled={!p.inStock || addedIds.has(p.id)}
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
              ) : p.inStock ? (
                "Add"
              ) : (
                "Sold Out"
              )}
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
