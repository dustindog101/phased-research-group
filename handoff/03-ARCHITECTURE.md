# 03 — Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Hobby tier)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js 16 (App Router)                     │ │
│  │                                                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │ │
│  │  │  RSC Pages  │  │ API Routes  │  │  Middleware   │   │ │
│  │  │  (server)   │  │ (serverless)│  │  (proxy.ts)   │   │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────────┘   │ │
│  │         │                │                              │ │
│  │  ┌──────▼──────────────────▼──────┐  ┌──────────────┐  │ │
│  │  │     Prisma Client (@/db)       │  │  NextAuth    │  │ │
│  │  └──────────────┬─────────────────┘  └──────────────┘  │ │
│  └─────────────────┼───────────────────────────────────────┘ │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Neon Postgres │
              │  (serverless)  │
              └───────────────┘

External APIs (called from server):
  - CoinGecko (price conversion)
  - Esplora / Etherscan / Blockscout / Solana RPC (payment detection)
  - Resend (email)
```

## Request Flow

### Page Request (e.g., `/shop`)
1. User visits `/shop`
2. `proxy.ts` middleware runs — adds security headers, rate limits if API
3. Next.js renders the RSC page on the server
4. Page calls Prisma to fetch products from Neon
5. HTML is sent to client, hydrates with React

### API Request (e.g., `POST /api/orders`)
1. Client `fetch()` calls `/api/orders`
2. `proxy.ts` rate limits (20 req/min for orders)
3. Route handler in `src/app/api/orders/route.ts` runs
4. `getSession()` checks NextAuth JWT from cookie
5. Prisma creates the order in Neon
6. Resend sends confirmation email (non-blocking)
7. JSON response returned

### Crypto Payment Flow
1. User checks out, selects crypto asset
2. `POST /api/orders` creates order (status: PENDING, paymentStatus: UNPAID)
3. `POST /api/payments/intents` creates PaymentIntent with unique amount
4. If guest: `POST /api/payments/pay-session` mints HMAC pay token
5. `CryptoPayModal` shows QR code + deposit address
6. Modal polls `POST /api/payments/poll` every 15s
7. Poll calls chain adapter (Esplora/Etherscan/Solana RPC)
8. On exact amount match: status → DETECTED → CONFIRMED
9. On CONFIRMED: order.paymentStatus → PAID, inventory deducted, email sent
10. Daily Vercel Cron (`/api/cron/payment-watcher`) reconciles missed payments

## File Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers, header, footer, age gate)
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Tailwind + PRG design system
│   ├── proxy.ts                  # Middleware (rate limiting, security headers)
│   │
│   ├── (storefront pages)/       # Shop, products, cart, checkout, about, coa, faq, contact
│   ├── account/                  # User dashboard, orders, settings
│   ├── admin/                    # Admin dashboard (orders, products, users, coupons, payments)
│   ├── login/                    # Auth pages
│   ├── register/
│   ├── track/                    # Guest order tracking
│   ├── terms/                    # Legal pages
│   ├── privacy/
│   ├── shipping/
│   ├── refund/
│   │
│   └── api/                      # API route handlers
│       ├── auth/                 # NextAuth + register
│       ├── orders/               # Order CRUD
│       ├── payments/             # Crypto intents, pay-session, poll, methods
│       ├── admin/                # Admin-only APIs
│       ├── account/              # User account APIs (password, addresses)
│       ├── track/                # Public order lookup
│       └── cron/                 # Vercel Cron (payment watcher)
│
├── components/
│   ├── store/                    # Header, footer, product cards, vial SVG, product image
│   ├── payments/                 # CryptoPayModal
│   ├── admin/                    # Admin shell, tables, forms
│   ├── account/                  # Settings client
│   └── ui/                       # shadcn/ui components (do not edit)
│
├── lib/
│   ├── payments/                 # Crypto payment gateway core
│   │   ├── constants.ts          # 7 crypto assets metadata
│   │   ├── types.ts              # PaymentIntent, SitePaymentSettings
│   │   ├── validation.ts         # Address validation per asset
│   │   ├── amounts.ts            # CoinGecko + unique amount computation
│   │   ├── payToken.ts           # HMAC token sign/verify
│   │   ├── settings.ts           # PaymentSettings CRUD
│   │   ├── orderHelpers.ts       # isCryptoOrder, parseCryptoAsset
│   │   ├── intentStatus.ts       # Effective status with expiry
│   │   ├── handlers.ts           # Create/get/cancel intent
│   │   ├── adminActivity.ts      # Admin activity ledger
│   │   ├── watcher.ts            # Chain polling + confirmation logic
│   │   └── adapters/             # Chain-specific adapters
│   │       ├── esplora.ts        # BTC + LTC
│   │       ├── etherscan.ts      # EVM USDC
│   │       └── solana.ts         # SOL + SPL USDC
│   ├── auth.ts                   # NextAuth config
│   ├── constants.ts              # Site config, shipping, categories, US states
│   ├── products.ts               # Product data access
│   └── email.ts                  # Resend email templates
│
├── hooks/
│   ├── useCart.ts                # Zustand cart store (localStorage)
│   └── useCurrentUser.ts         # NextAuth session hook
│
├── types/
│   └── next-auth.d.ts            # NextAuth type augmentation
│
└── auth.ts                       # NextAuth config (handlers, auth, signIn, signOut)

db/
└── index.ts                      # Prisma client singleton

prisma/
├── schema.prisma                 # Production schema (Postgres)
└── schema.dev.prisma             # Dev schema (SQLite, gitignored)

scripts/
├── seed.ts                       # Database seeder
├── products.json                 # 69 product definitions
├── optimize-product-image.ts     # Image optimization script
└── set-vercel-envs.ts            # Set Vercel env vars via API

public/
└── products/                     # Optimized product images (per slug)
    └── {slug}/
        ├── thumb.webp            # 80px (1-2KB)
        ├── sm.webp               # 200px (5KB)
        ├── md.webp               # 400px (16KB)
        ├── lg.webp               # 800px (55KB)
        └── xl.webp               # 1200px (116KB)
```

## Key Patterns

### 1. Server Components by Default
Most pages are RSC (React Server Components). Only use `"use client"` when you need:
- State (`useState`)
- Effects (`useEffect`)
- Event handlers
- Browser APIs (localStorage, etc.)

### 2. Auth Checking
```typescript
// Server-side (in RSC or API route)
import { getSession, requireUser, requireAdmin } from "@/lib/auth";
const session = await getSession();        // nullable
const user = await requireUser();          // redirects to /login if not authed
const admin = await requireAdmin();        // redirects to / if not admin

// Client-side (in components)
import { useCurrentUser } from "@/hooks/useCurrentUser";
const { user, isAuthenticated, isAdmin, isLoading } = useCurrentUser();
```

### 3. Database Access
```typescript
import { db } from "@/db";
const products = await db.product.findMany({ where: { ... } });
```

### 4. Hydration Safety
Client components that read from localStorage must use a `mounted` pattern:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
// Only render localStorage-derived values after mounted
```

### 5. Payment Intent Flow
Never create payment intents directly. Always use the handlers in `src/lib/payments/handlers.ts`. They handle:
- Ownership verification
- Active intent collision detection
- Unique amount generation with retry
- Atomic status transitions

### 6. Email Sending
Emails are fire-and-forget (non-blocking):
```typescript
sendOrderConfirmation({...}).catch(e => console.error("Email failed:", e));
```
Never `await` email sending in request handlers — it would slow down the response.
