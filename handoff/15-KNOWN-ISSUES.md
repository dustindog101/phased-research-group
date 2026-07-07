# 15 — Known Issues

## Critical (needs fixing before launch)

### 1. Crypto Wallet Addresses Not Configured
- **Issue**: No deposit addresses entered in `/admin/payments`
- **Impact**: No payments can be received. Checkout will fail at intent creation.
- **Fix**: Admin logs in, goes to `/admin/payments`, enables assets, enters wallet addresses.
- **Status**: Waiting on site owner.

### 2. Etherscan API Key Not Set
- **Issue**: `ETHERSCAN_API_KEY` env var not configured on Vercel
- **Impact**: USDC payments on Ethereum + Polygon won't be detected
- **Fix**: Get free key at etherscan.io/register, set on Vercel
- **Workaround**: USDC on Base still works (uses Blockscout, no key needed)

### 3. Helius API Key Not Set
- **Issue**: `HELIUS_API_KEY` env var not configured on Vercel
- **Impact**: SOL + USDC (Solana) payment detection uses public RPC (rate-limited)
- **Fix**: Get free key at helius.dev, set on Vercel
- **Workaround**: Public RPC works but may miss payments under load

### 4. Resend Domain Not Verified
- **Issue**: `phasedresearchgroup.com` not verified in Resend
- **Impact**: Emails send from `onboarding@resend.dev` instead of `noreply@phasedresearchgroup.com`
- **Fix**: Add domain in Resend dashboard, add DNS records (SPF, DKIM, DMARC)
- **Impact**: Emails may go to spam; looks unprofessional

## Non-Critical (known limitations)

### 5. Rate Limiting is In-Memory
- **Issue**: `proxy.ts` uses in-memory Map for rate limiting
- **Impact**: Multiple Vercel serverless instances = multiple rate limit counters. Effective limit may be N×higher.
- **Fix**: Use Upstash Redis (free 10k req/day) for distributed rate limiting
- **Priority**: Low (current volume is low)

### 6. No CSRF Protection
- **Issue**: No CSRF tokens on forms
- **Impact**: Theoretical CSRF attack possible (malicious site submits form using user's cookies)
- **Mitigating factors**: SameSite cookies, CORS not enabled, CSP restricts connect-src
- **Priority**: Low (mitigating factors are strong)

### 7. No Account Lockout
- **Issue**: No brute force protection beyond rate limiting (10 auth attempts/min)
- **Fix**: Add account lockout after N failed attempts, or captcha after 3 failures
- **Priority**: Medium

### 8. No 2FA
- **Issue**: Admin accounts only require password
- **Fix**: NextAuth supports TOTP 2FA
- **Priority**: Low

### 9. Dev Server Instability in Sandbox
- **Issue**: The Next.js dev server sometimes dies after a few requests in this sandbox environment
- **Impact**: Browser testing may fail intermittently
- **Workaround**: Restart dev server with `nohup bun run dev > /tmp/dev.log 2>&1 &`
- **Note**: This is a sandbox issue, not a code issue. Production on Vercel is stable.

### 10. Prisma Schema Uses Strings Instead of Enums
- **Issue**: SQLite doesn't support enums, so schema uses `String` with comments
- **Impact**: No database-level constraint on enum values
- **Mitigation**: Application code enforces valid values
- **Fix**: When stable on Postgres, could migrate to real enums. Not worth the risk now.

### 11. No Database Migrations
- **Issue**: Using `prisma db push` instead of `prisma migrate`
- **Impact**: No versioned migration history. Schema changes are applied directly.
- **Risk**: If schema change breaks existing data, no automatic rollback
- **Fix**: When in stable production with real data, switch to `prisma migrate`
- **Priority**: Medium (do this before significant data accumulates)

### 12. Cart Doesn't Sync Between Server and Client
- **Issue**: Cart is in localStorage (Zustand) for guests. Logged-in users' carts are in localStorage too, not synced to DB `Cart` model.
- **Impact**: Cart doesn't persist across devices for logged-in users
- **Fix**: Sync cart to DB on login, load from DB on page load
- **Priority**: Low (users rarely switch devices mid-shopping)

### 13. No Image Upload in Admin
- **Issue**: Admin can't upload product images via UI
- **Workaround**: Use `scripts/optimize-product-image.ts` + commit to git
- **Fix**: Integrate Vercel Blob for image uploads
- **Priority**: Medium (after launch)

### 14. No Packing Slips / Invoices
- **Issue**: No PDF generation for packing slips or invoices
- **Fix**: Use a PDF library (pdfkit, puppeteer) to generate from order data
- **Priority**: Medium

### 15. No Dashboard Charts
- **Issue**: Admin dashboard has stats but no charts
- **Fix**: `recharts` is installed. Build revenue/orders charts.
- **Priority**: Low

### 16. Webhook for Crypto Payments Not Implemented
- **Issue**: Payment detection relies on client polling + daily cron
- **Impact**: If user closes modal before payment confirms, detection waits for daily cron
- **Fix**: Could add a webhook endpoint that block explorers call on new transaction. But Esplora/Etherscan/Solana don't offer webhooks for free. Would need a third-party service.
- **Priority**: Low (daily cron is sufficient for current volume)

### 17. No Product Search Backend
- **Issue**: Search is client-side filtering over the full product list
- **Impact**: Works fine for 69 products. Would be slow with thousands.
- **Fix**: Add server-side search with Prisma `contains` queries (already in `searchProducts()`)
- **Priority**: Low (shop page already loads all products)

### 18. Checkout Form Doesn't Save Address
- **Issue**: Checkout doesn't offer to save address to address book
- **Fix**: Add checkbox "Save this address to my account" on checkout
- **Priority**: Low

## Resolved Issues

### Build Script Had Docker Commands (FIXED)
- **Issue**: `package.json` build script had `cp -r .next/static .next/standalone/.next/` commands meant for Docker, which broke Vercel builds
- **Fix**: Changed to just `next build`. Added `build:standalone` for Docker use.
- **Commit**: `188ab2f`

### Hydration Mismatch in Header (FIXED)
- **Issue**: Cart count from localStorage rendered differently on server vs client
- **Fix**: Added `mounted` state pattern, render 0 until mounted
- **Commit**: `0776bce`

### Shop Client Loading State Error (FIXED)
- **Issue**: Referenced `loading` state variable that was removed
- **Fix**: Removed the loading skeleton conditional
- **Commit**: `0776bce`

### Middleware Deprecated in Next.js 16 (FIXED)
- **Issue**: `middleware.ts` is deprecated, should be `proxy.ts` with `proxy()` function
- **Fix**: Renamed file + function
- **Commit**: `7d43522`

## Reporting New Issues

When you find a new issue, add it to this file under the appropriate section. Include:
1. **Issue**: What's wrong
2. **Impact**: What breaks because of it
3. **Fix**: How to fix it (if known)
4. **Priority**: Critical / Medium / Low
5. **Status**: Pending / In Progress / Fixed
