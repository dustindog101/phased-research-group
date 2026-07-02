import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-6" style={{ fontFamily: "var(--font-display)" }}>
        New Product
      </h1>
      <ProductForm mode="create" />
    </div>
  );
}
