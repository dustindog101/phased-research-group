"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@prisma/client";
import { Search, SlidersHorizontal } from "lucide-react";

interface ShopClientProps {
  products: Product[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export function ShopClient({ products }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const initialQuery = searchParams.get("q") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("featured");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Sync category/query changes to URL (no page reset here — handled in handlers)
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  }, [category, query, router]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list = [...list].sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, category, query, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Shop hero */}
      <section className="py-14 border-b border-[var(--prg-border)] prg-page-hero-gradient">
        <div className="prg-container">
          <span className="prg-eyebrow">Research Peptides</span>
          <h1
            className="text-[40px] font-bold uppercase tracking-[3px] mb-3 mt-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shop All Products
          </h1>
          <p className="text-[16px] text-[var(--prg-text-secondary)] max-w-[560px] mb-6">
            Browse our complete catalog of laboratory-grade research peptides. All products are
            third-party tested with Certificates of Analysis available upon request.
          </p>
          <div className="flex gap-8 flex-wrap">
            <span className="text-sm text-[var(--prg-text-muted)]">
              <strong className="text-[var(--prg-accent)]">{products.length}</strong> products
            </span>
            <span className="text-sm text-[var(--prg-text-muted)]">
              <strong className="text-[var(--prg-accent)]">{CATEGORIES.length}</strong> categories
            </span>
            <span className="text-sm text-[var(--prg-text-muted)]">
              <strong className="text-[var(--prg-accent)]">99%+</strong> purity verified
            </span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-6 sticky top-[60px] bg-white/95 backdrop-blur z-30 border-b border-[var(--prg-border)]">
        <div className="prg-container">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 max-w-[480px] relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)] pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search products..."
                className="w-full py-3 pl-10 pr-4 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm bg-white focus:outline-none focus:border-[var(--prg-accent)]"
              />
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-4 py-2 border rounded-full text-xs font-medium transition-all ${
                  category === "all"
                    ? "bg-[var(--prg-accent)] text-white border-[var(--prg-accent)]"
                    : "bg-white text-[var(--prg-text-muted)] border-[var(--prg-border)] hover:border-[var(--prg-accent)]"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`px-4 py-2 border rounded-full text-xs font-medium transition-all ${
                    category === c.id
                      ? "bg-[var(--prg-accent)] text-white border-[var(--prg-accent)]"
                      : "bg-white text-[var(--prg-text-muted)] border-[var(--prg-border)] hover:border-[var(--prg-accent)]"
                  }`}
                >
                  {c.label.split(" ")[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[var(--prg-text-muted)]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="py-2.5 px-4 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-[13px] bg-white cursor-pointer focus:outline-none focus:border-[var(--prg-accent)]"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-[13px] text-[var(--prg-text-muted)]">
            Showing {paginated.length} of {filtered.length} products
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-12">
        <div className="prg-container">
          {paginated.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto mb-4 text-[var(--prg-text-muted)] opacity-40" />
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                No products found
              </h2>
              <p className="text-[var(--prg-text-muted)]">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 py-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-w-[40px] h-10 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm bg-white hover:bg-[var(--prg-accent)] hover:text-white hover:border-[var(--prg-accent)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current disabled:hover:border-[var(--prg-border)]"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`min-w-[40px] h-10 border rounded-[var(--prg-radius)] text-sm transition-all ${
                    page === i + 1
                      ? "bg-[var(--prg-accent)] text-white border-[var(--prg-accent)]"
                      : "bg-white border-[var(--prg-border)] hover:bg-[var(--prg-accent)] hover:text-white hover:border-[var(--prg-accent)]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="min-w-[40px] h-10 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm bg-white hover:bg-[var(--prg-accent)] hover:text-white hover:border-[var(--prg-accent)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current disabled:hover:border-[var(--prg-border)]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
