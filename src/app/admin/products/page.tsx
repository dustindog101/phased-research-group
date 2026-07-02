import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const categoryFilter = sp.category ?? "all";
  const query = sp.q?.trim() ?? "";

  const where: Record<string, unknown> = {};
  if (categoryFilter !== "all") where.category = categoryFilter;
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { displayName: { contains: query } },
      { sku: { contains: query } },
    ];
  }

  const products = await db.product.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }, { dosage: "asc" }],
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Products
          </h1>
          <p className="text-sm text-[var(--prg-text-muted)]">
            {products.length} product{products.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products"
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              categoryFilter === "all"
                ? "bg-[var(--prg-accent)] text-white"
                : "bg-white border border-[var(--prg-border)] text-[var(--prg-text-muted)] hover:border-[var(--prg-accent)]"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/admin/products?category=${c.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                categoryFilter === c.id
                  ? "bg-[var(--prg-accent)] text-white"
                  : "bg-white border border-[var(--prg-border)] text-[var(--prg-text-muted)] hover:border-[var(--prg-accent)]"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Product</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Category</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">SKU</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Price</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Kit Price</th>
                <th className="text-center py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Stock</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--prg-border)] hover:bg-[var(--prg-bg-alt)]">
                  <td className="py-3 px-4">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-[var(--prg-accent)]">
                      {p.displayName}
                    </Link>
                    {p.featured && (
                      <span className="ml-2 prg-badge prg-badge--teal text-[9px] py-0.5 px-2">Featured</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">{p.categoryLabel}</td>
                  <td className="py-3 px-4 text-xs font-mono">{p.sku}</td>
                  <td className="py-3 px-4 text-right font-medium text-[var(--prg-accent)]">{formatPrice(p.price)}</td>
                  <td className="py-3 px-4 text-right text-xs text-[var(--prg-text-muted)]">{formatPrice(p.kitPrice)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                      p.inStock ? "prg-badge--success" : "prg-badge--danger"
                    }`}>
                      {p.inStock ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/products/${p.id}`} className="text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)]">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
