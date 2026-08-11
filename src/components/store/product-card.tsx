"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { ProductImage, parseBlobImages } from "./product-image";
import { formatPrice } from "@/lib/constants";
import type { ProductWithVariants } from "@/lib/products";

interface ProductCardProps {
  product: ProductWithVariants;
}

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const variants = product.variants ?? [];
  const activeVariant = variants.find((v) => v.inStock) ?? variants[0];
  const capColor = activeVariant?.capColor ?? "#0d9488";

  // Resolve best image key: parent image > active variant image > any variant image
  const cardImageKey =
    product.imageKey ||
    activeVariant?.imageKey ||
    variants.find((v) => v.imageKey)?.imageKey ||
    null;

  // Calculate single vial price range across variants
  const prices = variants.map((v) => v.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceDisplay =
    prices.length <= 1
      ? formatPrice(minPrice)
      : minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;

  const inStock = variants.some((v) => v.inStock);

  const handleQuickAdd = () => {
    if (!activeVariant) return;
    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      displayName: activeVariant.displayName,
      dosage: activeVariant.dosage,
      price: activeVariant.price,
      capColor: activeVariant.capColor,
      isKit: false,
    });
    setAdded(true);
    toast.success(`${activeVariant.displayName} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden prg-card-hover flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border-b border-[var(--prg-border)] p-6 relative"
      >
        <ProductImage
          slug={product.slug}
          capColor={capColor}
          alt={`${product.name} research peptide`}
          variant="card"
          className="w-4/5 max-w-[140px] h-auto object-contain"
          blobImages={parseBlobImages(cardImageKey)}
        />
        {variants.length > 1 && (
          <span className="absolute top-3 right-3 bg-[var(--prg-accent)] text-white text-[10px] font-semibold uppercase tracking-[0.5px] px-2 py-0.5 rounded-[var(--prg-radius)]">
            {variants.length} Options
          </span>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="block text-base font-bold text-[var(--prg-text)] mb-0.5 leading-[1.3] hover:text-[var(--prg-accent)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </Link>
          <p className="text-xs text-[var(--prg-text-muted)] mb-3">{product.categoryLabel}</p>

          {/* Dosage preview pills */}
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {variants.slice(0, 4).map((v) => (
                <span
                  key={v.id}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    v.inStock
                      ? "bg-[#f1f5f9] border-[#cbd5e1] text-[var(--prg-text-secondary)]"
                      : "bg-[#f8fafc] border-[#e2e8f0] text-[var(--prg-text-muted)] line-through opacity-60"
                  }`}
                >
                  {v.dosage}
                </span>
              ))}
              {variants.length > 4 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f1f5f9] border border-[#cbd5e1] text-[var(--prg-text-muted)]">
                  +{variants.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-[18px] font-bold text-[var(--prg-accent)]">
            {priceDisplay}
            <span className="text-xs font-normal text-[var(--prg-text-muted)] ml-1">/ vial</span>
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-4 pt-0">
        <Link
          href={`/products/${product.slug}`}
          className="flex-1 py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[1px] text-center rounded-[var(--prg-radius)] border border-[var(--prg-border)] bg-[var(--prg-bg-alt)] text-[var(--prg-text)] hover:border-[var(--prg-accent)] hover:text-[var(--prg-accent)] transition-colors"
        >
          Options
        </Link>
        <button
          onClick={handleQuickAdd}
          disabled={!inStock}
          className={`flex-1 py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[1px] rounded-[var(--prg-radius)] transition-colors text-white ${
            added
              ? "bg-[var(--prg-success)]"
              : "bg-[var(--prg-accent)] hover:bg-[var(--prg-accent-hover)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? "Added!" : inStock ? "Add to Cart" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
      <div className="aspect-square bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[var(--prg-bg-elevated)] rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-[var(--prg-bg-elevated)] rounded w-1/2 animate-pulse" />
        <div className="h-5 bg-[var(--prg-bg-elevated)] rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
