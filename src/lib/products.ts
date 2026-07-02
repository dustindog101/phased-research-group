/**
 * Product data access helpers (server-side)
 */

import { db } from "@/db";
import type { Product } from "@prisma/client";

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return db.product.findMany({
    where: { featured: true, inStock: true },
    orderBy: { price: "asc" },
    take: limit,
  });
}

export async function getAllProducts(): Promise<Product[]> {
  return db.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }, { dosage: "asc" }],
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return db.product.findUnique({ where: { slug } });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return db.product.findMany({
    where: { category },
    orderBy: [{ name: "asc" }, { dosage: "asc" }],
  });
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return getAllProducts();
  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { displayName: { contains: q } },
        { sku: { contains: q, mode: "insensitive" } },
        { categoryLabel: { contains: q } },
      ],
    },
    orderBy: [{ name: "asc" }, { dosage: "asc" }],
  });
}
