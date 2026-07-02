/**
 * Seed script — populates Product, Coupon, and default admin user.
 * Run with: bun run db:seed
 */

import { db } from "../db";
import products from "./products.json";
import bcrypt from "bcryptjs";

interface SeedProduct {
  id: string;
  name: string;
  dosage: string;
  displayName: string;
  category: string;
  categoryLabel: string;
  price: number;
  kitPrice: number;
  sku: string;
  featured: boolean;
  capColor: string;
  inStock: boolean;
}

async function seedProducts() {
  console.log(`Seeding ${products.length} products...`);
  for (const p of products as SeedProduct[]) {
    await db.product.upsert({
      where: { slug: p.id },
      update: {
        name: p.name,
        displayName: p.displayName,
        category: p.category,
        categoryLabel: p.categoryLabel,
        dosage: p.dosage,
        sku: p.sku,
        price: p.price,
        kitPrice: p.kitPrice,
        capColor: p.capColor,
        featured: p.featured,
        inStock: p.inStock,
      },
      create: {
        slug: p.id,
        name: p.name,
        displayName: p.displayName,
        category: p.category,
        categoryLabel: p.categoryLabel,
        dosage: p.dosage,
        sku: p.sku,
        price: p.price,
        kitPrice: p.kitPrice,
        capColor: p.capColor,
        featured: p.featured,
        inStock: p.inStock,
      },
    });
  }
  console.log(`✓ Seeded ${products.length} products`);
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
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@phasedresearchgroup.com";
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
  console.log("=== Phased Research Group — Database Seed ===\n");
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
