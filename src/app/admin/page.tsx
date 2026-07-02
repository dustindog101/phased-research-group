import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrdersCount,
    pendingPayments,
    paidOrders,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    db.order.count(),
    db.user.count(),
    db.product.count(),
    db.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.paymentIntent.count({ where: { status: { in: ["PENDING", "DETECTED"] } } }),
    db.order.count({ where: { paymentStatus: "PAID" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true, user: true },
    }),
  ]);

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue._sum.total ?? 0),
      icon: DollarSign,
      color: "text-[var(--prg-success)]",
      bg: "bg-[rgba(22,163,74,0.08)]",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-[var(--prg-accent)]",
      bg: "bg-[rgba(30,58,95,0.08)]",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-[var(--prg-teal)]",
      bg: "bg-[rgba(13,148,136,0.08)]",
    },
    {
      label: "Products",
      value: totalProducts,
      icon: Package,
      color: "text-[var(--prg-warning)]",
      bg: "bg-[rgba(217,119,6,0.08)]",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)]">
          Overview of your store performance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5"
            >
              <div className={`w-10 h-10 rounded-[var(--prg-radius)] flex items-center justify-center mb-3 ${stat.bg}`}>
                <Icon size={20} className={stat.color} />
              </div>
              <div className="text-[26px] font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px]">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[rgba(30,58,95,0.08)] flex items-center justify-center text-[var(--prg-accent)]">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-[20px] font-bold">{recentOrdersCount}</div>
            <div className="text-xs text-[var(--prg-text-muted)]">Orders (7 days)</div>
          </div>
        </div>
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[rgba(217,119,6,0.08)] flex items-center justify-center text-[var(--prg-warning)]">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[20px] font-bold">{pendingPayments}</div>
            <div className="text-xs text-[var(--prg-text-muted)]">Pending Payments</div>
          </div>
        </div>
        <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--prg-radius)] bg-[rgba(22,163,74,0.08)] flex items-center justify-center text-[var(--prg-success)]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[20px] font-bold">{paidOrders}</div>
            <div className="text-xs text-[var(--prg-text-muted)]">Paid Orders</div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold uppercase tracking-[2px]" style={{ fontFamily: "var(--font-display)" }}>
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[var(--prg-accent)] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--prg-text-muted)] py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--prg-border)]">
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Order</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Customer</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Date</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Status</th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--prg-border)] hover:bg-[var(--prg-bg-alt)]">
                    <td className="py-3 px-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:text-[var(--prg-accent)]">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      {order.user?.email ?? order.guestEmail ?? "—"}
                    </td>
                    <td className="py-3 px-3 text-xs text-[var(--prg-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                        order.paymentStatus === "PAID" ? "prg-badge--success" :
                        order.paymentStatus === "UNPAID" ? "prg-badge--danger" : ""
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[var(--prg-accent)]">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
