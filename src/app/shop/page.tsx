import { getAllProducts } from "@/lib/products";
import { ShopClient } from "@/components/store/shop-client";
import { Suspense } from "react";

export const metadata = {
  title: "Shop Research Peptides",
  description: "Browse our complete catalog of laboratory-grade research peptides.",
};

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <Suspense fallback={<div className="py-20 text-center text-[var(--prg-text-muted)]">Loading...</div>}>
      <ShopClient products={products} />
    </Suspense>
  );
}
