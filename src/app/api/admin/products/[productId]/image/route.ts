/**
 * Admin Product Image Upload API
 *   POST /api/admin/products/:productId/image
 *
 * Receives an image file, optimizes it with sharp (5 sizes in WebP),
 * uploads to Vercel Blob, updates product.imageKey, deletes old images.
 *
 * Uses Vercel Blob (free 1GB on Hobby tier).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";

/** Check admin auth for API routes */
async function requireAdminApi(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "ADMIN";
}

const SIZES = [
  { name: "thumb", width: 80 },
  { name: "sm", width: 200 },
  { name: "md", width: 400 },
  { name: "lg", width: 800 },
  { name: "xl", width: 1200 },
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { productId } = await params;

  try {
    // Dynamic imports (sharp + blob) — avoids load-time failures
    const sharp = (await import("sharp")).default;
    const { put, del } = await import("@vercel/blob");

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delete old blob images if they exist
    if (product.imageKey?.startsWith("blob:")) {
      try {
        const oldUrls = JSON.parse(product.imageKey.replace("blob:", ""));
        if (Array.isArray(oldUrls)) {
          await Promise.all(oldUrls.map((url: string) => del(url).catch(() => {})));
        }
      } catch {
        // Old format or parse error, skip deletion
      }
    }

    // Generate optimized images and upload to Blob
    const imageUrls: Record<string, string> = {};
    const slug = product.slug;

    for (const size of SIZES) {
      const optimized = await sharp(buffer)
        .resize({
          width: size.width,
          height: size.width,
          fit: "contain",
          background: { r: 248, g: 250, b: 252, alpha: 1 },
        })
        .webp({ quality: 85, effort: 6 })
        .toBuffer();

      const blob = await put(`products/${slug}/${size.name}.webp`, optimized, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
      });

      imageUrls[size.name] = blob.url;
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
    const { del } = await import("@vercel/blob");
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete blob images if they exist
    if (product.imageKey?.startsWith("blob:")) {
      try {
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
