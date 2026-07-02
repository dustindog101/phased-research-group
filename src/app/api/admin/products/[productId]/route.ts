import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  await requireAdmin();
  const { productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  await requireAdmin();
  const { productId } = await params;
  try {
    const body = await req.json();
    const allowed = [
      "slug", "name", "displayName", "category", "categoryLabel",
      "dosage", "sku", "price", "kitPrice", "capColor",
      "featured", "inStock", "stockQty", "description",
      "longDescription", "coaUrl", "imageKey",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        if (key === "price" || key === "kitPrice") {
          data[key] = parseFloat(body[key]);
        } else if (key === "stockQty") {
          data[key] = parseInt(body[key]) || 0;
        } else if (key === "featured" || key === "inStock") {
          data[key] = Boolean(body[key]);
        } else {
          data[key] = body[key];
        }
      }
    }
    const product = await db.product.update({ where: { id: productId }, data });
    return NextResponse.json({ product });
  } catch (e) {
    console.error("PATCH /api/admin/products error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  await requireAdmin();
  const { productId } = await params;
  try {
    await db.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/products error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
