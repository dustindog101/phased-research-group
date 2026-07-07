"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCart, KIT_MULTIPLIER } from "@/hooks/useCart";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CryptoPayModal } from "@/components/payments/crypto-pay-modal";
import { VialThumb } from "@/components/store/VialSVG";
import { ProductImage } from "@/components/store/product-image";
import {
  formatPrice,
  getShippingCost,
  FREE_SHIPPING_THRESHOLD,
  US_STATES,
  RUO_DISCLAIMER,
} from "@/lib/constants";
import { Check, Lock, AlertCircle, Loader2, Bitcoin, ChevronRight } from "lucide-react";

interface CryptoMethod {
  id: string;
  label: string;
  symbol: string;
  icon: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [cryptoMethods, setCryptoMethods] = useState<CryptoMethod[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState<"ground" | "express">("ground");
  const [ruoAccepted, setRuoAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string>("");
  const [payToken, setPayToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "TX",
    zip: "",
    country: "US",
    phone: "",
  });

  useEffect(() => {
    fetch("/api/payments/methods")
      .then((r) => r.json())
      .then((data) => {
        if (data.methods?.length > 0) {
          setCryptoMethods(data.methods);
          setSelectedAsset(data.methods[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, fullName: user.name ?? f.fullName, email: user.email }));
    }
  }, [user]);

  const discountRate =
    couponCode === "PRG10" ? 0.1 : couponCode === "RESEARCH15" ? 0.15 : 0;
  const discountAmount = subtotal * discountRate;
  const afterDiscount = subtotal - discountAmount;
  const shipping = getShippingCost(afterDiscount, shippingMethod);
  const total = afterDiscount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!ruoAccepted || !ageConfirmed) {
      toast.error("Please accept the research use and age confirmations");
      return;
    }
    if (!selectedAsset && cryptoMethods.length > 0) {
      toast.error("Please select a payment method");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create the order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            isKit: i.isKit,
          })),
          email: form.email,
          shippingAddress: {
            fullName: form.fullName,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
            phone: form.phone,
          },
          shippingMethod,
          couponCode,
          paymentMethod: `Crypto: ${cryptoMethods.find((m) => m.id === selectedAsset)?.label ?? selectedAsset}`,
          cryptoAsset: selectedAsset,
          ruoAccepted,
          ageConfirmed,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      const orderId = orderData.orderId;

      // Step 2: Create the payment intent
      const intentRes = await fetch("/api/payments/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          orderId,
          asset: selectedAsset,
        }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error || "Failed to create payment intent");

      // Step 3: If not logged in, mint a pay token for the guest
      if (!user) {
        const payRes = await fetch("/api/payments/pay-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const payData = await payRes.json();
        if (payRes.ok) setPayToken(payData.payToken);
      }

      setPendingOrderId(orderId);
      setPayModalOpen(true);
      toast.success("Order created! Complete your crypto payment.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = () => {
    clear();
    toast.success("Payment confirmed! Redirecting to order confirmation...");
    setTimeout(() => {
      router.push(`/account/orders/${pendingOrderId}`);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <section className="py-20">
        <div className="prg-container text-center">
          <h1 className="text-[28px] font-bold uppercase tracking-[2px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Your Cart is Empty
          </h1>
          <p className="text-[var(--prg-text-muted)] mb-6">Add items to your cart before checking out.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shop Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-10">
        <div className="prg-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--prg-text-muted)] mb-6">
            <Link href="/cart" className="hover:text-[var(--prg-accent)]">Cart</Link>
            <ChevronRight size={14} />
            <span className="text-[var(--prg-text)]">Checkout</span>
          </nav>

          <h1 className="text-[32px] font-bold uppercase tracking-[3px] mb-8" style={{ fontFamily: "var(--font-display)" }}>
            Checkout
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
            {/* Left: form */}
            <div className="space-y-8">
              {/* Contact */}
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
                <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
                <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={form.line1}
                      onChange={(e) => setForm({ ...form, line1: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Address Line 2</label>
                    <input
                      type="text"
                      value={form.line2}
                      onChange={(e) => setForm({ ...form, line2: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                      placeholder="Apt, suite, etc. (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">State *</label>
                    <select
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                    >
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping method */}
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
                <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Shipping Method
                </h2>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] cursor-pointer hover:border-[var(--prg-accent)] has-[:checked]:border-[var(--prg-accent)] has-[:checked]:bg-[rgba(30,58,95,0.03)]">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ship" checked={shippingMethod === "ground"} onChange={() => setShippingMethod("ground")} className="accent-[var(--prg-accent)]" />
                      <span className="text-sm">UPS/USPS Ground (3-5 business days)</span>
                    </div>
                    <span className="text-sm font-medium">
                      {afterDiscount >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatPrice(10.75)}
                    </span>
                  </label>
                  <label className="flex items-center justify-between p-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] cursor-pointer hover:border-[var(--prg-accent)] has-[:checked]:border-[var(--prg-accent)] has-[:checked]:bg-[rgba(30,58,95,0.03)]">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ship" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} className="accent-[var(--prg-accent)]" />
                      <span className="text-sm">Express (2-Day)</span>
                    </div>
                    <span className="text-sm font-medium">
                      {afterDiscount >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatPrice(22.95)}
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
                <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Payment Method
                </h2>
                {cryptoMethods.length === 0 ? (
                  <div className="p-4 bg-[var(--prg-bg-alt)] rounded-[var(--prg-radius)] text-sm text-[var(--prg-text-muted)]">
                    No crypto payment methods are currently enabled. Please contact support.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cryptoMethods.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setSelectedAsset(m.id)}
                        className={`p-3 border-2 rounded-[var(--prg-radius)] text-left transition-all ${
                          selectedAsset === m.id
                            ? "border-[var(--prg-accent)] bg-[rgba(30,58,95,0.03)]"
                            : "border-[var(--prg-border)] hover:border-[var(--prg-border-hover)]"
                        }`}
                      >
                        <div className="text-lg mb-1">{m.icon}</div>
                        <div className="text-xs font-semibold">{m.label}</div>
                        <div className="text-[10px] text-[var(--prg-text-muted)]">{m.symbol}</div>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-[var(--prg-text-muted)] mt-3 flex items-center gap-1.5">
                  <Lock size={12} /> Self-hosted crypto wallet · No third-party processor
                </p>
              </div>

              {/* Confirmations */}
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruoAccepted}
                    onChange={(e) => setRuoAccepted(e.target.checked)}
                    className="mt-0.5 accent-[var(--prg-accent)]"
                  />
                  <span className="text-xs text-[var(--prg-text-secondary)] leading-relaxed">
                    I confirm that I am purchasing these products <strong>for laboratory research use only</strong>,
                    not for human consumption, diagnostic, or therapeutic use. I have read and agree to the{" "}
                    <Link href="/terms" className="text-[var(--prg-accent)] underline">Terms of Service</Link>.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[var(--prg-accent)]"
                  />
                  <span className="text-xs text-[var(--prg-text-secondary)] leading-relaxed">
                    I confirm that I am <strong>21 years of age or older</strong> and legally permitted
                    to purchase these research materials in my jurisdiction.
                  </span>
                </label>
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
                <h2 className="text-[18px] font-semibold uppercase tracking-[2px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto prg-scroll">
                  {items.map((item) => {
                    const unitPrice = item.isKit ? item.price * KIT_MULTIPLIER : item.price;
                    const lineTotal = unitPrice * item.quantity;
                    return (
                      <div key={`${item.productId}-${item.isKit}`} className="flex gap-3">
                        <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded overflow-hidden">
                          <ProductImage
                            slug={item.slug}
                            capColor={item.capColor}
                            alt={`${item.displayName} research peptide`}
                            variant="table"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{item.displayName}</p>
                          <p className="text-[10px] text-[var(--prg-text-muted)]">
                            {item.isKit ? "5-vial kit" : "Single vial"} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-xs font-medium text-[var(--prg-accent)]">
                          {formatPrice(lineTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {couponCode && (
                  <div className="flex items-center justify-between p-2 bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.2)] rounded-[var(--prg-radius)] mb-3 text-xs">
                    <span>Coupon: {couponCode}</span>
                    <span className="text-[var(--prg-success)]">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="space-y-2 border-t border-[var(--prg-border)] pt-3 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--prg-text-muted)]">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-[var(--prg-success)]">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--prg-text-muted)]">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-4 pt-3 border-t border-[var(--prg-border)]">
                  <span>Total</span>
                  <span className="text-[var(--prg-accent)]">{formatPrice(total)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !ruoAccepted || !ageConfirmed}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Bitcoin size={16} /> Pay with Crypto
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[var(--prg-text-muted)] text-center mt-3 leading-relaxed">
                  By placing this order, you agree to our Terms of Service and acknowledge that all
                  products are for research use only.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <CryptoPayModal
        orderId={pendingOrderId}
        payToken={payToken}
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaid={handlePaid}
      />
    </>
  );
}
