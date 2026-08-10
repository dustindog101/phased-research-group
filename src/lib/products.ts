/**
 * Product data access helpers (server-side)
 * Handles Parent Products and Child ProductVariants
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
  });
}

export async function getAllProducts(): Promise<ProductWithVariants[]> {
  return db.product.findMany({
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const normSlug = slug.toLowerCase().trim();

  // 1. Try finding by direct parent slug
  const parent = await db.product.findUnique({
    where: { slug: normSlug },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (parent) return parent;

  // 2. Legacy Fallback: Try finding by variant SKU or legacy slug format (e.g. "prg-bpc-157-5mg")
  const variant = await db.productVariant.findFirst({
    where: {
      OR: [
        { sku: { equals: normSlug, mode: "insensitive" } },
        { sku: { equals: `PRG-${normSlug.toUpperCase()}`, mode: "insensitive" } },
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

  if (variant) return variant.product;

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
  });
}

export async function searchProducts(query: string): Promise<ProductWithVariants[]> {
  const q = query.trim().toLowerCase();
  if (!q) return getAllProducts();

  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { categoryLabel: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
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
  });
}
