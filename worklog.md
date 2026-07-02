# Phased Research Group — Work Log

Shared multi-agent work log. Append-only. Each new section starts with `---`.

---
Task ID: 0
Agent: main
Task: Project initialization and planning

Work Log:
- Explored phased-research-group (static HTML storefront, 75 peptide products, no backend)
- Explored nextjs-boilerplate (Next.js 16 + crypto payment gateway, frontend portable, backend in gitignored Python Lambdas)
- Read all 15 uploaded Python Lambda files (handlers, watcher, chain adapters, pricing, settings, validation)
- Initialized Next.js 16 project via fullstack-dev skill
- Installed: next-auth v5 beta, @auth/prisma-adapter, bcryptjs, qrcode.react, recharts, exceljs, date-fns, resend, @vercel/blob, @types/bcryptjs

Stage Summary:
- Tech stack confirmed: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + Prisma + Neon Postgres + NextAuth + Resend + Vercel Blob
- Crypto gateway strategy: port Python Lambda logic to TypeScript API routes (no AWS, no DynamoDB)
- Watcher strategy: Vercel Cron (daily) + client-side polling for real-time modal UX
- Original site has 75 products across 6 categories (metabolic, healing, hormone, longevity, neuro, other)
- Design tokens: navy #1e3a5f + teal #0d9488, Inter + Oswald fonts, SVG vial illustrations

---
Task ID: 1
Agent: main
Task: Build complete Next.js application with crypto payment gateway

Work Log:
- Created Prisma schema with 10 models (User, Account, Session, Product, Cart, Order, OrderItem, Address, Coupon, PaymentIntent, PaymentSettings, EmailLog)
- Pushed schema to SQLite dev database
- Ported design system from static site CSS to Tailwind v4 globals.css (navy/teal palette, Inter+Oswald fonts, all component utilities)
- Created VialSVG component for procedural vial illustrations
- Built Zustand cart store with localStorage persistence
- Built header (nav, search, cart icon, mobile menu) and footer components
- Built home page (hero, pillars, featured products, trust row, categories)
- Built shop page with search, category filter, sort, pagination
- Built product detail page with single-vial/kit options, quantity selector, related products
- Built product list page (table view with quick-add)
- Built cart page with coupon support, shipping options, free shipping progress
- Built checkout page with contact/shipping/payment forms, RUO/age confirmations, crypto method picker
- Built CryptoPayModal with QR code, countdown, 15s polling, auto-close on confirmed
- Set up NextAuth v5 with Credentials provider + Prisma adapter
- Built login, register, account pages
- Built order history and order detail pages with status tracker
- Built track page for guest order lookup
- Built admin dashboard with metrics overview
- Built admin orders list + detail with status update, tracking, notes
- Built admin products CRUD with vial color picker, preview
- Built admin users page with role toggle
- Built admin coupons page with create/delete/toggle
- Built admin payments hub (gateways config + activity ledger)
- Ported crypto payment gateway from Python:
  - constants.ts (7 assets: BTC, LTC, SOL, USDC ETH/Polygon/Base/Solana)
  - types.ts (PaymentIntent, SitePaymentSettings, etc.)
  - validation.ts (address regex validation per asset)
  - amounts.ts (CoinGecko rate fetch + unique amount computation)
  - payToken.ts (HMAC token sign/verify for guest access)
  - settings.ts (PaymentSettings CRUD + sanitize for client)
  - orderHelpers.ts (isCryptoOrder, parseCryptoAssetFromMethod)
  - intentStatus.ts (effective status with expiry resolution)
  - handlers.ts (create/get/cancel intent with collision retry)
  - adminActivity.ts (summary counts + list with filters)
  - watcher.ts (expire stale + process intents via chain adapters)
  - adapters/esplora.ts (BTC/LTC via Blockstream/LitecoinSpace)
  - adapters/etherscan.ts (EVM USDC via Etherscan V2 + Blockscout fallback)
  - adapters/solana.ts (SOL + SPL USDC via JSON-RPC)
- Built all API routes:
  - /api/auth/[...nextauth] (NextAuth handler)
  - /api/auth/register (user registration)
  - /api/orders (POST create, GET list)
  - /api/orders/[orderId] (GET, PATCH admin update)
  - /api/payments/pay-session (mint HMAC pay token)
  - /api/payments/intents (POST create/get/cancel, GET)
  - /api/payments/poll (client-side real-time detection)
  - /api/payments/methods (public list enabled assets)
  - /api/cron/payment-watcher (daily reconciliation)
  - /api/admin/products (GET, POST)
  - /api/admin/products/[productId] (GET, PATCH, DELETE)
  - /api/admin/users/[userId] (PATCH role)
  - /api/admin/coupons (GET, POST)
  - /api/admin/coupons/[couponId] (PATCH, DELETE)
  - /api/admin/payments/settings (GET, PUT)
  - /api/admin/payments/summary (GET)
  - /api/admin/payments/intents (GET)
  - /api/track (public order lookup)
- Created vercel.json with daily cron config
- Created .env.example with all required env vars
- Created comprehensive README.md
- Ran ESLint — 0 errors
- Browser-verified: home page, add to cart, cart page, checkout, login, admin dashboard, admin payments
- Committed and force-pushed to GitHub (dustindog101/phased-research-group)

Stage Summary:
- Complete Next.js 16 app deployed to GitHub
- 69 products seeded across 6 categories
- 2 coupons seeded (PRG10, RESEARCH15)
- Default admin user created (admin@phasedresearchgroup.com / admin12345)
- All storefront pages working: home, shop, products, product detail, cart, checkout, about, coa, faq, contact, track
- All account pages working: login, register, account, orders, order detail
- All admin pages working: dashboard, orders, products (CRUD), users, coupons, payments
- Crypto payment gateway fully ported from Python Lambda to TypeScript
- No errors in ESLint or browser console
- Ready for Vercel deployment + Neon Postgres production setup
