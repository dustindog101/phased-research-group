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
  /** Blob image URLs (from product.imageKey or variant.imageKey). If provided, used instead of static file. */
  blobImages?: Record<string, string> | null;
}

/**
 * ProductImage — shows high-resolution Retina product photo when available, falls back to SVG vial.
 *
 * Image sources (in priority order):
 * 1. blobImages (from Vercel Blob or uploaded URL for product or ANY of its variations)
 * 2. Static file at /products/{slug}/{size}.webp
 * 3. Legacy static path at /products/prg-{slug}-10mg/{size}.webp
 * 4. SVG vial fallback
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
  const [fallbackStep, setFallbackStep] = useState(0);
  const config = SIZE_MAP[variant];

  // Try blobImages > static slug path > legacy prg-slug-10mg path > SVG vial
  const staticPath = `/products/${slug}/${config.src}.webp`;
  const legacyPath = `/products/prg-${slug}-10mg/${config.src}.webp`;

  let imageSrc = blobImages?.[config.src];
  if (!imageSrc) {
    if (fallbackStep === 0) imageSrc = staticPath;
    else if (fallbackStep === 1) imageSrc = legacyPath;
  }

  const handleImageError = () => {
    if (fallbackStep < 2) {
      setFallbackStep((s) => s + 1);
    }
  };

  if (!imageSrc || fallbackStep >= 2) {
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
      onError={handleImageError}
      sizes={variant === "detail" ? "(max-width: 768px) 100vw, 800px" : `${config.width * 2}px`}
      unoptimized={!!blobImages} // Blob URLs are already optimized at high resolution
    />
  );
}

/**
 * Parse product.imageKey or variant.imageKey field into blob image URLs dictionary.
 * Accepts blob JSON dict, direct Vercel Blob URL, or external HTTPS URL.
 */
export function parseBlobImages(imageKey?: string | null): Record<string, string> | null {
  if (!imageKey) return null;

  if (imageKey.startsWith("blob:")) {
    try {
      return JSON.parse(imageKey.replace("blob:", ""));
    } catch {
      const url = imageKey.replace("blob:", "");
      return { lg: url, md: url, sm: url, thumb: url };
    }
  }

  if (imageKey.startsWith("http://") || imageKey.startsWith("https://") || imageKey.startsWith("/")) {
    return { lg: imageKey, md: imageKey, sm: imageKey, thumb: imageKey };
  }

  return null;
}

/**
 * Resolves the best available blob image key for a product and active variant.
 * Ensures an image is ALWAYS displayed if either the parent compound OR ANY of its variations has an image.
 * Priority:
 * 1. activeVariant.imageKey
 * 2. product.imageKey (parent image)
 * 3. Any sibling variant's imageKey
 */
export function resolveProductImageBlob(
  product?: { imageKey?: string | null; variants?: Array<{ id?: string; imageKey?: string | null }> } | null,
  activeVariantId?: string | null
): Record<string, string> | null {
  if (!product) return null;
  const variants = product.variants ?? [];

  // 1. Check active variant's imageKey
  if (activeVariantId) {
    const active = variants.find((v) => v.id === activeVariantId);
    if (active?.imageKey) {
      const parsed = parseBlobImages(active.imageKey);
      if (parsed) return parsed;
    }
  }

  // 2. Check parent product's imageKey
  if (product.imageKey) {
    const parsed = parseBlobImages(product.imageKey);
    if (parsed) return parsed;
  }

  // 3. Check ANY variant's imageKey across all variations
  for (const v of variants) {
    if (v.imageKey) {
      const parsed = parseBlobImages(v.imageKey);
      if (parsed) return parsed;
    }
  }

  return null;
}
