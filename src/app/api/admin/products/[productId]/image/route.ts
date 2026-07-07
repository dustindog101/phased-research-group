/**
 * Admin Product Image Upload API
 *   POST /api/admin/products/:productId/image
 *
 * Receives pre-optimized WebP images (5 sizes) generated client-side
 * via Canvas API, uploads them to Vercel Blob, updates product.imageKey.
 *
 * No sharp dependency — image optimization happens in the browser.
 *
 * Expected FormData fields:
 *   thumb, sm, md, lg, xl — each a WebP Blob
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";

/** Check admin auth for API routes */
async function requireAdminApi(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "ADMIN";
}

const SIZES = ["thumb", "sm", "md", "lg", "xl"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { productId } = await params;

  try {
    const { put, del } = await import("@vercel/blob");

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();

    // Validate all 5 sizes are present
    const files: Record<string, File> = {};
    for (const size of SIZES) {
      const file = formData.get(size) as File | null;
      if (!file) {
        return NextResponse.json({ error: `Missing image size: ${size}` }, { status: 400 });
      }
      files[size] = file;
    }

    // Delete old blob images if they exist
    if (product.imageKey?.startsWith("blob:")) {
      try {
        const oldUrls = JSON.parse(product.imageKey.replace("blob:", ""));
        await Promise.all(
          Object.values(oldUrls).map((url: unknown) =>
            del(url as string).catch(() => {})
          )
        );
      } catch {
        // Old format or parse error, skip deletion
      }
    }

    // Upload each size to Vercel Blob
    const imageUrls: Record<string, string> = {};
    const slug = product.slug;

    for (const size of SIZES) {
      const file = files[size];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const blob = await put(`products/${slug}/${size}.webp`, buffer, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
      });

      imageUrls[size] = blob.url;
    }

    // Store the blob URLs in imageKey field as JSON
    const imageKey = `blob:${JSON.stringify(imageUrls)}`;
    await db.product.update({
      where: { id: productId },
      data: { imageKey },
    });

    return NextResponse.json({
      success: true,
      images: imageUrls,
      imageKey,
    });
  } catch (e) {
    console.error("POST image upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { productId } = await params;

  try {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete blob images if they exist
    if (product.imageKey?.startsWith("blob:")) {
      try {
        const { del } = await import("@vercel/blob");
        const urls = JSON.parse(product.imageKey.replace("blob:", ""));
        const urlValues = Object.values(urls);
        await Promise.all(
          urlValues.map((url) => del(url as string).catch(() => {}))
        );
      } catch {
        // skip
      }
    }

    await db.product.update({
      where: { id: productId },
      data: { imageKey: null },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE image error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete image" },
      { status: 500 }
    );
  }
}
