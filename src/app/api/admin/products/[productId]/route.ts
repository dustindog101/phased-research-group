import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  await requireAdmin();
  const { productId } = await params;
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
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

    const updateData: Record<string, unknown> = {};
    if ("name" in body) updateData.name = body.name;
    if ("slug" in body) updateData.slug = body.slug.toLowerCase().trim();
    if ("category" in body) updateData.category = body.category;
    if ("categoryLabel" in body) updateData.categoryLabel = body.categoryLabel;
    if ("description" in body) updateData.description = body.description;
    if ("longDescription" in body) updateData.longDescription = body.longDescription;
    if ("featured" in body) updateData.featured = Boolean(body.featured);
    if ("imageKey" in body) updateData.imageKey = body.imageKey;

    await db.product.update({
      where: { id: productId },
      data: updateData,
    });

    if (Array.isArray(body.variants)) {
      const incomingVariantIds = body.variants.map((v: { id?: string }) => v.id).filter(Boolean);

      // Delete variants removed by admin
      await db.productVariant.deleteMany({
        where: {
          productId,
          id: { notIn: incomingVariantIds },
        },
      });

      // Upsert remaining variants
      for (let i = 0; i < body.variants.length; i++) {
        const v = body.variants[i];
        const vData = {
          dosage: String(v.dosage || "5mg").trim(),
          displayName: String(v.displayName || `${body.name || "Product"} ${v.dosage}`).trim(),
          sku: String(v.sku).toUpperCase().trim(),
          price: parseFloat(String(v.price)) || 0,
          kitPrice: parseFloat(String(v.kitPrice)) || 0,
          capColor: String(v.capColor || "#0d9488"),
          inStock: Boolean(v.inStock ?? true),
          stockQty: parseInt(String(v.stockQty)) || 0,
          coaUrl: (v.coaUrl as string) || null,
          imageKey: (v.imageKey as string) || null,
          sortOrder: i,
        };

        if (v.id) {
          await db.productVariant.update({
            where: { id: v.id },
            data: vData,
          });
        } else {
          await db.productVariant.create({
            data: {
              ...vData,
              productId,
            },
          });
        }
      }
    }

    const updated = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ product: updated });
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
