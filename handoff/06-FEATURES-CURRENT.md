# 06 — Features (Current)

## Storefront

### Home Page (`/`)
- Hero with value proposition (human copy, no AI-speak)
- 3 pillar cards: 99%+ purity, independent lab, same-day shipping
- "Before You Buy" compliance notice (21+, RUO, FDA, 503A/503B)
- Featured products grid (8 products)
- Trust row (4 trust signals)
- "Why We Exist" section naming industry problems
- Category browser (6 categories)
- COA callout

### Shop (`/shop`)
- Product grid with search, category filter, sort, pagination
- URL-synced filters (`?category=&q=`)
- 12 products per page
- Responsive: 1 col mobile, 2 col tablet, 3-4 col desktop

### Product Detail (`/products/[slug]`)
- Product image (optimized WebP, falls back to SVG vial)
- Single vial / 5-vial kit toggle
- Quantity selector
- Add to cart + Buy Now
- Stock status
- Description + COA link
- Related products (same category)
- Breadcrumb navigation

### Product List (`/products`)
- Table view with quick-add
- Grouped by category
- Search + category filter
- Shows price, kit price, SKU

### Cart (`/cart`)
- Line items with quantity controls
- Coupon input (PRG10, RESEARCH15)
- Shipping method selector (ground/express)
- Free shipping progress bar ($175 threshold)
- Order summary with totals
- Persists to localStorage (guest) + database (logged in)

### Checkout (`/checkout`)
- Contact info form
- Shipping address form (12 US states)
- Shipping method selection
- Crypto payment method picker (7 assets)
- RUO + age confirmation checkboxes (required)
- Order summary with item list
- Creates order → creates payment intent → opens pay modal

### Crypto Pay Modal
- QR code (deposit address + exact amount)
- 15-second polling for payment detection
- Status: Awaiting → Detected → Confirmed
- Copy address button
- Countdown timer (48h expiry)
- Auto-close 2s after confirmation

### Order Tracking (`/track`)
- Public lookup by order number + email
- Redirects to order detail page

### Legal Pages
- `/terms` — 14-section Terms of Service
- `/privacy` — 13-section Privacy Policy (CCPA/CPRA)
- `/shipping` — Rates, state restrictions, processing
- `/refund` — 14-day returns, damaged items, crypto refunds

### Content Pages
- `/about` — Company story, "Why We Exist", compliance notice
- `/coa` — COA explanation + available COAs
- `/faq` — 12 questions with conversational answers
- `/contact` — Contact form + business info

## User Accounts

### Auth
- `/login` — Email + password sign in
- `/register` — Account creation
- NextAuth.js v5 with credentials provider
- 7-day JWT sessions
- Age gate (21+) on first visit, stored 30 days

### Account Dashboard (`/account`)
- Order count, address count, account email
- Recent orders (5 most recent)
- Admin link (if admin role)
- Sign out button

### Order History (`/account/orders`)
- All user orders, newest first
- Payment status + order status badges
- Links to order detail

### Order Detail (`/account/orders/[orderId]`)
- Full order info (items, totals, shipping address)
- Status tracker (5 steps: Placed → Paid → Processing → Shipped → Delivered)
- Tracking number (if shipped)
- "Complete Crypto Payment" button (if unpaid)

### Account Settings (`/account/settings`)
- Change password (requires current password)
- Address book CRUD (add, delete, set default)

## Admin Dashboard (`/admin`)

### Dashboard (`/admin`)
- Revenue, orders, users, products stats
- Recent orders table
- Quick links to all admin sections

### Orders (`/admin/orders`)
- Filterable, searchable order list
- Status + payment status filters
- CSV export button (downloads filtered orders)
- Click to view order detail

### Order Detail (`/admin/orders/[orderId]`)
- Full order breakdown (items, totals, address)
- Payment intent details (asset, amount, address, tx hash, status)
- Customer info
- Status update form (order status, payment status, tracking, notes)
- Shipping notification auto-sent when tracking added

### Products (`/admin/products`)
- Filterable product list
- Category filter chips
- Add product button
- Click to edit

### Product Form (`/admin/products/new` and `/admin/products/[productId]`)
- Full CRUD: name, dosage, slug, SKU, category, pricing, cap color, description, COA URL
- Live vial preview
- Featured + in stock toggles
- Stock quantity
- Delete button (on edit page)

### Users (`/admin/users`)
- Searchable user list
- Order count + total spent per user
- Toggle admin/user role
- Joined date

### Coupons (`/admin/coupons`)
- List all coupons
- Create new (percent or fixed, min order, max uses, expiry)
- Toggle active/inactive
- Delete
- Shows usage count

### Payments (`/admin/payments`)
- **Gateways tab**: Configure 7 crypto assets
  - Enable/disable toggle
  - Deposit address input
  - Min confirmations input
  - Payment intent TTL (hours)
- **Activity tab**: Payment intent ledger
  - Summary cards (active, confirmed 7d, expired, enabled assets)
  - Filterable intent list
  - Shows order, asset, amount, status, tx hash, date

## Crypto Payment Gateway

### Supported Assets
| Asset | Chain | Adapter | Min Confirmations |
|---|---|---|---|
| BTC | Bitcoin | Esplora (blockstream.info) | 1 |
| LTC | Litecoin | Esplora (litecoinspace.org) | 1 |
| SOL | Solana | Solana RPC (Helius preferred) | 1 |
| USDC (Ethereum) | Ethereum | Etherscan V2 | 12 |
| USDC (Polygon) | Polygon | Etherscan V2 | 12 |
| USDC (Base) | Base | Blockscout (free) | 12 |
| USDC (Solana) | Solana | Solana RPC (Helius preferred) | 1 |

### Payment Flow
1. Checkout creates order (PENDING/UNPAID)
2. Creates PaymentIntent with unique amount (USD total / rate + random suffix 1-9999)
3. Modal polls every 15s, calls chain adapter
4. On exact amount match: PENDING → DETECTED → CONFIRMED
5. On CONFIRMED: order → PAID, inventory decremented, email sent
6. Daily cron reconciles missed payments + expires stale intents

### Features
- Self-hosted (no third-party processor)
- HMAC pay tokens for guest access (48h TTL)
- Unique amount matching (no partial credit)
- Client-side polling for real-time UX
- Daily cron for reconciliation
- Admin can configure deposit addresses, min confirmations, TTL

## Email Notifications

### Order Confirmation
- Sent on order creation
- HTML email with item table, totals, shipping address
- From: `noreply@phasedresearchgroup.com`

### Payment Received
- Sent when crypto payment confirms on-chain
- Asset, amount, order number
- "Your order will ship within 1-2 business days"

### Shipping Notification
- Sent when admin adds tracking number
- Carrier, tracking number
- "Your order is on the way"

### Email Logging
- All sent emails logged in `EmailLog` table
- Dev mode: emails logged to console, not sent (when no RESEND_API_KEY)

## Security

- Rate limiting (in-memory, per IP)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- bcrypt password hashing (12 rounds)
- HMAC-signed pay tokens
- Auth checks on all API routes
- Ownership verification on user resources
- Admin role checks on admin routes
- Age gate (21+)
- RUO + age confirmation required at checkout

## Mobile Responsive

All pages tested at:
- 375px (iPhone SE / small phone)
- 768px (iPad / tablet)
- 1440px (desktop)

Header collapses to hamburger menu at `lg` breakpoint. Footer reflows to 1-2 columns on mobile. Forms stack vertically. Tables scroll horizontally.
