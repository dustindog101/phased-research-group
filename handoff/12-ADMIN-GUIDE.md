# 12 — Admin Guide

This guide is for the site owner (Dustin) and any future admins.

## Accessing the Admin Dashboard

1. Go to https://phasedresearchgroup.com/login
2. Sign in with admin email + password
3. Navigate to `/admin` (or click "Admin Dashboard" link on your account page)

## Admin Dashboard Sections

### Dashboard (`/admin`)
- **Revenue**: Total from all paid orders
- **Orders**: Total order count
- **Users**: Registered user count
- **Products**: Product catalog count
- **Recent Orders**: 5 most recent orders
- **Quick Stats**: Orders in last 7 days, pending payments, paid orders

### Orders (`/admin/orders`)
- **Search**: By order number or customer email
- **Filter**: By order status (PENDING, PAID, SHIPPED, etc.)
- **Filter**: By payment status (UNPAID, PAID, etc.)
- **Export CSV**: Download all filtered orders as a spreadsheet
- **Click any order** to view details

### Order Detail (`/admin/orders/[orderId]`)
- **Items**: Product list with quantities + prices
- **Payment Intent**: Asset, amount, deposit address, tx hash, status
- **Shipping Address**: Customer's address
- **Customer**: Email + name
- **Actions** (right sidebar):
  - Update order status (PENDING → PAID → PROCESSING → SHIPPED → DELIVERED)
  - Update payment status (UNPAID → PAID → REFUNDED)
  - Add tracking number (auto-sends shipping email to customer)
  - Add admin notes (internal, not shown to customer)
  - Add customer notice (shown to customer on order page)

### Products (`/admin/products`)
- **Filter**: By category
- **Click any product** to edit
- **Add Product** button to create new

### Product Form (`/admin/products/new` or `/admin/products/[productId]`)
- **Name**: e.g., "Retatrutide"
- **Dosage**: e.g., "10mg"
- **Display Name**: e.g., "Retatrutide 10mg"
- **Slug**: URL slug, e.g., "prg-retatrutide-10mg" (must match image folder name)
- **SKU**: e.g., "PRG-RETATRUT-10MG" (auto-uppercase)
- **Category**: Dropdown (metabolic, healing, hormone, neuro, longevity, other)
- **Price**: Per-vial price in USD
- **Kit Price**: 5-vial kit price in USD
- **Cap Color**: Color picker for SVG vial fallback
- **Featured**: Show on home page
- **In Stock**: Toggle
- **Stock Quantity**: Auto-decremented on payment
- **Description**: Short text
- **Long Description**: Markdown
- **COA URL**: Link to Certificate of Analysis PDF
- **Preview**: Live vial/product image preview
- **Delete**: Permanently remove product

### Users (`/admin/users`)
- **Search**: By email, username, or name
- **View**: Order count + total spent per user
- **Role toggle**: Make admin / make user
- **Joined date**

### Coupons (`/admin/coupons`)
- **Code**: e.g., "SUMMER20" (auto-uppercase)
- **Type**: Percentage or Fixed
- **Value**: % off or $ off
- **Min Order**: Minimum subtotal required
- **Max Uses**: Limit total uses (blank = unlimited)
- **Expires At**: Auto-expiry timestamp
- **Toggle**: Active/inactive
- **Usage count**: Shows how many times used

Current coupons:
- `PRG10` — 10% off
- `RESEARCH15` — 15% off

### Payments (`/admin/payments`)
This is where you configure your crypto wallets.

#### Gateways Tab
For each of the 7 crypto assets:
- **Toggle**: Enable/disable
- **Deposit Address**: Your wallet's public address
- **Min Confirmations**: How many block confirmations before marking paid
  - BTC/LTC: 1 is fine
  - SOL: 1 is fine
  - EVM USDC: 12 is recommended (security vs speed)
- **TTL**: How long invoices stay valid (48 hours default)

**Important**: Enter public addresses ONLY. Never put private keys or seed phrases in the admin panel or any field on this site.

#### Activity Tab
- **Summary**: Active intents, confirmed (7d), expired, enabled assets
- **Intent list**: All payment intents with filters
  - Filter by status (pending, detected, confirmed, expired, cancelled)
  - Filter by asset
  - Search by order ID, intent ID, or tx hash
- Shows: Order, asset, amount, status, tx hash, date

## Common Admin Tasks

### Processing a New Order
1. Customer pays with crypto → payment auto-confirms → order status becomes PAID
2. Go to `/admin/orders/[orderId]`
3. Review order items + shipping address
4. Pack the order
5. Add tracking number in the Actions sidebar → status auto-updates to SHIPPED
6. Customer receives shipping email automatically

### Handling a Payment Issue
If a customer says they paid but the order is still UNPAID:
1. Ask for their order number + tx hash
2. Go to `/admin/payments` → Activity tab
3. Search for the order number or tx hash
4. Check the intent status:
   - PENDING: Payment not detected on-chain yet. Wait or check the tx hash on a block explorer.
   - DETECTED: Payment seen, waiting for confirmations. Just wait.
   - EXPIRED: Invoice expired before payment. Customer needs to create a new invoice from their order page.
5. If payment was sent but not detected, the customer may have sent the wrong amount. Compare the tx amount to `expectedAmount`.

### Adding a New Product
1. `/admin/products` → "Add Product"
2. Fill in all fields
3. If you have a product image, see `14-IMAGES.md` for how to add it
4. Click "Create Product"

### Adding a Product Image
See `14-IMAGES.md` for the full process. Short version:
1. Get the image file
2. Run: `bun run scripts/optimize-product-image.ts <image-path> <product-slug>`
3. The script generates optimized WebP images in `public/products/<slug>/`
4. Commit and push — the image auto-appears on the product page

### Creating a Coupon
1. `/admin/coupons` → "New Coupon"
2. Enter code (e.g., "LAUNCH20")
3. Select type (Percent or Fixed)
4. Enter value
5. Set max uses or expiry if desired
6. Click "Create"

### Exporting Orders for Fulfillment
1. `/admin/orders`
2. Filter as needed (e.g., status=PAID to export orders ready to ship)
3. Click "Export CSV"
4. Opens in Excel/Google Sheets — use for packing + shipping

## Admin Account Security

- **Change your password**: Go to `/account/settings` → Change Password
- **Don't share admin credentials**: Each admin should have their own account
- **Make someone admin**: Go to `/admin/users`, find their account, click "Make Admin"
- **Remove admin**: Same place, click "Make User"

## Default Admin Credentials (CHANGE IMMEDIATELY)

- Email: `admin@phasedresearchgroup.com`
- Password: Set during seed (check `.env` or ask the previous agent)

**To change**: Log in → `/account/settings` → Change Password
