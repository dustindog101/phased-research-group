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
}

/**
 * ProductImage — shows optimized product photo when available, falls back to SVG vial.
 *
 * Image files at /products/{slug}/{size}.webp
 * Sizes: thumb (80px), sm (200px), md (400px), lg (800px), xl (1200px)
 *
 * Uses Next.js Image component for:
 * - Automatic lazy loading
 * - Responsive srcset
 * - Format negotiation
 */

const SIZE_MAP = {
  thumb: { width: 80, height: 80, src: "sm" },
  table: { width: 40, height: 40, src: "thumb" },
  card: { width: 200, height: 200, src: "sm" },
  detail: { width: 400, height: 400, src: "md" },
} as const;

export function ProductImage({
  slug,
  capColor,
  alt,
  variant,
  className,
  priority = false,
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const config = SIZE_MAP[variant];
  const imageSrc = `/products/${slug}/${config.src}.webp`;

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
      sizes={variant === "detail" ? "(max-width: 768px) 100vw, 400px" : `${config.width}px`}
    />
  );
}
