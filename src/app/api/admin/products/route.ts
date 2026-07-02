/**
 * Admin Products API
 *   GET    /api/admin/products       — list all products
 *   POST   /api/admin/products       — create a product
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const products = await db.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }, { dosage: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  try {
    const body = await req.json();

    // Validate required fields
    const required = ["slug", "name", "displayName", "category", "dosage", "sku", "price", "kitPrice"];
    for (const f of required) {
      if (body[f] === undefined || body[f] === "") {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

    const product = await db.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        displayName: body.displayName,
        category: body.category,
        categoryLabel: body.categoryLabel ?? body.category,
        dosage: body.dosage,
        sku: body.sku.toUpperCase(),
        price: parseFloat(body.price),
        kitPrice: parseFloat(body.kitPrice),
        capColor: body.capColor ?? "#0d9488",
        featured: Boolean(body.featured),
        inStock: body.inStock ?? true,
        stockQty: parseInt(body.stockQty) || 0,
        description: body.description ?? null,
        longDescription: body.longDescription ?? null,
        coaUrl: body.coaUrl ?? null,
      },
    });
    return NextResponse.json({ product });
  } catch (e) {
    console.error("POST /api/admin/products error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
