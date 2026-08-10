/**
 * Admin Products API
 *   GET    /api/admin/products       — list all products with variants
 *   POST   /api/admin/products       — create a parent product + variants
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const products = await db.product.findMany({
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  try {
    const body = await req.json();

    const required = ["name", "slug", "category"];
    for (const f of required) {
      if (!body[f]) {
        return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
      }
    }

    const variants = Array.isArray(body.variants) && body.variants.length > 0
      ? body.variants
      : [
          {
            dosage: "5mg",
            displayName: `${body.name} 5mg`,
            sku: `PRG-${body.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-5MG`,
            price: 50,
            kitPrice: 250,
            capColor: "#0d9488",
            inStock: true,
            stockQty: 100,
          },
        ];

    const product = await db.product.create({
      data: {
        slug: body.slug.toLowerCase().trim(),
        name: body.name.trim(),
        category: body.category,
        categoryLabel: body.categoryLabel ?? body.category,
        description: body.description ?? null,
        longDescription: body.longDescription ?? null,
        featured: Boolean(body.featured),
        imageKey: body.imageKey ?? null,
        variants: {
          create: variants.map((v: Record<string, unknown>, i: number) => ({
            dosage: String(v.dosage || "5mg").trim(),
            displayName: String(v.displayName || `${body.name} ${v.dosage}`).trim(),
            sku: String(v.sku || `PRG-${body.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${v.dosage}`).toUpperCase().trim(),
            price: parseFloat(String(v.price)) || 0,
            kitPrice: parseFloat(String(v.kitPrice)) || 0,
            capColor: String(v.capColor || "#0d9488"),
            inStock: Boolean(v.inStock ?? true),
            stockQty: parseInt(String(v.stockQty)) || 0,
            coaUrl: (v.coaUrl as string) || null,
            imageKey: (v.imageKey as string) || null,
            sortOrder: i,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ product, id: product.id });
  } catch (e) {
    console.error("POST /api/admin/products error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
