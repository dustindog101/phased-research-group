/**
 * Optimize product images — generates multiple sizes in WebP + AVIF
 * Run with: bun run scripts/optimize-product-image.ts <input> <slug>
 */

import sharp from "sharp";
import { mkdirSync, existsSync, renameSync } from "fs";
import { join, dirname } from "path";

interface Size {
  name: string;
  width: number;
}

const SIZES: Size[] = [
  { name: "thumb", width: 80 },      // cart thumbnails, table view
  { name: "sm", width: 200 },        // product cards
  { name: "md", width: 400 },        // product detail main image
  { name: "lg", width: 800 },        // high-res product detail
  { name: "xl", width: 1200 },       // retina / zoom
];

async function optimizeImage(inputPath: string, slug: string) {
  const outputDir = join(dirname(inputPath), "..", "products");
  const slugDir = join(outputDir, slug);
  if (!existsSync(slugDir)) mkdirSync(slugDir, { recursive: true });

  console.log(`Optimizing ${inputPath} → ${slugDir}/`);

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log(`Source: ${metadata.width}x${metadata.height} ${metadata.format}`);

  const results: Array<{ size: string; format: string; file: string; bytes: number }> = [];

  for (const size of SIZES) {
    // Resize maintaining aspect ratio, fitting within width
    const resized = image.clone().resize({
      width: size.width,
      height: size.width,
      fit: "contain",
      background: { r: 248, g: 250, b: 252, alpha: 1 }, // #f8fafc (bg-alt)
    });

    // WebP (excellent compression, widely supported)
    const webpFile = join(slugDir, `${size.name}.webp`);
    await resized.clone().webp({ quality: 85, effort: 6 }).toFile(webpFile);

    // AVIF (best compression, modern browsers)
    const avifFile = join(slugDir, `${size.name}.avif`);
    await resized.clone().avif({ quality: 80, effort: 4 }).toFile(avifFile);

    const webpBytes = (await sharp(webpFile).metadata()).size ?? 0;
    results.push({ size: size.name, format: "webp", file: webpFile, bytes: webpBytes });
  }

  // Print summary
  console.log("\nGenerated files:");
  for (const r of results) {
    const fs = await import("fs");
    const stats = fs.statSync(r.file);
    console.log(`  ${r.size}.webp  ${Math.round(stats.size / 1024)}KB`);
  }

  // Clean up source file
  renameSync(inputPath, join(outputDir, `${slug}-source-original.webp`));
  console.log(`\n✓ Done. Image optimized for slug: ${slug}`);
}

// CLI
const input = process.argv[2];
const slug = process.argv[3];

if (!input || !slug) {
  console.error("Usage: bun run scripts/optimize-product-image.ts <input-path> <product-slug>");
  process.exit(1);
}

optimizeImage(input, slug).catch((e) => {
  console.error(e);
  process.exit(1);
});
