# Phased Research Group

Premium research peptides e-commerce platform with self-hosted crypto payment gateway.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Prisma ORM (SQLite for dev, Neon Postgres for production)
- **Auth**: NextAuth.js v5 (Credentials provider)
- **Payments**: Self-hosted crypto gateway (BTC, LTC, SOL, USDC on ETH/Polygon/Base/Solana)
- **Email**: Resend (transactional)
- **Storage**: Vercel Blob (product images)
- **Hosting**: Vercel (Hobby tier — free)

## Features

### Customer-facing
- Storefront with 69 peptide products across 6 categories
- Product detail pages with single-vial and 5-vial kit options
- Shopping cart with coupon support (PRG10, RESEARCH15)
- Guest checkout with crypto payments
- User accounts (login/register) with order history
- Order tracking page
- COA (Certificate of Analysis) documentation
- FAQ, About, Contact pages
- Responsive design (mobile-first)

### Admin Dashboard (`/admin`)
- Dashboard with revenue/order/user metrics
- Order management (list, filter, update status, add tracking)
- Product management (full CRUD with image upload)
- User management (list, toggle admin role)
- Coupon management (create, edit, delete, toggle active)
- Payment gateway configuration (deposit addresses per asset)
- Payment activity ledger (live intent tracking)

### Crypto Payment Gateway
- Self-hosted: no third-party processor, payments go directly to your wallets
- 7 assets: BTC, LTC, SOL, USDC (Ethereum, Polygon, Base, Solana)
- Unique-amount matching (random suffix ties on-chain transfer to order)
- Real-time detection via client-side polling (15s intervals)
- Daily reconciliation via Vercel Cron
- HMAC pay tokens for guest invoice access (48h TTL)
- Chain adapters: Esplora (BTC/LTC), Etherscan V2 + Blockscout (EVM USDC), Solana RPC (SOL/USDC)

## Getting Started

### 1. Install dependencies
```bash
bun install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your secrets
```

### 3. Set up the database
```bash
# For dev (SQLite): DATABASE_URL=file:./db/dev.db in .env
# Prisma schema provider should be "sqlite" for dev

bun run db:push    # Create tables
bun run db:seed    # Seed products, coupons, admin user
```

### 4. Run the dev server
```bash
bun run dev
```

Visit http://localhost:3000

### 5. Default admin login
- Email: `admin@phasedresearchgroup.com`
- Password: `admin12345` (change immediately!)

## Production Deployment (Vercel + Neon)

### 1. Create a Neon Postgres database
- Sign up at [neon.tech](https://neon.tech) (free tier: 0.5GB)
- Create a project and copy the connection string

### 2. Update Prisma schema for Postgres
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Set environment variables in Vercel
- `DATABASE_URL` — Neon connection string
- `AUTH_SECRET` — `openssl rand -base64 32`
- `PAY_TOKEN_SECRET` — `openssl rand -hex 32`
- `CRYPTO_PAYMENTS_ENABLED` — `true`
- `CRON_SECRET` — random string to protect cron endpoint
- Optional: `COINGECKO_API_KEY`, `ETHERSCAN_API_KEY`, `HELIUS_API_KEY`
- Optional: `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`

### 4. Deploy
```bash
vercel --prod
```

### 5. Push database schema
```bash
DATABASE_URL=your-neon-url bun run db:push
DATABASE_URL=your-neon-url bun run db:seed
```

### 6. Configure crypto gateways
- Log in as admin
- Go to `/admin/payments`
- Enable assets and enter your deposit wallet addresses
- Set payment intent TTL (default 48h)

## Crypto Payment Flow

1. Customer adds items to cart, checks out
2. Selects crypto asset (e.g. BTC)
3. Order created in DB with `paymentStatus: UNPAID`
4. Payment intent created with unique amount (USD total / rate + random suffix 1-9999)
5. QR code + deposit address shown in modal
6. Client polls `/api/payments/poll` every 15s
7. Poll endpoint calls chain adapter (Esplora/Etherscan/Solana RPC)
8. On exact amount match: status → DETECTED (if below min confirmations) or CONFIRMED
9. On CONFIRMED: order `paymentStatus` → PAID, `status` → PAID
10. Daily Vercel Cron reconciles any missed payments + expires stale intents

## Project Structure

```
src/
├── app/
│   ├── (storefront)/     # Home, shop, product, cart, checkout, about, coa, faq, contact
│   ├── account/          # User account, orders, order detail
│   ├── admin/            # Admin dashboard, orders, products, users, coupons, payments
│   ├── track/            # Guest order tracking
│   ├── login/            # Auth pages
│   ├── register/
│   └── api/              # API routes
│       ├── auth/         # NextAuth + register
│       ├── orders/       # Order CRUD
│       ├── payments/     # Crypto intents, pay-session, poll, methods
│       ├── admin/        # Admin-only APIs
│       ├── track/        # Public order lookup
│       └── cron/         # Vercel Cron watcher
├── components/
│   ├── store/            # Header, footer, product cards, vial SVG
│   ├── payments/         # CryptoPayModal
│   ├── admin/            # Admin shell, tables, forms
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── payments/         # Crypto gateway core (types, constants, handlers, adapters, watcher)
│   ├── auth.ts           # Session helpers
│   ├── constants.ts      # Site config, shipping, categories
│   ├── products.ts       # Product data access
│   └── db.ts             # Prisma client (re-exported from /db)
├── hooks/                # useCart, useCurrentUser
└── auth.ts               # NextAuth config

db/
└── index.ts              # Prisma client

prisma/
└── schema.prisma         # Database schema

scripts/
├── seed.ts               # Database seeder
└── products.json         # Product data (69 peptides)
```

## License

Proprietary — Phased Research Group. All rights reserved.
