# 10 — Security

## Current Security Measures

### Authentication
- **NextAuth.js v5** with credentials provider (email + password)
- **bcrypt** password hashing (12 rounds)
- **JWT sessions** (7-day TTL, HttpOnly + Secure cookies)
- **Server-side session checks** on all protected routes via `getSession()`, `requireUser()`, `requireAdmin()`

### Authorization
- **Role-based access**: `USER` and `ADMIN` roles
- **Ownership checks**: Users can only access their own orders, addresses, cart
- **Admin checks**: All `/api/admin/*` routes require `role === "ADMIN"`
- **Pay token verification**: Guest crypto payments require valid HMAC token bound to orderId

### Rate Limiting
Implemented in `src/proxy.ts` (Next.js 16 middleware replacement):

| Endpoint | Limit | Window |
|---|---|---|
| `/api/auth/*` | 10 req | per minute per IP |
| `/api/orders/*` | 20 req | per minute per IP |
| `/api/payments/*` | 30 req | per minute per IP |
| `/api/*` (default) | 100 req | per minute per IP |

- **In-memory** (Map-based, per server instance)
- **Cleanup**: Old entries purged every 5 minutes
- **Response**: HTTP 429 with `Retry-After: 60` header
- **Limitation**: In-memory doesn't work across multiple serverless instances. For production at scale, swap for Upstash Redis (free tier 10k req/day).

### Security Headers
Set by `src/proxy.ts` on all responses:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | Strict (see below) | Prevent XSS, data injection |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS (production only) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Disable unused browser APIs |

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https://api.coingecko.com https://api.etherscan.io https://blockstream.info https://litecoinspace.org https://base.blockscout.com https://optimism.blockscout.com https://api.mainnet-beta.solana.com https://mainnet.helius-rpc.com https://api.resend.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Note**: `unsafe-inline` and `unsafe-eval` are needed for Next.js (Turbopack dev + inline styles). In production, Next.js uses nonces, but we keep `unsafe-inline` for compatibility. To tighten further, configure nonces per-request.

### Data Protection
- **No sensitive data in localStorage**: Cart contains only product IDs + quantities. No PII.
- **No private keys stored**: Crypto payment gateway only stores public deposit addresses.
- **Password never logged**: bcrypt hashes only.
- **Email logging**: `EmailLog` table stores `to`, `subject`, `type`, `orderId`. No email body.
- **Guest checkout**: No account required. Email stored on order for notifications.

### Input Validation
- **Prisma**: Prevents SQL injection (parameterized queries)
- **Zod**: Not currently used, but available. Form validation is manual.
- **Address validation**: Crypto wallet addresses validated by regex per asset
- **Coupon validation**: Server-side checks for active, not expired, under max uses, min order

### Crypto Payment Security
- **HMAC pay tokens**: Guest access requires token signed with `PAY_TOKEN_SECRET`, bound to orderId, 48h TTL
- **Unique amount matching**: Random suffix (1-9999) ties on-chain transfer to specific order. No partial credit.
- **Timing-safe comparison**: `timingSafeEqual` for HMAC signature verification
- **Deposit addresses only**: No private keys ever touch the server
- **Confirmation requirements**: Each asset has min confirmations (BTC: 1, ETH: 12, etc.)

## Known Security Gaps

### 1. Rate Limiting is In-Memory
- **Issue**: Vercel serverless functions may have multiple instances. Rate limits are per-instance.
- **Impact**: Effective limit may be N×higher than configured (where N = number of instances).
- **Fix**: Use Upstash Redis (free tier 10k req/day) for distributed rate limiting.
- **Priority**: Medium. Current volume is low, so this isn't urgent.

### 2. No CSRF Protection
- **Issue**: Next.js API routes don't have built-in CSRF protection.
- **Impact**: A malicious site could potentially make POST requests to `/api/orders` etc. using the user's cookies.
- **Mitigating factors**: SameSite cookies (NextAuth default), CORS not enabled, CSP restricts connect-src.
- **Fix**: Add CSRF token to forms + verify on server. NextAuth has `csrfToken()` helper.
- **Priority**: Low (mitigating factors are strong).

### 3. No Brute Force Protection
- **Issue**: Rate limiting (10/min) slows but doesn't prevent password brute force.
- **Impact**: Attacker could try 10 passwords per minute per IP.
- **Fix**: Account lockout after N failed attempts. Or use a captcha after 3 failures.
- **Priority**: Medium. Add before launch if concerned.

### 4. No 2FA
- **Issue**: Admin accounts only require password.
- **Impact**: If admin password is compromised, full access.
- **Fix**: NextAuth supports TOTP 2FA. Could add for admin role only.
- **Priority**: Low (for now).

### 5. No Security Headers on Static Assets
- **Issue**: `proxy.ts` skips static assets (`_next`, `.svg`, etc.), so they don't get security headers.
- **Impact**: Low. Static assets don't execute code.
- **Fix**: Vercel adds some headers automatically. Could configure more in `vercel.json`.
- **Priority**: Very low.

### 6. Resend Domain Not Verified
- **Issue**: Emails send from `onboarding@resend.dev` instead of `noreply@phasedresearchgroup.com`.
- **Impact**: Emails may go to spam. Looks unprofessional.
- **Fix**: Verify domain in Resend dashboard (add DNS records).
- **Priority**: High (for deliverability).

## Security Best Practices Followed

- ✅ No secrets in code (all in env vars)
- ✅ `.env` files gitignored
- ✅ `.env.example` has no real secrets
- ✅ bcrypt for password hashing
- ✅ HMAC for pay tokens with timing-safe comparison
- ✅ Prisma parameterized queries (no SQL injection)
- ✅ Server-side auth checks on all protected routes
- ✅ Ownership verification on user resources
- ✅ Admin role checks on admin routes
- ✅ HTTPS enforced (HSTS in production)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Rate limiting on API routes
- ✅ Age gate (21+)
- ✅ RUO + age confirmation required at checkout
- ✅ No third-party payment processor (crypto goes direct to wallet)

## Incident Response

If a security breach is suspected:
1. **Rotate secrets immediately**: `AUTH_SECRET`, `PAY_TOKEN_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`
2. **Check Vercel logs** for unusual API activity
3. **Check Neon logs** for unusual queries
4. **Check Resend logs** for email abuse
5. **Review `EmailLog` table** for mass email attempts
6. **Review `PaymentIntent` table** for suspicious payment patterns
7. **Force password reset** for all users if auth compromised

## Compliance Notes

- **COPPA**: Not applicable (21+ only)
- **CCPA/CPRA**: Privacy policy includes user rights (know, delete, opt-out, correct, access)
- **GDPR**: Not specifically addressed (US-only shipping, US customers)
- **FDA**: Products not evaluated. RUO disclaimers throughout. Not a pharmacy (503A/503B).
- **PCI DSS**: Not applicable (no card payments, crypto only)
