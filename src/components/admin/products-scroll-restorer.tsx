"use client";

import { useEffect } from "react";

const SCROLL_KEY = "prg_admin_products_scroll";

export function ProductsScrollRestorer() {
  useEffect(() => {
    // Restore scroll position on mount if saved
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) {
      const y = parseInt(saved, 10);
      if (!isNaN(y) && y > 0) {
        window.scrollTo({ top: y, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: "instant" });
        });
      }
    }

    // Continuously save current scroll position while on admin products page
    const handleScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
