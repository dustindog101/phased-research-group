/**
 * Product data access helpers (server-side)
 * Queries parent compounds with nested dosage variants
 */

import { db } from "@/db";
import type { Product, ProductVariant } from "@prisma/client";

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export async function getFeaturedProducts(limit = 8): Promise<ProductWithVariants[]> {
  return db.product.findMany({
    where: { featured: true },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
    take: limit,
  }) as Promise<ProductWithVariants[]>;
}

export async function getAllProducts(): Promise<ProductWithVariants[]> {
  return db.product.findMany({
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  }) as Promise<ProductWithVariants[]>;
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const cleanSlug = slug.toLowerCase().trim();
  const parent = await db.product.findUnique({
    where: { slug: cleanSlug },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (parent) return parent as ProductWithVariants;

  // Legacy fallback: lookup by variant SKU or legacy dosage slug (e.g. bpc-157-5mg)
  const variant = await db.productVariant.findFirst({
    where: {
      OR: [
        { sku: cleanSlug.toUpperCase() },
        { sku: `PRG-${cleanSlug.toUpperCase()}` },
      ],
    },
    include: {
      product: {
        include: {
          variants: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (variant?.product) {
    return variant.product as ProductWithVariants;
  }

  return null;
}

export async function getProductsByCategory(category: string): Promise<ProductWithVariants[]> {
  return db.product.findMany({
    where: { category },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  }) as Promise<ProductWithVariants[]>;
}

export async function searchProducts(query: string): Promise<ProductWithVariants[]> {
  const q = query.trim();
  if (!q) return getAllProducts();

  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { categoryLabel: { contains: q, mode: "insensitive" } },
        {
          variants: {
            some: {
              OR: [
                { dosage: { contains: q, mode: "insensitive" } },
                { displayName: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  }) as Promise<ProductWithVariants[]>;
}
