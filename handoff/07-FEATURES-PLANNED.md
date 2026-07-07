# 07 — Features (Planned)

Priority order. Top items are what the user wants next.

## P0 — Required Before Real Launch

### 1. Configure Crypto Wallet Addresses
**Status**: Not done. **Who**: Site owner (Dustin).
- Log into `/admin/payments`
- Enable each asset (BTC, LTC, SOL, USDC variants)
- Enter deposit wallet addresses (public keys only, no private keys)
- Set min confirmations (defaults are fine)
- Set payment intent TTL (48h default is fine)
- **Without this, no payments can be received**

### 2. Get Etherscan API Key
**Status**: Not done. **Who**: Site owner.
- Register at https://etherscan.io/register (free)
- Get API key
- Send to agent to configure on Vercel
- **Required for USDC (Ethereum + Polygon) payment detection**
- Without it, USDC on Base still works (uses Blockscout, no key needed)

### 3. Get Helius API Key
**Status**: Not done. **Who**: Site owner.
- Register at https://helius.dev (free, 100k req/mo)
- Get API key
- Send to agent to configure on Vercel
- **Required for SOL + USDC (Solana) payment detection**
- Without it, falls back to public RPC (rate-limited, may miss payments)

### 4. Verify Resend Domain
**Status**: Not done. **Who**: Site owner.
- Log into Resend dashboard
- Add `phasedresearchgroup.com` domain
- Add DNS records (SPF, DKIM, DMARC)
- Currently sends from `onboarding@resend.dev` (works but looks unprofessional)
- **Required for reliable email delivery**

### 5. Add Product Images
**Status**: Retatrutide done. Others pending. **Who**: Site owner provides images.
- User will send images for other products
- See `14-IMAGES.md` for how to add them
- Image optimization script: `bun run scripts/optimize-product-image.ts <input> <slug>`

## P1 — Important for Growth

### 6. Custom Domain
**Status**: Not configured.
- Buy domain (e.g., `phasedresearchgroup.com`)
- Add to Vercel project settings
- Update DNS to point to Vercel
- Update `EMAIL_FROM` env var
- Update Resend domain verification

### 7. COA Document Upload
**Status**: COA page exists, but no upload mechanism.
- Admin should be able to upload COA PDFs per product lot
- Could use Vercel Blob (free 1GB) or store as static files
- Product page should link to COA
- COA page should list all available COAs

### 8. Batch-Specific COAs
**Status**: Products have one COA URL field.
- Each product lot should have its own COA
- Lot number on vial matches COA lot number
- This is a core trust signal (see `16-RESEARCH-COMPETITORS.md`)
- May need a `ProductLot` model with lot number, COA URL, test date, purity %

### 9. Janoshik Integration (or named lab)
**Status**: Not done.
- Reddit users specifically look for Janoshik testing
- Either use Janoshik as the third-party lab, or name whatever lab you use
- Display the lab name on product pages and COAs
- This is the #1 trust signal for Reddit users

### 10. Searchable COA Library
**Status**: Not done.
- Public page where users can search by batch/lot number
- No login required
- Shows the COA PDF + test results
- Cosmic Peptides is the model here

## P2 — Nice to Have

### 11. Product Page: Full Specifications
**Status**: Only name, dosage, price shown.
- Add: amino acid sequence, CAS number, molecular formula, molecular weight
- Add: storage conditions (in °C)
- Add: test types (HPLC, LC-MS, sterility USP 71, endotoxin USP 85, heavy metals)
- Add: lot number + purity % on the product card (before click)
- See `16-RESEARCH-COMPETITORS.md` for why this matters

### 12. Admin: Bulk Order Actions
**Status**: Not done.
- Select multiple orders → mark as shipped, add tracking, print packing slips
- Useful when fulfilling many orders at once

### 13. Packing Slip / Invoice PDF
**Status**: Not done. `exceljs` is installed but unused.
- Generate PDF packing slip per order
- Include: order number, items, shipping address, "RUO" watermark
- Admin can download from order detail page

### 14. Dashboard Charts
**Status**: Not done. `recharts` is installed but unused.
- Revenue over time (line chart)
- Orders by status (pie chart)
- Top products (bar chart)
- Payment method breakdown

### 15. Product Reviews
**Status**: Not done.
- Logged-in users can review products they've ordered
- Star rating + text
- Admin can moderate
- Trust signal if done well

### 16. Wishlist / Favorites
**Status**: Not done.
- Users can save products to a wishlist
- Low priority, but common e-commerce feature

### 17. Order Notes (Customer)
**Status**: Not done.
- Customer can add a note to their order at checkout
- Admin sees it in order detail

## P3 — Future Considerations

### 18. KYC / OTP Verification
**Status**: Not done.
- Pure Health Peptides uses Xecurify + Plaid for KYC at checkout
- This is the leading edge of compliance
- May be required if regulations tighten
- Complex to build, skip for now

### 19. Apple Pay / Card Payments
**Status**: Not done. Currently crypto-only.
- Reddit users specifically mention Apple Pay as a trust signal
- "Luckily they have apple pay so you don't have to do that sketchy stuff"
- Would require Stripe or similar (not free)
- User said crypto-only is non-negotiable, so skip unless they change their mind

### 20. Two-Factor Authentication
**Status**: Not done.
- For admin accounts especially
- NextAuth supports TOTP
- Low priority until there's a security incident

### 21. Abandoned Cart Recovery
**Status**: Not done.
- Email users who left items in cart without checking out
- Requires email automation (Resend supports this)
- Low priority

### 22. Affiliate Program
**Status**: Not done.
- Let influencers earn commission on referrals
- Complex (tracking, payouts, fraud prevention)
- Skip for now

## Decided Against

These were considered and rejected:

- **Stripe/PayPal** — User wants crypto-only. Non-negotiable.
- **Supabase/Firebase** — We use Neon Postgres + NextAuth. No vendor lock-in.
- **AWS Lambda/DynamoDB** — Too complex for free tier. Vercel serverless + Neon is simpler.
- **Third-party crypto gateway (NOWPayments)** — User wants self-hosted. Keeps fees at 0%.
- **Redux** — Zustand is enough for cart state.
- **Moment.js** — Use date-fns instead.
