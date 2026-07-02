"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const NAV = [
  { id: "home", label: "Home", href: "/" },
  { id: "shop", label: "Shop", href: "/shop" },
  { id: "product-list", label: "Product List", href: "/products" },
  { id: "about", label: "About", href: "/about" },
  { id: "coa", label: "COA", href: "/coa" },
  { id: "faq", label: "FAQ", href: "/faq" },
  { id: "contact", label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Hydration-safe: don't render client-only values until mounted
  const [mounted, setMounted] = useState(false);
  const itemCount = useCart((s) => s.itemCount());
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Compute display values after mount to avoid hydration mismatch
  const displayCount = mounted ? itemCount : 0;
  const showAccountLink = mounted ? isAuthenticated : false;

  return (
    <>
      {/* Top bar */}
      <div className="bg-[var(--prg-accent)] text-white/75 text-xs py-2 text-center px-4">
        All products are intended for laboratory research use only. Not for human consumption.
      </div>

      <header
        className={`sticky top-0 z-50 bg-white border-b transition-shadow ${
          scrolled ? "shadow-[var(--prg-shadow)]" : "border-[var(--prg-border)]"
        }`}
      >
        <div className="prg-container">
          <div className="flex items-center justify-between gap-4 md:gap-8 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 hover:opacity-85 transition-opacity">
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-sm md:text-base"
                style={{
                  background: "linear-gradient(135deg, var(--prg-accent) 0%, var(--prg-teal) 100%)",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "1px",
                }}
              >
                PR
              </div>
              <div className="leading-[1.1] hidden sm:block">
                <div
                  className="text-[16px] md:text-[18px] font-semibold uppercase tracking-[2px] text-[var(--prg-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Phased Research
                </div>
                <div className="text-[9px] md:text-[10px] font-normal tracking-[3px] text-[var(--prg-text-muted)]">
                  Group
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:block flex-1">
              <ul className="flex items-center justify-center gap-5 xl:gap-7">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      className={`text-xs font-medium uppercase tracking-[1.5px] relative py-2 transition-colors ${
                        isActive(n.href)
                          ? "text-[var(--prg-accent)]"
                          : "text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)]"
                      }`}
                    >
                      {n.label}
                      <span
                        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--prg-accent)] transition-transform origin-center ${
                          isActive(n.href) ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                href={showAccountLink ? "/account" : "/login"}
                className="text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)] transition-colors"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              <Link
                href="/cart"
                className="text-[var(--prg-text-muted)] hover:text-[var(--prg-accent)] transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {displayCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--prg-teal)] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {displayCount > 9 ? "9+" : displayCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden text-[var(--prg-text)]"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-[var(--prg-border)] bg-white shadow-[var(--prg-shadow)]">
            <div className="prg-container py-5">
              <form
                action="/shop"
                className="flex items-center gap-2 md:gap-3"
              >
                <Search className="text-[var(--prg-text-muted)] shrink-0" size={22} />
                <input
                  type="search"
                  name="q"
                  placeholder="Search products, peptides, COAs..."
                  autoFocus
                  className="flex-1 min-w-0 px-3 md:px-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm bg-[var(--prg-bg-alt)] focus:outline-none focus:border-[var(--prg-accent)]"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[var(--prg-accent)] text-white px-4 md:px-5 py-3 rounded-[var(--prg-radius)] text-xs font-medium uppercase tracking-[1.5px] hover:bg-[var(--prg-accent-hover)] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0 text-[var(--prg-text-muted)] hover:text-[var(--prg-text)]"
                >
                  <X size={22} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--prg-border)] bg-white">
            <nav className="prg-container py-4">
              <ul className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 text-sm font-medium uppercase tracking-[1.5px] ${
                        isActive(n.href)
                          ? "text-[var(--prg-accent)]"
                          : "text-[var(--prg-text-muted)]"
                      }`}
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
