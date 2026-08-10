import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { ProductsScrollRestorer } from "@/components/admin/products-scroll-restorer";

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
      { name: { contains: query, mode: "insensitive" } },
      { categoryLabel: { contains: query, mode: "insensitive" } },
      {
        variants: {
          some: {
            OR: [
              { dosage: { contains: query, mode: "insensitive" } },
              { displayName: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const products = await db.product.findMany({
    where,
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="p-6 md:p-8">
      <ProductsScrollRestorer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Products
          </h1>
          <p className="text-sm text-[var(--prg-text-muted)]">
            {products.length} compound{products.length !== 1 ? "s" : ""} in catalog
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
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Dosage Variations</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Price Range</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Kit Price Range</th>
                <th className="text-center py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Stock</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--prg-border)]">
              {products.map((p) => {
                const variants = p.variants ?? [];
                const prices = variants.map((v) => v.price).filter(Boolean);
                const kitPrices = variants.map((v) => v.kitPrice).filter(Boolean);
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                const minKitPrice = kitPrices.length > 0 ? Math.min(...kitPrices) : 0;
                const maxKitPrice = kitPrices.length > 0 ? Math.max(...kitPrices) : 0;

                const priceStr =
                  prices.length <= 1 || minPrice === maxPrice
                    ? formatPrice(minPrice)
                    : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;

                const kitPriceStr =
                  kitPrices.length <= 1 || minKitPrice === maxKitPrice
                    ? formatPrice(minKitPrice)
                    : `${formatPrice(minKitPrice)} – ${formatPrice(maxKitPrice)}`;

                const totalStock = variants.reduce((sum, v) => sum + (v.stockQty || 0), 0);
                const hasStock = variants.some((v) => v.inStock && v.stockQty > 0);

                return (
                  <tr key={p.id} className="hover:bg-[var(--prg-bg-alt)]">
                    <td className="py-3 px-4">
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-[var(--prg-text)] hover:text-[var(--prg-accent)]">
                        {p.name}
                      </Link>
                      {p.featured && (
                        <span className="ml-2 prg-badge prg-badge--teal text-[9px] py-0.5 px-2">Featured</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">{p.categoryLabel}</td>
                    <td className="py-3 px-4 text-xs font-mono text-[var(--prg-text-secondary)]">
                      {variants.length > 0
                        ? variants.map((v) => v.dosage).join(" • ")
                        : "No variants"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--prg-accent)]">{priceStr}</td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--prg-text-muted)]">{kitPriceStr}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                        hasStock ? "prg-badge--success" : "prg-badge--danger"
                      }`}>
                        {hasStock ? `${totalStock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/products/${p.id}`} className="text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)] inline-block">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
