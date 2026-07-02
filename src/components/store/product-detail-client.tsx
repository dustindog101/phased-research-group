"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Check, ChevronRight, FlaskConical } from "lucide-react";
import { useCart, KIT_MULTIPLIER } from "@/hooks/useCart";
import { VialSVG } from "@/components/store/VialSVG";
import { formatPrice, DEFAULT_PRODUCT_DESCRIPTION } from "@/lib/constants";
import type { Product } from "@prisma/client";
import Link from "next/link";

interface ProductDetailClientProps {
  product: Product;
  related: Product[];
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const router = useRouter();
  const [isKit, setIsKit] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const unitPrice = isKit ? product.kitPrice / KIT_MULTIPLIER : product.price;
  const lineTotal = isKit ? product.kitPrice * quantity : product.price * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      displayName: product.displayName,
      dosage: product.dosage,
      price: product.price,
      capColor: product.capColor,
      isKit,
    }, quantity);
    setAdded(true);
    toast.success(`${product.displayName} (${isKit ? "5-vial kit" : "single vial"}) added to cart`);
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
            <span className="text-[var(--prg-text)]">{product.displayName}</span>
          </nav>
        </div>
      </div>

      <section className="py-12">
        <div className="prg-container grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-12">
              <VialSVG capColor={product.capColor} size={280} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[product.capColor, "#0d9488", "#1e3a5f", "#2563eb"].map((color, i) => (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border rounded-[var(--prg-radius)] p-3 ${
                    i === 0 ? "border-[var(--prg-accent)]" : "border-[var(--prg-border)]"
                  }`}
                >
                  <VialSVG capColor={color} size={50} />
                </div>
              ))}
            </div>
          </div>

          {/* Buy box */}
          <div className="flex flex-col">
            <span className="prg-badge mb-3">{product.categoryLabel}</span>
            <h1
              className="text-[32px] font-bold uppercase tracking-[2px] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.displayName}
            </h1>
            <p className="text-[var(--prg-text-muted)] text-sm mb-4">SKU: {product.sku}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[36px] font-bold text-[var(--prg-accent)]">
                {formatPrice(isKit ? product.kitPrice : product.price)}
              </span>
              <span className="text-sm text-[var(--prg-text-muted)]">
                {isKit ? "per 5-vial kit" : "per vial"}
              </span>
            </div>

            {/* Purchase options */}
            <div className="border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 mb-6">
              <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-3">
                Purchase Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsKit(false)}
                  className={`p-4 border-2 rounded-[var(--prg-radius)] text-left transition-all ${
                    !isKit
                      ? "border-[var(--prg-accent)] bg-[rgba(30,58,95,0.03)]"
                      : "border-[var(--prg-border)] hover:border-[var(--prg-border-hover)]"
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">Single Vial</div>
                  <div className="text-lg font-bold text-[var(--prg-accent)]">
                    {formatPrice(product.price)}
                  </div>
                </button>
                <button
                  onClick={() => setIsKit(true)}
                  className={`p-4 border-2 rounded-[var(--prg-radius)] text-left transition-all relative ${
                    isKit
                      ? "border-[var(--prg-accent)] bg-[rgba(30,58,95,0.03)]"
                      : "border-[var(--prg-border)] hover:border-[var(--prg-border-hover)]"
                  }`}
                >
                  <span className="absolute top-2 right-2 prg-badge prg-badge--teal text-[9px] py-0.5 px-2">
                    Save 10%
                  </span>
                  <div className="text-sm font-semibold mb-1">5-Vial Kit</div>
                  <div className="text-lg font-bold text-[var(--prg-accent)]">
                    {formatPrice(product.kitPrice)}
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity + add to cart */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-[var(--prg-border)] rounded-[var(--prg-radius)] overflow-hidden">
                <button
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
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-[var(--prg-bg-alt)] hover:bg-[#e2e8f0]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
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
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="w-full px-6 py-3 border-2 border-[var(--prg-accent)] text-[var(--prg-accent)] rounded-[var(--prg-radius)] text-[13px] font-medium uppercase tracking-[2px] hover:bg-[var(--prg-accent)] hover:text-white transition-all mb-6 disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Buy Now
            </button>

            {/* Stock + description */}
            <div className="space-y-4">
              {product.inStock ? (
                <div className="flex items-center gap-2 text-sm text-[var(--prg-success)]">
                  <Check size={16} /> In stock — ready to ship
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[var(--prg-danger)]">
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
                  <span className="font-mono">{product.sku}</span>
                </div>
                {product.coaUrl && (
                  <div className="flex justify-between">
                    <span className="text-[var(--prg-text-muted)]">COA:</span>
                    <a href={product.coaUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--prg-accent)] hover:underline">
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
        <section className="py-16 bg-[var(--prg-bg-alt)]">
          <div className="prg-container">
            <h2
              className="text-[28px] font-bold uppercase tracking-[3px] text-center mb-10"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Related Products
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4 prg-card-hover"
                >
                  <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-[var(--prg-radius)] mb-3 p-4">
                    <VialSVG capColor={p.capColor} size={80} />
                  </div>
                  <div className="text-sm font-semibold mb-1">{p.displayName}</div>
                  <div className="text-[var(--prg-accent)] font-bold">{formatPrice(p.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
