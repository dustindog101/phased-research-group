"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter your order number");
      return;
    }
    setLoading(true);
    try {
      // Look up the order by order number
      const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Order not found");
        return;
      }
      // Redirect to order view with payToken if it's a crypto order
      router.push(`/account/orders/${data.orderId}`);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 min-h-[50vh]">
      <div className="prg-container max-w-md mx-auto">
        <div className="text-center mb-8">
          <Package size={48} className="mx-auto mb-3 text-[var(--prg-accent)]" />
          <h1 className="text-[28px] font-bold uppercase tracking-[2px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Track Your Order
          </h1>
          <p className="text-sm text-[var(--prg-text-muted)]">
            Enter your order number to view status and payment details
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="PRG-XXXXXXXX"
              className="w-full px-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm font-mono focus:outline-none focus:border-[var(--prg-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For verification"
              className="w-full px-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Track Order
          </button>
        </form>

        <p className="text-center mt-4 text-xs text-[var(--prg-text-muted)]">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-[var(--prg-accent)] hover:underline">
            Create one
          </a>{" "}
          to save your orders.
        </p>
      </div>
    </section>
  );
}
