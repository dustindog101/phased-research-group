# 02 — Tech Stack

## Core Framework

| Tech | Version | Why |
|---|---|---|
| **Next.js** | 16.1.3 (App Router) | Required by sandbox. App Router for RSC + streaming. Turbopack for fast dev. |
| **React** | 19 | Ships with Next 16. Strict mode off (avoids double-render in dev). |
| **TypeScript** | 5 | Non-negotiable. All code is typed. |
| **Tailwind CSS** | 4 | Via `@tailwindcss/postcss`. Uses `@theme inline` for CSS variable mapping. |

## UI Components

| Library | Version | Usage |
|---|---|---|
| **shadcn/ui** | New York style | Pre-installed in `src/components/ui/`. Use these, don't build from scratch. |
| **lucide-react** | 0.412+ | All icons. Don't add other icon libraries. |
| **sonner** | latest | Toast notifications. Already wired in `Providers`. |
| **qrcode.react** | 4.2.0 | QR codes in CryptoPayModal. |

## Database

| Tech | Version | Notes |
|---|---|---|
| **Prisma** | 6.19.2 | ORM. Schema at `prisma/schema.prisma` (Postgres for prod). Dev schema at `prisma/schema.dev.prisma` (SQLite, gitignored). |
| **Neon Postgres** | Serverless | Free tier: 0.5GB storage, 1 always-on branch. Connection pooling via `?channel_binding=require&sslmode=require`. |
| **SQLite** | (dev only) | Local dev database at `db/custom.db`. Gitignored. |

**Important**: The Prisma schema uses `String` types for enums (not `enum` keyword) because SQLite doesn't support enums. This works fine in Postgres too.

## Authentication

| Tech | Version | Notes |
|---|---|---|
| **NextAuth.js** | 5.0.0-beta.31 | v5 (Auth.js). Config in `src/auth.ts`. Credentials provider only (email + password). |
| **@auth/prisma-adapter** | 2.11.2 | Connects NextAuth to Prisma. |
| **bcryptjs** | 3.0.3 | Password hashing. 12 rounds. |

**Auth flow**: JWT-based sessions (7-day TTL). No OAuth social login (yet). Session cookie is HttpOnly, Secure in production.

## Payments

| Tech | Version | Notes |
|---|---|---|
| **Self-hosted crypto gateway** | Custom | Ported from Python Lambdas. See `11-CRYPTO-PAYMENT-GATEWAY.md`. |
| **CoinGecko API** | v3 | Free, 30 req/min without key. Used for USD→crypto conversion. |
| **Esplora** | Blockstream/LitecoinSpace | Free, no key. BTC + LTC payment detection. |
| **Etherscan V2** | api.etherscan.io | Free, 5 req/s. USDC on Ethereum + Polygon. **Needs API key.** |
| **Blockscout** | base.blockscout.com | Free, no key. USDC on Base (Etherscan doesn't cover Base free tier). |
| **Solana RPC** | Helius or public | Helius free: 100k req/mo. Public: rate-limited. **Needs Helius key for production.** |

## Email

| Tech | Version | Notes |
|---|---|---|
| **Resend** | 6.16.0 | Free: 3,000 emails/mo, 100/day. API key configured on Vercel. |
| **EMAIL_FROM** | noreply@phasedresearchgroup.com | Configured on Vercel. **Domain not verified yet** — Resend requires domain verification for production sending. Currently sends from `onboarding@resend.dev` until verified. |

## Image Processing

| Tech | Version | Notes |
|---|---|---|
| **sharp** | 0.35.3 | Used in `scripts/optimize-product-image.ts` to generate multiple sizes. |
| **Next.js Image** | Built-in | Automatic optimization, lazy loading, responsive srcset. |

## State Management

| Tech | Version | Notes |
|---|---|---|
| **Zustand** | latest | Cart state. Persisted to localStorage. See `src/hooks/useCart.ts`. |
| **TanStack Query** | 5.82.0 | Available but not heavily used yet. For server state if needed. |

## Other Libraries

| Library | Version | Purpose |
|---|---|---|
| **recharts** | 3.9.1 | Admin dashboard charts (available, not yet built) |
| **exceljs** | 4.4.0 | Available for Excel export (CSV export already built) |
| **date-fns** | 4.4.0 | Date formatting |
| **@vercel/blob** | 2.5.0 | Available for image uploads (not yet configured — needs token) |

## Dev Tooling

| Tool | Version | Notes |
|---|---|---|
| **Bun** | 1.3.14 | Package manager + runtime. Faster than npm. |
| **ESLint** | next/core-web-vitals + next/typescript | Config in `eslint.config.mjs`. Many rules disabled for pragmatism. |
| **Prisma CLI** | 6.19.2 | `bun run db:push`, `db:seed`, etc. |

## What NOT to Add

- **No Redux** — Zustand is enough for cart state. Server state via React Query if needed.
- **No Moment.js** — Use date-fns.
- **No Express** — Next.js API routes are the backend.
- **No separate backend** — Everything runs on Vercel serverless.
- **No Stripe/PayPal** — Crypto only. This is a hard requirement.
- **No Supabase/Firebase** — We use Neon Postgres + NextAuth.

## Version Constraints

- **Node**: 18+ (Vercel requires this)
- **Bun**: 1.3+ (for local dev)
- **Postgres**: 15+ (Neon provides this)
