# 04 — Database Schema

## Overview

The database uses Prisma ORM with PostgreSQL (Neon) in production and SQLite for local dev. The schema is at `prisma/schema.prisma`.

**Important**: Enums are stored as `String` (not Prisma `enum` keyword) for SQLite compatibility. Values are documented in comments.

## Models

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  name          String?
  role          String    @default("USER") // "USER" | "ADMIN"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // Relations
  orders        Order[]
  addresses     Address[]
  cart          Cart?
  sessions      Session[]
  accounts      Account[]
}
```

### Account / Session / VerificationToken
Standard NextAuth.js adapter tables. Don't touch unless changing auth strategy.

### Product
```prisma
model Product {
  id            String   @id @default(cuid())
  slug          String   @unique           // URL slug, e.g., "prg-retatrutide-10mg"
  name          String                      // e.g., "Retatrutide"
  displayName   String                      // e.g., "Retatrutide 10mg"
  category      String                      // metabolic|healing|hormone|neuro|longevity|other
  categoryLabel String                      // e.g., "Metabolic & GLP Agonists"
  dosage        String                      // e.g., "10mg"
  sku           String   @unique            // e.g., "PRG-RETATRUT-10MG"
  price         Float                       // per-vial price in USD
  kitPrice      Float                       // 5-vial kit price in USD
  capColor      String   @default("#0d9488") // SVG vial cap color
  featured      Boolean  @default(false)
  inStock       Boolean  @default(true)
  stockQty      Int      @default(0)        // auto-decremented on payment
  description   String?
  longDescription String?                    // markdown
  coaUrl        String?                     // COA PDF link
  imageKey      String?                     // reserved for Vercel Blob key
  // Relations
  orderItems    OrderItem[]
  cartItems     CartItem[]
}
```

**Image convention**: Product images are stored at `public/products/{slug}/{size}.webp`. The `imageKey` field is reserved for future Vercel Blob integration but currently unused. See `14-IMAGES.md`.

### Cart / CartItem
```prisma
model Cart {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(...)
  items     CartItem[]
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  isKit     Boolean  @default(false)  // true = 5-vial kit
  // ...
  @@unique([cartId, productId, isKit])
}
```

**Note**: The cart is also mirrored in localStorage (Zustand) for guest users. Logged-in users' carts sync to the database.

### Order
```prisma
model Order {
  id               String         @id @default(cuid())
  orderNumber      String         @unique         // "PRG-XXXXXXXX" (base36 timestamp)
  userId           String?                          // null for guest checkout
  guestEmail       String?                          // set for guest checkout
  status           String         @default("PENDING")
  // PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED
  paymentStatus    String         @default("UNPAID")
  // UNPAID | PENDING | PAID | PARTIAL | REFUNDED
  paymentMethod    String?                          // "Crypto: Bitcoin" etc.
  paymentIntentId  String?
  cryptoAsset      String?                          // CryptoAssetId
  cryptoTxHash     String?
  paymentExpiresAt DateTime?

  // Pricing snapshot (USD)
  subtotal         Float
  discountAmount   Float          @default(0)
  shipping         Float          @default(0)
  total            Float
  currency         String         @default("USD")
  couponCode       String?

  // Address snapshot
  shippingAddress  Json?                            // {fullName, line1, city, state, zip, ...}
  shippingMethod   String?                          // "ground" | "express"

  // Admin fields
  customerNotice   String?
  adminNotes       String?
  trackingNumber   String?

  // Metadata
  source           String         @default("web")  // "web" | "admin"
  ruoAccepted      Boolean        @default(false)
  ageConfirmed     Boolean        @default(false)

  // Relations
  user             User?
  items            OrderItem[]
  paymentIntent    PaymentIntent?
}
```

### OrderItem
```prisma
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  name      String    // snapshot
  dosage    String    // snapshot
  sku       String    // snapshot
  price     Float     // snapshot of unit price
  quantity  Int
  isKit     Boolean   @default(false)
}
```

**Important**: OrderItem stores snapshots of product data (name, dosage, sku, price). This ensures historical orders remain accurate even if products are later edited or deleted.

### Address
```prisma
model Address {
  id        String   @id @default(cuid())
  userId    String
  fullName  String
  line1     String
  line2     String?
  city      String
  state     String
  zip       String
  country   String   @default("US")
  phone     String?
  isDefault Boolean  @default(false)
}
```

### Coupon
```prisma
model Coupon {
  id            String   @id @default(cuid())
  code          String   @unique          // e.g., "PRG10"
  discountType  String                    // "PERCENT" | "FIXED"
  value         Float                     // percentage (0-100) or fixed USD
  minOrder      Float    @default(0)
  maxUses       Int?                      // null = unlimited
  usedCount     Int      @default(0)
  isActive      Boolean  @default(true)
  startsAt      DateTime?
  expiresAt     DateTime?
}
```

### PaymentIntent
```prisma
model PaymentIntent {
  id              String              @id @default(cuid())
  orderId         String              @unique
  userId          String?
  asset           String              // CryptoAssetId: btc|ltc|sol|usdc_ethereum|...
  depositAddress  String
  expectedAmount  String              // human-readable, e.g., "0.00123456"
  expectedAtomic  String              // integer string for exact match
  uniqueSuffix    Int                 // random 1-9999, ties amount to order
  baseTotalUsd    Float
  exchangeRate    Float?
  status          String              @default("PENDING")
  // PENDING | DETECTED | CONFIRMED | EXPIRED | CANCELLED
  txHash          String?
  confirmations   Int                 @default(0)
  expiresAt       DateTime
  createdAt       DateTime            @default(now())
  confirmedAt     DateTime?
  cancelledAt     DateTime?
}
```

### PaymentSettings (singleton)
```prisma
model PaymentSettings {
  id                     String   @id @default("site")
  paymentGateways        Json     // Record<CryptoAssetId, {enabled, address, minConfirmations}>
  paymentIntentTtlHours  Int      @default(48)
  updatedAt              DateTime @updatedAt
}
```

### EmailLog
```prisma
model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  type      String   // "order_confirmation" | "payment_received" | "shipping_notification"
  orderId   String?
  sentAt    DateTime @default(now())
}
```

## Indexes

All foreign keys and frequently-filtered fields have indexes:
- `User.email`, `User.role`
- `Product.slug`, `Product.sku`, `Product.category`, `Product.featured`, `Product.inStock`
- `Order.userId`, `Order.status`, `Order.paymentStatus`, `Order.createdAt`, `Order.guestEmail`
- `PaymentIntent.status`, `PaymentIntent.asset`, `PaymentIntent.depositAddress`, `PaymentIntent.expiresAt`, `PaymentIntent.createdAt`
- `Coupon.code`, `Coupon.isActive`

## Database Scripts

```bash
bun run db:push          # Push schema to SQLite (dev)
bun run db:push:prod     # Push schema to Postgres (prod — needs DATABASE_URL)
bun run db:seed          # Seed dev database (69 products, 2 coupons, admin user)
bun run db:seed:prod     # Seed prod database
bun run db:generate      # Generate Prisma client (dev)
bun run db:generate:prod # Generate Prisma client (prod)
```

## Migration Strategy

We use `prisma db push` (not migrations) because:
1. The schema is still evolving
2. No existing production data to preserve
3. Push is faster for prototyping

Once in stable production with real data, switch to `prisma migrate` for versioned migrations.
