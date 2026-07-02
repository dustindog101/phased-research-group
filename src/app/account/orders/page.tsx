import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import { ChevronRight, Package } from "lucide-react";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <section className="py-10">
      <div className="prg-container max-w-4xl">
        <nav className="flex items-center gap-2 text-xs text-[var(--prg-text-muted)] mb-4">
          <Link href="/account" className="hover:text-[var(--prg-accent)]">Account</Link>
          <ChevronRight size={14} />
          <span className="text-[var(--prg-text)]">Orders</span>
        </nav>

        <h1 className="text-[32px] font-bold uppercase tracking-[3px] mb-8" style={{ fontFamily: "var(--font-display)" }}>
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-[var(--prg-text-muted)] opacity-40" />
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              No Orders Yet
            </h2>
            <p className="text-sm text-[var(--prg-text-muted)] mb-6">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 hover:border-[var(--prg-accent)] hover:shadow-[var(--prg-shadow)] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold font-mono">{order.orderNumber}</span>
                    <span
                      className={`prg-badge text-[9px] py-0.5 px-2 ${
                        order.paymentStatus === "PAID"
                          ? "prg-badge--success"
                          : order.paymentStatus === "UNPAID"
                            ? "prg-badge--danger"
                            : ""
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="text-xs text-[var(--prg-text-muted)]">·</span>
                    <span className="text-xs text-[var(--prg-text-muted)]">{order.status}</span>
                  </div>
                  <span className="text-lg font-bold text-[var(--prg-accent)]">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--prg-text-muted)]">
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>{order.items.length} item(s)</span>
                </div>

                {order.paymentStatus === "UNPAID" && (
                  <div className="mt-3 pt-3 border-t border-[var(--prg-border)]">
                    <span className="text-xs text-[var(--prg-warning)] flex items-center gap-1">
                      <Package size={12} /> Payment pending — click to complete your crypto payment
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
