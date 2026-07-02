import { notFound } from "next/navigation";
import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import { AdminOrderActions } from "@/components/admin/order-actions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

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
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold uppercase tracking-[2px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Order {order.orderNumber}
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)]">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-4">
          {/* Items */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Items ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 pb-3 border-b border-[var(--prg-border)] last:border-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium">
                      {item.name} {item.dosage}
                    </div>
                    <div className="text-xs text-[var(--prg-text-muted)]">
                      {item.isKit ? "5-vial kit" : "Single vial"} · Qty: {item.quantity} · {item.sku}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[var(--prg-accent)]">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--prg-border)] space-y-1 text-sm">
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
                <span className="text-[var(--prg-text-muted)]">Shipping ({order.shippingMethod})</span>
                <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--prg-border)]">
                <span>Total</span>
                <span className="text-[var(--prg-accent)]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment intent */}
          {order.paymentIntent && (
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Payment Intent
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px] mb-1">Asset</div>
                  <div className="font-medium">{order.cryptoAsset}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px] mb-1">Status</div>
                  <div className="font-medium">{order.paymentIntent.status}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px] mb-1">Amount</div>
                  <div className="font-medium font-mono">{order.paymentIntent.expectedAmount}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px] mb-1">Deposit Address</div>
                  <div className="font-mono text-xs break-all">{order.paymentIntent.depositAddress}</div>
                </div>
                {order.paymentIntent.txHash && (
                  <div className="col-span-2">
                    <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px] mb-1">Tx Hash</div>
                    <div className="font-mono text-xs break-all">{order.paymentIntent.txHash}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping address */}
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
            <h2 className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Shipping Address
            </h2>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AdminOrderActions
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            trackingNumber={order.trackingNumber ?? ""}
            adminNotes={order.adminNotes ?? ""}
            customerNotice={order.customerNotice ?? ""}
          />

          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Customer
            </h3>
            {order.user ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.user.name ?? order.user.username}</p>
                <p className="text-[var(--prg-text-muted)]">{order.user.email}</p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="text-[var(--prg-text-muted)]">Guest checkout</p>
                <p className="font-medium">{order.guestEmail}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
