import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import { Package, MapPin, User as UserIcon, LogOut, ChevronRight, Settings } from "lucide-react";
import { signOut } from "@/auth";

export default async function AccountPage() {
  const user = await requireUser();

  const [orderCount, addressCount] = await Promise.all([
    db.order.count({ where: { userId: user.id } }),
    db.address.count({ where: { userId: user.id } }),
  ]);

  const recentOrders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });

  return (
    <section className="py-10">
      <div className="prg-container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[32px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              My Account
            </h1>
            <p className="text-sm text-[var(--prg-text-muted)]">Welcome back, {user.name || user.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="flex gap-2"
          >
            <Link
              href="/account/settings"
              className="flex items-center gap-2 px-4 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-xs font-medium uppercase tracking-[1.5px] hover:border-[var(--prg-accent)] hover:text-[var(--prg-accent)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-xs font-medium uppercase tracking-[1.5px] hover:border-[var(--prg-danger)] hover:text-[var(--prg-danger)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </form>
        </div>

        {user.role === "ADMIN" && (
          <div className="mb-6 p-4 bg-[rgba(30,58,95,0.05)] border border-[rgba(30,58,95,0.15)] rounded-[var(--prg-radius-lg)] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--prg-accent)]">Admin Access</p>
              <p className="text-xs text-[var(--prg-text-muted)]">You have administrator privileges</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin Dashboard
            </Link>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/account/orders"
            className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 prg-card-hover flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[rgba(30,58,95,0.06)] flex items-center justify-center text-[var(--prg-accent)]">
              <Package size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{orderCount}</div>
              <div className="text-xs text-[var(--prg-text-muted)]">Orders</div>
            </div>
          </Link>

          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[rgba(30,58,95,0.06)] flex items-center justify-center text-[var(--prg-accent)]">
              <UserIcon size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold">{user.email}</div>
              <div className="text-xs text-[var(--prg-text-muted)]">Account Email</div>
            </div>
          </div>

          <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[rgba(30,58,95,0.06)] flex items-center justify-center text-[var(--prg-accent)]">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{addressCount}</div>
              <div className="text-xs text-[var(--prg-text-muted)]">Saved Addresses</div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold uppercase tracking-[2px]" style={{ fontFamily: "var(--font-display)" }}>
              Recent Orders
            </h2>
            <Link href="/account/orders" className="text-xs text-[var(--prg-accent)] hover:underline">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="mx-auto mb-3 text-[var(--prg-text-muted)] opacity-40" />
              <p className="text-sm text-[var(--prg-text-muted)] mb-4">No orders yet</p>
              <Link
                href="/shop"
                className="inline-block px-4 py-2 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between p-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] hover:border-[var(--prg-accent)] hover:bg-[var(--prg-bg-alt)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold font-mono">{order.orderNumber}</span>
                      <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                        order.paymentStatus === "PAID" ? "prg-badge--success" : ""
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--prg-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--prg-accent)]">{formatPrice(order.total)}</span>
                    <ChevronRight size={16} className="text-[var(--prg-text-muted)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
