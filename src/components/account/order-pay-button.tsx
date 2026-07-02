"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bitcoin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CryptoPayModal } from "@/components/payments/crypto-pay-modal";

export function OrderPayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [payToken, setPayToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
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
        setOpen(true);
      } else {
        toast.error(data.error || "Unable to initiate payment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Bitcoin size={14} />
        )}
        Complete Crypto Payment
      </button>

      <CryptoPayModal
        orderId={orderId}
        payToken={payToken}
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
        onPaid={() => {
          toast.success("Payment confirmed!");
          router.refresh();
        }}
      />
    </>
  );
}
