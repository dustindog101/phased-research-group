import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByCategory } from "@/lib/products";
import { ProductDetailClient } from "@/components/store/product-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.displayName,
    description: product.description || `Buy ${product.displayName} — ${product.categoryLabel}. Laboratory-grade research peptide.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}
