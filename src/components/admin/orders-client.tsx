"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/constants";
import { Search, ChevronRight } from "lucide-react";

interface AdminOrder {
  id: string;
  orderNumber: string;
  userEmail: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
}

export function AdminOrdersClient({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const statusFilters = ["all", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const paymentFilters = ["all", "UNPAID", "PENDING", "PAID", "REFUNDED"];

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    if (!query) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q)
    );
  }, [orders, query]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order # or email..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
            />
          </div>

          <select
            value={searchParams.get("status") ?? "all"}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="py-2 px-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm bg-white"
          >
            {statusFilters.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>
            ))}
          </select>

          <select
            value={searchParams.get("paymentStatus") ?? "all"}
            onChange={(e) => updateFilter("paymentStatus", e.target.value)}
            className="py-2 px-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm bg-white"
          >
            {paymentFilters.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Payments" : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Order</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Customer</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Date</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Items</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Status</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Payment</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Total</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--prg-text-muted)]">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--prg-border)] hover:bg-[var(--prg-bg-alt)]">
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:text-[var(--prg-accent)]">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs">{order.userEmail}</td>
                    <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs">{order.itemCount}</td>
                    <td className="py-3 px-4">
                      <span className="prg-badge prg-badge--teal text-[9px] py-0.5 px-2">{order.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                        order.paymentStatus === "PAID" ? "prg-badge--success" :
                        order.paymentStatus === "UNPAID" ? "prg-badge--danger" : ""
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--prg-accent)]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)]">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
