import { notFound } from "next/navigation";
import { db } from "@/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Edit Product
      </h1>
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
