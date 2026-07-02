import { getAllProducts } from "@/lib/products";
import ProductListClient from "@/components/store/product-list-client";

export const metadata = {
  title: "Product List",
  description: "Quick-add table view of all research peptides.",
};

export default async function ProductListPage() {
  const products = await getAllProducts();
  return <ProductListClient products={products} />;
}
