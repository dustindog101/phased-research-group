"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Check, ChevronRight, FlaskConical } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { VialSVG } from "@/components/store/VialSVG";
import { ProductImage, parseBlobImages, resolveProductImageBlob } from "@/components/store/product-image";
import { formatPrice, DEFAULT_PRODUCT_DESCRIPTION } from "@/lib/constants";
import type { ProductWithVariants } from "@/lib/products";
import type { ProductVariant } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
  product: ProductWithVariants;
  related: ProductWithVariants[];
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedDosage = searchParams.get("dosage")?.toLowerCase();

  const variants = product.variants ?? [];

  // Find initial variant based on URL query param or first available in-stock variant
  const initialVariant =
    variants.find((v) => v.dosage.toLowerCase() === requestedDosage) ??
    variants.find((v) => v.inStock) ??
    variants[0];

  const [activeVariant, setActiveVariant] = useState<ProductVariant | undefined>(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  // Update active variant and update browser URL bar cleanly without firing network requests
  const handleVariantSelect = (variant: ProductVariant) => {
    setActiveVariant(variant);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("dosage", variant.dosage.toLowerCase());
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    if (requestedDosage) {
      const found = variants.find((v) => v.dosage.toLowerCase() === requestedDosage);
      if (found && found.id !== activeVariant?.id) {
        setActiveVariant(found);
      }
    }
  }, [requestedDosage, variants, activeVariant?.id]);

  const currentPrice = activeVariant?.price ?? 0;
  const inStock = activeVariant?.inStock ?? false;
  const capColor = activeVariant?.capColor ?? "#0d9488";
  const sku = activeVariant?.sku ?? "";
  const coaUrl = activeVariant?.coaUrl ?? product.description;

  // Resolve best image blob: active variant image > parent product image > any sibling variant image
  const blobImages = resolveProductImageBlob(product, activeVariant?.id);

  const handleAddToCart = () => {
    if (!activeVariant) return;
    addItem(
      {
        variantId: activeVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        displayName: activeVariant.displayName,
        dosage: activeVariant.dosage,
        price: activeVariant.price,
        capColor: activeVariant.capColor,
        isKit: false,
      },
      quantity
    );
    setAdded(true);
    toast.success(`${activeVariant.displayName} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push("/cart"), 300);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
        <div className="prg-container py-4">
          <nav className="flex items-center gap-2 text-xs text-[var(--prg-text-muted)]">
            <Link href="/" className="hover:text-[var(--prg-accent)]">Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="hover:text-[var(--prg-accent)]">Shop</Link>
            <ChevronRight size={14} />
            <Link href={`/shop?category=${product.category}`} className="hover:text-[var(--prg-accent)]">
              {product.categoryLabel}
            </Link>
            <ChevronRight size={14} />
            <span className="text-[var(--prg-text)]">{product.name}</span>
            {activeVariant && (
              <>
                <ChevronRight size={14} />
                <span className="text-[var(--prg-text-secondary)] font-medium">{activeVariant.dosage}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <section className="py-12">
        <div className="prg-container grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image preview & thumbnails gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-12 relative overflow-hidden">
              <ProductImage
                slug={product.slug}
                capColor={capColor}
                alt={`${product.name} ${activeVariant?.dosage ?? ""} research peptide vial`}
                variant="detail"
                priority
                className="max-w-full max-h-full object-contain"
                blobImages={blobImages}
              />
            </div>

            {/* Thumbnail gallery for variants */}
            {variants.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {variants.map((v) => {
                  const isSelected = v.id === activeVariant?.id;
                  const vImageKey = v.imageKey || product.imageKey;
                  const vBlob = parseBlobImages(vImageKey);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVariantSelect(v)}
                      className={`aspect-square flex flex-col items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border rounded-[var(--prg-radius)] p-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--prg-accent)] ring-2 ring-[var(--prg-accent)]/20"
                          : "border-[var(--prg-border)] hover:border-[var(--prg-accent)]"
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        <ProductImage
                          slug={product.slug}
                          capColor={v.capColor}
                          alt={`${v.dosage}`}
                          variant="thumb"
                          blobImages={vBlob}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--prg-text-secondary)] mt-1">
                        {v.dosage}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="flex flex-col">
            <span className="prg-badge mb-3">{product.categoryLabel}</span>
            <h1
              className="text-[32px] font-bold uppercase tracking-[2px] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h1>
            <p className="text-[var(--prg-text-muted)] text-sm mb-4 font-mono">SKU: {sku}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[36px] font-bold text-[var(--prg-accent)]">
                {formatPrice(currentPrice)}
              </span>
              <span className="text-sm text-[var(--prg-text-muted)]">per vial</span>
            </div>

            {/* Dosage variation selector (Rule: 1 dosage -> hidden; 2-4 dosages -> Pills; 5+ dosages -> Dropdown) */}
            {variants.length > 1 && (
              <div className="border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 mb-6 bg-white">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-3">
                  Dosage Variation
                </label>

                {variants.length <= 4 ? (
                  /* 2-4 Dosages: Modern Pill Buttons */
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const isSelected = v.id === activeVariant?.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleVariantSelect(v)}
                          className={`py-3 px-5 border-2 rounded-[var(--prg-radius)] text-sm font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "border-[var(--prg-accent)] bg-[rgba(30,58,95,0.05)] text-[var(--prg-accent)]"
                              : "border-[var(--prg-border)] bg-white text-[var(--prg-text)] hover:border-[var(--prg-accent)]"
                          } ${!v.inStock ? "opacity-50 line-through" : ""}`}
                        >
                          {v.dosage} {!v.inStock && "(Sold Out)"}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* 5+ Dosages: Custom Dropdown Menu */
                  <select
                    value={activeVariant?.id ?? ""}
                    onChange={(e) => {
                      const selected = variants.find((v) => v.id === e.target.value);
                      if (selected) handleVariantSelect(selected);
                    }}
                    className="w-full py-3 px-4 border-2 border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-semibold bg-white text-[var(--prg-text)] focus:outline-none focus:border-[var(--prg-accent)] cursor-pointer"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id} disabled={!v.inStock}>
                        {v.dosage} — {formatPrice(v.price)} {v.inStock ? "(In Stock)" : "(Out of Stock)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Quantity + add to cart */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-[var(--prg-border)] rounded-[var(--prg-radius)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-[var(--prg-bg-alt)] hover:bg-[#e2e8f0]"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 h-12 text-center border-x border-[var(--prg-border)] font-medium"
                  min={1}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-[var(--prg-bg-alt)] hover:bg-[#e2e8f0]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--prg-radius)] text-[13px] font-medium uppercase tracking-[2px] text-white transition-all ${
                  added
                    ? "bg-[var(--prg-success)]"
                    : "bg-[var(--prg-accent)] hover:bg-[var(--prg-accent-hover)] hover:-translate-y-0.5"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="w-full px-6 py-3 border-2 border-[var(--prg-accent)] text-[var(--prg-accent)] rounded-[var(--prg-radius)] text-[13px] font-medium uppercase tracking-[2px] hover:bg-[var(--prg-accent)] hover:text-white transition-all mb-6 disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Buy Now
            </button>

            {/* Stock + description */}
            <div className="space-y-4">
              {inStock ? (
                <div className="flex items-center gap-2 text-sm text-[var(--prg-success)] font-medium">
                  <Check size={16} /> In stock — ready to ship
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[var(--prg-danger)] font-medium">
                  <FlaskConical size={16} /> Out of stock — check back soon
                </div>
              )}

              <div className="border-t border-[var(--prg-border)] pt-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-[1.5px] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Description
                </h3>
                <p className="text-sm text-[var(--prg-text-secondary)] leading-[1.7]">
                  {product.description || DEFAULT_PRODUCT_DESCRIPTION}
                </p>
              </div>

              <div className="border-t border-[var(--prg-border)] pt-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--prg-text-muted)]">Category:</span>
                  <Link href={`/shop?category=${product.category}`} className="text-[var(--prg-accent)] hover:underline">
                    {product.categoryLabel}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--prg-text-muted)]">SKU:</span>
                  <span className="font-mono">{sku}</span>
                </div>
                {coaUrl && (
                  <div className="flex justify-between">
                    <span className="text-[var(--prg-text-muted)]">COA:</span>
                    <a href={coaUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--prg-accent)] hover:underline font-medium">
                      View Certificate →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-16 bg-[var(--prg-bg-alt)] border-t border-[var(--prg-border)]">
          <div className="prg-container">
            <h2
              className="text-[28px] font-bold uppercase tracking-[3px] text-center mb-10"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => {
                const firstVar = p.variants?.[0];
                const pCapColor = firstVar?.capColor ?? "#0d9488";
                const pPrice = firstVar?.price ?? 0;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4 prg-card-hover flex flex-col justify-between"
                  >
                    <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-[var(--prg-radius)] mb-3 p-4">
                      <VialSVG capColor={pCapColor} size={80} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                        {p.name}
                      </div>
                      <div className="text-[var(--prg-accent)] font-bold">{formatPrice(pPrice)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
