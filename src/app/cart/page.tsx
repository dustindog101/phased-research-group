"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight } from "lucide-react";
import { useCart, KIT_MULTIPLIER } from "@/hooks/useCart";
import { VialThumb } from "@/components/store/VialSVG";
import { ProductImage } from "@/components/store/product-image";
import {
  formatPrice,
  getShippingCost,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants";
import { toast } from "sonner";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const removeCoupon = useCart((s) => s.removeCoupon);
  const subtotal = useCart((s) => s.subtotal());

  const [couponInput, setCouponInput] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"ground" | "express">("ground");

  const discountRate =
    couponCode === "PRG10" ? 0.1 : couponCode === "RESEARCH15" ? 0.15 : 0;
  const discountAmount = subtotal * discountRate;
  const afterDiscount = subtotal - discountAmount;
  const shipping = getShippingCost(afterDiscount, shippingMethod);
  const total = afterDiscount + shipping;
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === "PRG10" || code === "RESEARCH15") {
      applyCoupon(code);
      toast.success(`Coupon ${code} applied!`);
      setCouponInput("");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  if (items.length === 0) {
    return (
      <section className="py-20">
        <div className="prg-container text-center max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto mb-4 text-[var(--prg-text-muted)] opacity-30" />
          <h1
            className="text-[28px] font-bold uppercase tracking-[2px] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Cart is Empty
          </h1>
          <p className="text-[var(--prg-text-muted)] mb-8">
            Browse our catalog of premium research peptides to get started.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/shop"
              className="px-6 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Shop Products
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 border border-[var(--prg-border-hover)] text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:border-[var(--prg-accent)] hover:text-[var(--prg-accent)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Product List
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="prg-container">
        <h1
          className="text-[32px] font-bold uppercase tracking-[3px] mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Items */}
          <div>
            {/* Free shipping progress */}
            <div className="bg-[var(--prg-bg-alt)] rounded-[var(--prg-radius-lg)] p-4 mb-4">
              {remainingForFreeShip > 0 ? (
                <p className="text-sm text-[var(--prg-text-secondary)]">
                  Add <strong className="text-[var(--prg-accent)]">{formatPrice(remainingForFreeShip)}</strong> more
                  to qualify for <strong>free ground shipping</strong>!
                </p>
              ) : (
                <p className="text-sm text-[var(--prg-success)] font-medium flex items-center gap-2">
                  <Tag size={16} /> You qualify for free ground shipping!
                </p>
              )}
              <div className="mt-2 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--prg-teal)] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (afterDiscount / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const unitPrice = item.isKit ? item.price * KIT_MULTIPLIER : item.price;
                const lineTotal = unitPrice * item.quantity;
                return (
                  <div
                    key={`${item.productId}-${item.isKit}`}
                    className="flex gap-4 p-4 border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] bg-white"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-[var(--prg-radius)] overflow-hidden"
                    >
                      <ProductImage
                        slug={item.slug}
                        capColor={item.capColor}
                        alt={`${item.displayName} research peptide`}
                        variant="thumb"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="block font-semibold text-sm mb-1 hover:text-[var(--prg-accent)]"
                      >
                        {item.displayName}
                      </Link>
                      <p className="text-xs text-[var(--prg-text-muted)] mb-2">
                        {item.isKit ? "5-Vial Kit" : "Single Vial"} · {formatPrice(item.price)}/vial
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center border border-[var(--prg-border)] rounded-[var(--prg-radius)] overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.isKit, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center bg-[var(--prg-bg-alt)] hover:bg-[#e2e8f0]"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-[var(--prg-border)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.isKit, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center bg-[var(--prg-bg-alt)] hover:bg-[#e2e8f0]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-[var(--prg-accent)] font-bold">{formatPrice(lineTotal)}</div>
                          <button
                            onClick={() => {
                              removeItem(item.productId, item.isKit);
                              toast.success("Item removed");
                            }}
                            className="text-xs text-[var(--prg-text-muted)] hover:text-[var(--prg-danger)] flex items-center gap-1 ml-auto"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (confirm("Clear all items from your cart?")) {
                  clear();
                  toast.success("Cart cleared");
                }
              }}
              className="mt-4 text-xs text-[var(--prg-text-muted)] hover:text-[var(--prg-danger)]"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
              <h2
                className="text-[18px] font-semibold uppercase tracking-[2px] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Order Summary
              </h2>

              {/* Coupon */}
              {couponCode ? (
                <div className="flex items-center justify-between mb-4 p-3 bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.2)] rounded-[var(--prg-radius)]">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[var(--prg-success)]" />
                    <span className="text-sm font-medium">{couponCode}</span>
                    <span className="text-xs text-[var(--prg-success)]">
                      ({discountRate * 100}% off)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      toast.success("Coupon removed");
                    }}
                    className="text-[var(--prg-text-muted)] hover:text-[var(--prg-danger)]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-semibold uppercase tracking-[1px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Shipping method */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
                  Shipping Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] cursor-pointer hover:border-[var(--prg-accent)] has-[:checked]:border-[var(--prg-accent)] has-[:checked]:bg-[rgba(30,58,95,0.03)]">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "ground"}
                        onChange={() => setShippingMethod("ground")}
                        className="accent-[var(--prg-accent)]"
                      />
                      <span className="text-sm">UPS/USPS Ground</span>
                    </div>
                    <span className="text-sm font-medium">
                      {shipping === 0 && shippingMethod === "ground" ? "FREE" : formatPrice(getShippingCost(afterDiscount, "ground"))}
                    </span>
                  </label>
                  <label className="flex items-center justify-between p-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] cursor-pointer hover:border-[var(--prg-accent)] has-[:checked]:border-[var(--prg-accent)] has-[:checked]:bg-[rgba(30,58,95,0.03)]">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="accent-[var(--prg-accent)]"
                      />
                      <span className="text-sm">Express (2-Day)</span>
                    </div>
                    <span className="text-sm font-medium">
                      {afterDiscount >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatPrice(getShippingCost(afterDiscount, "express"))}
                    </span>
                  </label>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-[var(--prg-border)] pt-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--prg-text-muted)]">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-[var(--prg-success)]">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--prg-text-muted)]">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-4 pt-4 border-t border-[var(--prg-border)]">
                <span>Total</span>
                <span className="text-[var(--prg-accent)]">{formatPrice(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] transition-all"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <p className="text-xs text-[var(--prg-text-muted)] text-center mt-3">
                Secure crypto checkout · BTC, LTC, SOL, USDC
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
