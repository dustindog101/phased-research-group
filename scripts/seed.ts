/**
 * Seed script — populates Product, Coupon, and default admin user.
 * Run with: bun run db:seed
 */

import { db } from "../db";
import products from "./products.json";
import bcrypt from "bcryptjs";

interface SeedVariant {
  dosage: string;
  displayName: string;
  sku: string;
  price: number;
  kitPrice: number;
  capColor: string;
  inStock: boolean;
  stockQty: number;
}

interface SeedParentProduct {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  featured: boolean;
  description?: string | null;
  variants: SeedVariant[];
}

async function seedProducts() {
  console.log(`Seeding ${products.length} parent products...`);
  for (const p of products as SeedParentProduct[]) {
    const parent = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        category: p.category,
        categoryLabel: p.categoryLabel,
        featured: p.featured,
        description: p.description ?? null,
      },
      create: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        categoryLabel: p.categoryLabel,
        featured: p.featured,
        description: p.description ?? null,
      },
    });

    for (let i = 0; i < p.variants.length; i++) {
      const v = p.variants[i];
      await db.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: parent.id,
          dosage: v.dosage,
          displayName: v.displayName,
          price: v.price,
          kitPrice: v.kitPrice,
          capColor: v.capColor,
          inStock: v.inStock,
          stockQty: v.stockQty ?? 100,
          sortOrder: i,
        },
        create: {
          productId: parent.id,
          dosage: v.dosage,
          displayName: v.displayName,
          sku: v.sku,
          price: v.price,
          kitPrice: v.kitPrice,
          capColor: v.capColor,
          inStock: v.inStock,
          stockQty: v.stockQty ?? 100,
          sortOrder: i,
        },
      });
    }
  }
  console.log(`✓ Seeded ${products.length} parent products and variants`);
}

async function seedCoupons() {
  console.log("Seeding coupons...");
  const coupons = [
    {
      code: "PRG10",
      discountType: "PERCENT",
      value: 10,
      minOrder: 0,
      maxUses: null,
      isActive: true,
    },
    {
      code: "RESEARCH15",
      discountType: "PERCENT",
      value: 15,
      minOrder: 0,
      maxUses: null,
      isActive: true,
    },
  ];
  for (const c of coupons) {
    await db.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Seeded ${coupons.length} coupons`);
}

async function seedPaymentSettings() {
  console.log("Seeding payment settings (singleton)...");
  await db.paymentSettings.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      paymentGateways: {
        btc: { enabled: false, address: "", minConfirmations: 1 },
        ltc: { enabled: false, address: "", minConfirmations: 1 },
        sol: { enabled: false, address: "", minConfirmations: 1 },
        usdc_ethereum: { enabled: false, address: "", minConfirmations: 12 },
        usdc_polygon: { enabled: false, address: "", minConfirmations: 12 },
        usdc_base: { enabled: false, address: "", minConfirmations: 12 },
        usdc_solana: { enabled: false, address: "", minConfirmations: 1 },
      } as unknown as Record<string, unknown>,
      paymentIntentTtlHours: 48,
    },
  });
  console.log("✓ Seeded payment settings");
}

async function seedAdminUser() {
  console.log("Seeding default admin user...");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@phaseresearch.org";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`✓ Admin user already exists (${adminEmail})`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db.user.create({
    data: {
      email: adminEmail,
      username: "admin",
      passwordHash,
      role: "ADMIN",
      name: "PRG Admin",
    },
  });
  console.log(`✓ Created admin user: ${adminEmail} / ${adminPassword}`);
  console.log("  ⚠️  Change this password immediately after first login!");
}

async function main() {
  console.log("=== Phase Research Group — Database Seed ===\n");
  await seedProducts();
  await seedCoupons();
  await seedPaymentSettings();
  await seedAdminUser();
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
