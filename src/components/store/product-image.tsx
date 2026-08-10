"use client";

import Image from "next/image";
import { VialSVG, VialThumb } from "@/components/store/VialSVG";
import { useState } from "react";

interface ProductImageProps {
  slug: string;
  capColor: string;
  alt: string;
  variant: "card" | "detail" | "thumb" | "table";
  className?: string;
  priority?: boolean;
  /** Blob image URLs (from product.imageKey). If provided, used instead of static file. */
  blobImages?: Record<string, string> | null;
}

/**
 * ProductImage — shows high-resolution Retina product photo when available, falls back to SVG vial.
 *
 * Image sources (in priority order):
 * 1. blobImages (from Vercel Blob, uploaded via admin) — uses "blob:" prefix in product.imageKey
 * 2. Static file at /products/{slug}/{size}.webp (from optimize-product-image.ts script)
 * 3. SVG vial fallback
 */

// High-resolution Retina density source mapping (provides 2x - 4x pixel density for tack-sharp displays)
const SIZE_MAP = {
  thumb: { width: 80, height: 80, src: "sm" }, // 400px source
  table: { width: 40, height: 40, src: "thumb" }, // 160px source
  card: { width: 200, height: 200, src: "md" }, // 800px source (Retina 4x crisp)
  detail: { width: 400, height: 400, src: "lg" }, // 1200px source (Retina 3x crisp)
} as const;

export function ProductImage({
  slug,
  capColor,
  alt,
  variant,
  className,
  priority = false,
  blobImages,
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const config = SIZE_MAP[variant];

  // Determine image source: blob URL > static file > SVG fallback
  const imageSrc = blobImages?.[config.src] ?? `/products/${slug}/${config.src}.webp`;

  if (errored) {
    if (variant === "table") return <VialThumb capColor={capColor} size={40} />;
    if (variant === "thumb") return <VialThumb capColor={capColor} size={80} />;
    return <VialSVG capColor={capColor} size={variant === "card" ? 120 : 280} className={className} />;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={config.width}
      height={config.height}
      className={className}
      priority={priority}
      onError={() => setErrored(true)}
      sizes={variant === "detail" ? "(max-width: 768px) 100vw, 800px" : `${config.width * 2}px`}
      unoptimized={!!blobImages} // Blob URLs are already optimized at high resolution
    />
  );
}

/**
 * Parse product.imageKey field into blob image URLs.
 * Returns null if no blob images (static file or fallback will be used).
 */
export function parseBlobImages(imageKey: string | null): Record<string, string> | null {
  if (!imageKey || !imageKey.startsWith("blob:")) return null;
  try {
    return JSON.parse(imageKey.replace("blob:", ""));
  } catch {
    return null;
  }
}
