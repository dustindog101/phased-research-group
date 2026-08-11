import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN missing" }, { status: 500 });
    }

    const { blobs } = await list({ token });
    console.log(`Discovered ${blobs.length} blobs in Vercel Blob storage.`);

    // Group blobs by folder/pathname prefix
    // Pathnames look like: products/prg-semaglutide-10mg/1786399685681-lg.png or products/prg-semax-5mg/lg.png
    const groups: Record<string, Record<string, string>> = {};

    for (const b of blobs) {
      const parts = b.pathname.split("/");
      if (parts.length < 2) continue;

      // folder name is parts[1], e.g. "prg-semaglutide-10mg"
      const folder = parts[1];
      const filename = parts[parts.length - 1]; // e.g. "1786399685681-lg.png" or "lg.png"

      if (!groups[folder]) groups[folder] = {};

      if (filename.includes("lg")) groups[folder].lg = b.url;
      else if (filename.includes("md")) groups[folder].md = b.url;
      else if (filename.includes("sm")) groups[folder].sm = b.url;
      else if (filename.includes("thumb")) groups[folder].thumb = b.url;
      else if (filename.includes("xl")) groups[folder].xl = b.url;
    }

    const restoredProducts: string[] = [];
    const restoredVariants: string[] = [];

    // Map grouped blobs back to products and variants
    for (const [folder, sizes] of Object.entries(groups)) {
      if (!sizes.lg && !sizes.md && !sizes.sm) continue;

      // Construct imageKey JSON
      const imageDict = {
        lg: sizes.lg || sizes.md || sizes.sm,
        md: sizes.md || sizes.lg || sizes.sm,
        sm: sizes.sm || sizes.md || sizes.thumb,
        thumb: sizes.thumb || sizes.sm || sizes.md,
      };
      const imageKey = `blob:${JSON.stringify(imageDict)}`;

      // Try matching folder to variant SKU or slug
      // e.g. folder = "prg-semaglutide-10mg" -> clean = "semaglutide" or SKU "PRG-SEMAGLUTIDE-10MG"
      const folderSku = folder.toUpperCase();

      // 1. Check if variant SKU matches
      const variant = await db.productVariant.findFirst({
        where: {
          OR: [
            { sku: { equals: folderSku, mode: "insensitive" } },
            { sku: { equals: folder.replace(/^prg-/, "PRG-").toUpperCase(), mode: "insensitive" } },
          ],
        },
      });

      if (variant) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: { imageKey },
        });
        restoredVariants.push(`${variant.displayName} (${folder})`);

        // Also update parent product imageKey if parent doesn't have one
        const parent = await db.product.findUnique({ where: { id: variant.productId } });
        if (parent && !parent.imageKey) {
          await db.product.update({
            where: { id: parent.id },
            data: { imageKey },
          });
          restoredProducts.push(`${parent.name} (from variant ${folder})`);
        }
        continue;
      }

      // 2. Check if parent product slug matches
      // folder = "prg-semaglutide-10mg" -> clean slug = "semaglutide"
      const cleanSlug = folder
        .replace(/^prg-/, "")
        .replace(/-\d+mg$/, "")
        .replace(/-\d+mcg$/, "");

      const parent = await db.product.findFirst({
        where: { slug: cleanSlug },
      });

      if (parent) {
        await db.product.update({
          where: { id: parent.id },
          data: { imageKey },
        });
        restoredProducts.push(`${parent.name} (${folder})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Restored ${restoredProducts.length} product images and ${restoredVariants.length} variant images!`,
      restoredProducts,
      restoredVariants,
      groupsFound: Object.keys(groups),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
