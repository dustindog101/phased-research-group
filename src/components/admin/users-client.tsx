"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export function AdminUsersClient({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false)
    );
  }, [users, query]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div>
      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email, username, or name..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
          />
        </div>
      </div>

      <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--prg-border)] bg-[var(--prg-bg-alt)]">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">User</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Username</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Joined</th>
                <th className="text-center py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Orders</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Total Spent</th>
                <th className="text-center py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Role</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--prg-text-muted)]">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--prg-border)] hover:bg-[var(--prg-bg-alt)]">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{u.name ?? u.email}</div>
                      <div className="text-xs text-[var(--prg-text-muted)]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">{u.username}</td>
                    <td className="py-3 px-4 text-xs text-[var(--prg-text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">{u.orderCount}</td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--prg-accent)]">
                      {formatPrice(u.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`prg-badge text-[9px] py-0.5 px-2 ${
                        u.role === "ADMIN" ? "prg-badge--teal" : ""
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        className="text-xs text-[var(--prg-accent)] hover:underline"
                      >
                        {u.role === "ADMIN" ? "Make User" : "Make Admin"}
                      </button>
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
