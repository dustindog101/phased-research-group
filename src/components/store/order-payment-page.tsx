"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bitcoin, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CryptoPayModal } from "@/components/payments/crypto-pay-modal";

interface OrderPaymentPageProps {
  orderId: string;
  payToken?: string;
  autoOpen?: boolean;
}

export function OrderPaymentPage({ orderId, payToken: initialPayToken, autoOpen }: OrderPaymentPageProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [payToken, setPayToken] = useState<string | null>(initialPayToken ?? null);
  const [loading, setLoading] = useState(false);

  // Auto-open modal on page load if pay=1
  useEffect(() => {
    if (autoOpen) {
      // If we have a pay token, open modal immediately
      if (payToken) {
        setModalOpen(true);
      } else {
        // Need to get a pay token first (for authed users)
        handleGetPayToken();
      }
    }
  }, [autoOpen, payToken]);

  const handleGetPayToken = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/pay-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayToken(data.payToken);
        setModalOpen(true);
      } else {
        // If pay-session fails, the order might already be paid or not a crypto order
        toast.error(data.error || "Unable to start payment");
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = () => {
    toast.success("Payment confirmed!");
    // Refresh the page to show paid state
    router.refresh();
  };

  return (
    <>
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[rgba(30,58,95,0.08)] flex items-center justify-center">
          <Bitcoin size={28} className="text-[var(--prg-accent)]" />
        </div>
        <h2 className="text-[18px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Payment Required
        </h2>
        <p className="text-sm text-[var(--prg-text-secondary)] mb-5">
          Click below to open the crypto payment window and complete your purchase.
        </p>

        <button
          onClick={payToken ? () => setModalOpen(true) : handleGetPayToken}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Starting...
            </>
          ) : (
            <>
              <Bitcoin size={16} /> Pay with Crypto
            </>
          )}
        </button>

        <div className="mt-5 p-3 bg-[rgba(217,119,6,0.05)] border border-[rgba(217,119,6,0.15)] rounded-[var(--prg-radius)] flex items-start gap-2 text-left">
          <AlertCircle size={14} className="text-[var(--prg-warning)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--prg-text-secondary)]">
            Your cart has been cleared. This page is your receipt — bookmark it or save your order number.
            You can return anytime to complete payment.
          </p>
        </div>
      </div>

      <CryptoPayModal
        orderId={orderId}
        payToken={payToken}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPaid={handlePaid}
      />
    </>
  );
}
