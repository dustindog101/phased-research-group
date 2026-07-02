"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Bitcoin,
  BarChart3,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/payments", label: "Payments", icon: Bitcoin },
  { href: "/admin/metrics", label: "Metrics", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-60px)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white/80 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, var(--prg-accent) 0%, var(--prg-teal) 100%)",
                fontFamily: "var(--font-display)",
              }}
            >
              PR
            </div>
            <div>
              <div className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Admin Panel
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-[1px]">Phased Research</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--prg-radius)] text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--prg-radius)] text-sm text-white/60 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={16} /> View Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--prg-radius)] text-sm text-white/60 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden w-full">
        <div className="bg-[#0f172a] text-white overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--prg-radius)] text-xs whitespace-nowrap ${
                    isActive ? "bg-white/10 text-white" : "text-white/60"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-[var(--prg-bg-alt)] overflow-x-hidden md:block hidden">
        {children}
      </main>
    </div>
  );
}
