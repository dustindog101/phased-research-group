import { notFound } from "next/navigation";
import { db } from "@/db";
import { OrderPaymentPage } from "@/components/store/order-payment-page";
import { formatPrice } from "@/lib/constants";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ pay?: string; payToken?: string }>;
}) {
  const { orderId } = await params;
  const { pay, payToken } = await searchParams;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true, paymentIntent: true },
  });

  if (!order) notFound();

  const shippingAddress = order.shippingAddress as {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  } | null;

  const isPaid = order.paymentStatus === "PAID";

  return (
    <section className="py-10">
      <div className="prg-container max-w-2xl">
        {/* Success/Pending banner */}
        <div className={`text-center mb-8 p-6 rounded-[var(--prg-radius-lg)] ${
          isPaid
            ? "bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.2)]"
            : "bg-[rgba(217,119,6,0.05)] border border-[rgba(217,119,6,0.2)]"
        }`}>
          {isPaid ? (
            <>
              <CheckCircle2 size={48} className="mx-auto mb-3 text-[var(--prg-success)]" />
              <h1 className="text-[24px] font-bold uppercase tracking-[2px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Payment Confirmed
              </h1>
              <p className="text-sm text-[var(--prg-text-secondary)]">
                We received your payment. Your order is being processed.
              </p>
            </>
          ) : (
            <>
              <Clock size={48} className="mx-auto mb-3 text-[var(--prg-warning)]" />
              <h1 className="text-[24px] font-bold uppercase tracking-[2px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Order Placed
              </h1>
              <p className="text-sm text-[var(--prg-text-secondary)]">
                Complete your crypto payment to finish the order.
              </p>
            </>
          )}
          <p className="text-xs text-[var(--prg-text-muted)] mt-3 font-mono">
            Order: {order.orderNumber}
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 mb-6">
          <h2 className="text-[16px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Order Summary
          </h2>

          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm pb-3 border-b border-[var(--prg-border)] last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name} {item.dosage}</p>
                  <p className="text-xs text-[var(--prg-text-muted)]">
                    {item.isKit ? "5-vial kit" : "Single vial"} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-[var(--prg-accent)]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-sm border-t border-[var(--prg-border)] pt-3">
            <div className="flex justify-between">
              <span className="text-[var(--prg-text-muted)]">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-[var(--prg-success)]">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--prg-text-muted)]">Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--prg-border)]">
              <span>Total</span>
              <span className="text-[var(--prg-accent)]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 mb-6">
          <h2 className="text-[16px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Shipping Address
          </h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{shippingAddress?.fullName}</p>
            <p className="text-[var(--prg-text-muted)]">{shippingAddress?.line1}</p>
            {shippingAddress?.line2 && <p className="text-[var(--prg-text-muted)]">{shippingAddress.line2}</p>}
            <p className="text-[var(--prg-text-muted)]">
              {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}
            </p>
          </div>
        </div>

        {/* Payment section — only if unpaid */}
        {!isPaid ? (
          <OrderPaymentPage
            orderId={order.id}
            payToken={payToken}
            autoOpen={pay === "1"}
          />
        ) : (
          <div className="text-center">
            <p className="text-sm text-[var(--prg-text-muted)] mb-4">
              Your order is being processed. We&apos;ll email you a tracking number when it ships.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
