# 01 — Project Overview

## What Is Phased Research Group?

Phased Research Group (PRG) is an e-commerce website that sells **research peptides** to qualified laboratory researchers. It is NOT a supplement store, NOT a pharmacy, and NOT for human consumption. All products are sold for "Research Use Only" (RUO).

## Business Model

- **Products**: 69 peptide compounds across 6 categories (metabolic, healing, hormone, neuro, longevity, other)
- **Pricing**: Per-vial and 5-vial kit pricing (kits get ~10% discount)
- **Payments**: Crypto only — BTC, LTC, SOL, USDC (Ethereum, Polygon, Base, Solana). Self-hosted wallets, no third-party processor.
- **Shipping**: US only, 12 states (TX, CA, FL, NY, AZ, CO, GA, IL, NC, OH, PA, WA). Ground $10.75, Express $22.95, free over $175.
- **Compliance**: 21+ age gate, RUO disclaimers, FDA/503A/503B regulatory language throughout

## Who Is the User?

- **Site owner**: Dustin (GitHub: dustindog101)
- **Audience**: Lab researchers, scientists, qualified personnel — NOT general consumers
- **Tone**: Skeptical, research-literate audience (Reddit r/Peptides crowd). They hate marketing speak, AI-generated copy, and "available upon request" COA games.

## What Makes This Site Different

Based on competitor research (see `16-RESEARCH-COMPETITORS.md`):

1. **Every lot is tested** — not sampled, not "representative." The actual lot.
2. **COAs are public** — on the product page before you buy. No "available upon request."
3. **Lot numbers match** — the number on your vial matches the number on the COA.
4. **Independent lab** — we name the lab that does testing. Not "in-house."
5. **Self-hosted crypto** — payments go straight to our wallet. No middleman.

## Tech Stack (high level)

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Next.js API routes (serverless on Vercel)
- **Database**: Prisma ORM + Neon Postgres (serverless, free tier)
- **Auth**: NextAuth.js v5 (credentials provider, email + password)
- **Payments**: Self-hosted crypto gateway (custom TypeScript port of Python Lambda logic)
- **Email**: Resend (transactional)
- **Hosting**: Vercel Hobby (free)
- **Images**: Next.js Image optimization + sharp for preprocessing

See `02-TECH-STACK.md` for full details.

## Current Status

| Area | Status | Notes |
|---|---|---|
| Storefront | ✅ Complete | Home, shop, product detail, cart, checkout, about, COA, FAQ, contact, track |
| Auth | ✅ Complete | Login, register, account, settings, password change |
| Admin | ✅ Complete | Dashboard, orders, products, users, coupons, payments, CSV export |
| Crypto payments | ✅ Built | Needs wallet addresses configured + Etherscan/Helius API keys |
| Email | ✅ Working | Resend configured, 3 email types (order, payment, shipping) |
| Legal pages | ✅ Complete | Terms, Privacy, Shipping, Refund — all comprehensive |
| Age gate | ✅ Complete | 21+ modal on first visit |
| Security | ✅ Good | Rate limiting, CSP, HSTS, bcrypt, HMAC tokens |
| Images | 🔄 Partial | Retatrutide has images, other products use SVG vial placeholder |
| Mobile | ✅ Responsive | Tested at 375px, 768px, 1440px |

## Live URLs

- **Production**: https://phased-research-group.vercel.app
- **GitHub**: https://github.com/dustindog101/phased-research-group
- **Admin login**: admin@phasedresearchgroup.com (password was set during seed — check with user)

## What's NOT Done (see `07-FEATURES-PLANNED.md`)

- Product images for non-retatrutide products (user will provide)
- Etherscan + Helius API keys (needed for USDC/SOL payment detection)
- Custom domain setup (optional)
- KYC/OTP verification at checkout (competitor feature, not planned for MVP)
- Packing slip / invoice PDF generation
- Shipping label integration (EasyPost/ShipStation)
