"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { VialSVG } from "./VialSVG";
import { ProductImage, parseBlobImages } from "./product-image";
import { formatPrice, DEFAULT_PRODUCT_DESCRIPTION } from "@/lib/constants";
import type { Product } from "@prisma/client";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const handleAdd = () => {
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
    setAdded(true);
    toast.success(`${product.displayName} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden prg-card-hover flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border-b border-[var(--prg-border)] p-6"
      >
        <ProductImage
          slug={product.slug}
          capColor={product.capColor}
          alt={`${product.displayName} research peptide`}
          variant="card"
          className="w-4/5 max-w-[140px] h-auto object-contain"
          blobImages={parseBlobImages(product.imageKey)}
        />
      </Link>
      <div className="p-4 flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="block text-sm font-semibold text-[var(--prg-text)] mb-1 leading-[1.4] hover:text-[var(--prg-accent)]"
        >
          {product.displayName}
        </Link>
        <p className="text-xs text-[var(--prg-text-muted)] mb-2">{product.categoryLabel}</p>
        <p className="text-[18px] font-bold text-[var(--prg-accent)]">
          {formatPrice(product.price)}
          <span className="text-xs font-normal text-[var(--prg-text-muted)] ml-1">/ vial</span>
        </p>
        {product.kitPrice > 0 && (
          <p className="text-xs text-[var(--prg-text-muted)] mt-1">
            5-vial kit: {formatPrice(product.kitPrice)}
          </p>
        )}
      </div>
      <div className="flex gap-2 p-4 pt-0">
        <Link
          href={`/products/${product.slug}`}
          className="flex-1 py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[1px] text-center rounded-[var(--prg-radius)] border border-[var(--prg-border)] bg-[var(--prg-bg-alt)] text-[var(--prg-text)] hover:border-[var(--prg-accent)] hover:text-[var(--prg-accent)] transition-colors"
        >
          Details
        </Link>
        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className={`flex-1 py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[1px] rounded-[var(--prg-radius)] transition-colors text-white ${
            added
              ? "bg-[var(--prg-success)]"
              : "bg-[var(--prg-accent)] hover:bg-[var(--prg-accent-hover)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? "Added!" : product.inStock ? "Add to Cart" : "Sold Out"}
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
