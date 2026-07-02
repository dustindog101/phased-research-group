import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import { ChevronRight, ArrowLeft, Check, Clock, Truck, Package } from "lucide-react";
import { OrderPayButton } from "@/components/account/order-pay-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireUser();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, paymentIntent: true },
  });

  if (!order) notFound();
  if (order.userId !== user.id && user.role !== "ADMIN") {
    notFound();
  }

  const shippingAddress = order.shippingAddress as {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };

  const statusSteps = [
    { key: "PENDING", label: "Order Placed", icon: Package },
    { key: "PAID", label: "Payment Received", icon: Check },
    { key: "PROCESSING", label: "Processing", icon: Clock },
    { key: "SHIPPED", label: "Shipped", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: Check },
  ];
  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <section className="py-10">
      <div className="prg-container max-w-4xl">
        <nav className="flex items-center gap-2 text-xs text-[var(--prg-text-muted)] mb-4">
          <Link href="/account" className="hover:text-[var(--prg-accent)]">Account</Link>
          <ChevronRight size={14} />
          <Link href="/account/orders" className="hover:text-[var(--prg-accent)]">Orders</Link>
          <ChevronRight size={14} />
          <span className="text-[var(--prg-text)]">{order.orderNumber}</span>
        </nav>

        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-xs text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)] mb-4"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold uppercase tracking-[2px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-[var(--prg-text-muted)]">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`prg-badge ${
                order.paymentStatus === "PAID"
                  ? "prg-badge--success"
                  : order.paymentStatus === "UNPAID"
                    ? "prg-badge--danger"
                    : ""
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
            <span className="prg-badge prg-badge--teal">{order.status}</span>
          </div>
        </div>

        {/* Status tracker */}
        {order.paymentStatus === "PAID" && (
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 mb-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, idx) => {
                const Icon = step.icon;
                const isComplete = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isComplete
                            ? "bg-[var(--prg-accent)] text-white"
                            : "bg-[var(--prg-bg-elevated)] text-[var(--prg-text-muted)]"
                        } ${isCurrent ? "ring-4 ring-[var(--prg-accent)]/15" : ""}`}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-[1px] text-center ${
                          isComplete ? "text-[var(--prg-accent)] font-medium" : "text-[var(--prg-text-muted)]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-2 -mt-6 ${
                          idx < currentStepIdx ? "bg-[var(--prg-accent)]" : "bg-[var(--prg-border)]"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-[var(--prg-border)] text-sm">
                <span className="text-[var(--prg-text-muted)]">Tracking Number: </span>
                <span className="font-mono font-medium">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Items */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 pb-3 border-b border-[var(--prg-border)] last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      className="text-sm font-medium hover:text-[var(--prg-accent)]"
                    >
                      {item.name} {item.dosage}
                    </Link>
                    <p className="text-xs text-[var(--prg-text-muted)] mt-0.5">
                      {item.isKit ? "5-vial kit" : "Single vial"} · Qty: {item.quantity} · SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-[var(--prg-accent)]">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + address */}
          <div className="space-y-4">
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Summary
              </h3>
              <div className="space-y-2 text-sm">
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
                <div className="flex justify-between font-bold pt-2 border-t border-[var(--prg-border)]">
                  <span>Total</span>
                  <span className="text-[var(--prg-accent)]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Shipping Address
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{shippingAddress?.fullName}</p>
                <p className="text-[var(--prg-text-muted)]">{shippingAddress?.line1}</p>
                {shippingAddress?.line2 && <p className="text-[var(--prg-text-muted)]">{shippingAddress.line2}</p>}
                <p className="text-[var(--prg-text-muted)]">
                  {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}
                </p>
                <p className="text-[var(--prg-text-muted)]">{shippingAddress?.country}</p>
                {shippingAddress?.phone && (
                  <p className="text-[var(--prg-text-muted)]">{shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {order.paymentStatus === "UNPAID" && (
              <OrderPayButton orderId={order.id} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
