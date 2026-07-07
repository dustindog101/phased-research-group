# 05 — API Routes

All API routes are in `src/app/api/`. All return JSON unless noted. All require authentication unless noted.

## Auth

### `POST /api/auth/register`
Create a new user account.
- **Body**: `{ name?: string, email: string, password: string }`
- **Auth**: None
- **Response**: `{ success: true }`
- **Validation**: Email unique, password ≥ 8 chars

### `POST /api/auth/[...nextauth]`
NextAuth.js handler. Handles sign in, sign out, session.
- **Endpoints**: `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`, `/api/auth/csrf`
- **Auth**: None (this IS the auth)

## Orders

### `POST /api/orders`
Create a new order (auth or guest).
- **Body**: `{ items, email?, shippingAddress, shippingMethod, couponCode?, paymentMethod?, cryptoAsset?, ruoAccepted, ageConfirmed }`
- **Auth**: Optional (guest checkout allowed with email)
- **Response**: `{ orderId, orderNumber, total, paymentStatus }`
- **Side effects**: Increments coupon usage, sends order confirmation email
- **Rate limit**: 20/min

### `GET /api/orders`
List current user's orders.
- **Auth**: Required
- **Response**: `{ orders: Order[] }`

### `GET /api/orders/[orderId]`
Get single order with items + payment intent.
- **Auth**: Owner OR admin OR guest with valid `payToken`
- **Query**: `?payToken=xxx` (for guest access)
- **Response**: `{ order: Order & { items, paymentIntent } }`

### `PATCH /api/orders/[orderId]`
Update order (admin only).
- **Body**: `{ status?, paymentStatus?, trackingNumber?, customerNotice?, adminNotes?, paymentExpiresAt? }`
- **Auth**: Admin
- **Side effects**: Sends shipping notification email if trackingNumber added/changed

## Payments

### `GET /api/payments/methods`
List enabled crypto payment methods.
- **Auth**: None (public)
- **Response**: `{ methods: CryptoMethod[], enabled: boolean }`

### `POST /api/payments/pay-session`
Mint HMAC pay token for guest crypto invoice access.
- **Body**: `{ orderId: string }`
- **Auth**: None (but verifies order is unpaid crypto order)
- **Response**: `{ payToken: string, expiresAt: string }`
- **Rate limit**: 10/min per IP+orderId

### `POST /api/payments/intents`
Create / get / cancel a payment intent.
- **Body**: `{ action: "create"|"get"|"cancel", orderId, asset?, payToken? }`
- **Auth**: User JWT (owner) OR payToken (guest)
- **Response (create)**: `{ intent: PaymentIntent }`
- **Response (get)**: `{ intent: PaymentIntent | null }`
- **Response (cancel)**: `{ message, intentId? }`

### `GET /api/payments/intents?orderId=X&payToken=Y`
Get intent via GET (convenience).
- **Auth**: User JWT OR payToken

### `POST /api/payments/poll`
Poll for payment status (runs watcher for single order).
- **Body**: `{ orderId, payToken? }`
- **Auth**: User JWT (owner) OR payToken (guest)
- **Response**: `{ watched, status?, intent?, paymentStatus }`
- **Side effects**: Calls chain adapter, may update intent status, may mark order PAID

### `GET /api/cron/payment-watcher`
Daily reconciliation — expires stale intents, processes all active intents.
- **Auth**: CRON_SECRET (if configured) via `Authorization: Bearer xxx`
- **Response**: `{ processed, groups, enabledAssets, expiredSweep }`
- **Schedule**: Daily at 9 AM UTC (configured in `vercel.json`)

## Admin

All admin routes require `role: "ADMIN"`.

### Products
- `GET /api/admin/products` — list all
- `POST /api/admin/products` — create
- `GET /api/admin/products/[productId]` — get one
- `PATCH /api/admin/products/[productId]` — update
- `DELETE /api/admin/products/[productId]` — delete

### Orders
- `GET /api/admin/orders/export` — CSV export (returns CSV file, not JSON)
  - Query: `?status=&paymentStatus=`

### Users
- `PATCH /api/admin/users/[userId]` — update role/name

### Coupons
- `GET /api/admin/coupons` — list
- `POST /api/admin/coupons` — create
- `PATCH /api/admin/coupons/[couponId]` — update
- `DELETE /api/admin/coupons/[couponId]` — delete

### Payments
- `GET /api/admin/payments/settings` — get gateway config
- `PUT /api/admin/payments/settings` — update gateway config (addresses, TTL)
- `GET /api/admin/payments/summary` — activity summary counts
- `GET /api/admin/payments/intents` — list intents with filters
  - Query: `?status=&asset=&search=&limit=`

## Account (user)

### `POST /api/account/password`
Change password (requires current password).
- **Body**: `{ currentPassword, newPassword }`
- **Auth**: Required
- **Validation**: newPassword ≥ 8 chars, currentPassword must match

### Addresses
- `GET /api/account/addresses` — list user's addresses
- `POST /api/account/addresses` — create address
- `PATCH /api/account/addresses/[addressId]` — update
- `DELETE /api/account/addresses/[addressId]` — delete
- All require auth + ownership verification

## Public

### `GET /api/track?orderNumber=X&email=Y`
Public order lookup for tracking.
- **Auth**: None
- **Validation**: email must match order's email (if provided)
- **Response**: `{ orderId, paymentStatus, status }`

## Rate Limits

| Endpoint prefix | Limit | Window |
|---|---|---|
| `/api/auth` | 10 req | per minute |
| `/api/orders` | 20 req | per minute |
| `/api/payments` | 30 req | per minute |
| `/api/*` (default) | 100 req | per minute |

Rate limiting is in `src/proxy.ts` (in-memory, per IP). For production at scale, swap for Upstash Redis.

## Error Response Format

All errors return:
```json
{
  "error": "Human-readable error message"
}
```

HTTP status codes:
- `400` — Bad request (validation error)
- `401` — Authentication required
- `403` — Access denied (not owner/admin)
- `404` — Not found
- `429` — Rate limit exceeded
- `500` — Server error (check logs)
