# 11 — Crypto Payment Gateway

## Overview

The crypto payment gateway is **self-hosted**. No third-party processor (no Coinbase Commerce, no NOWPayments, no Stripe). Payments go directly from the customer's wallet to our wallet. We watch the blockchain for the exact amount + match it to the order.

This was ported from a Python AWS Lambda implementation to TypeScript. The business logic is preserved 1:1.

## Supported Assets

| Asset ID | Label | Chain | Decimals | Default Confirmations | Adapter |
|---|---|---|---|---|---|
| `btc` | Bitcoin | Bitcoin | 8 | 1 | Esplora (blockstream.info) |
| `ltc` | Litecoin | Litecoin | 8 | 1 | Esplora (litecoinspace.org) |
| `sol` | Solana | Solana | 9 | 1 | Solana RPC (Helius preferred) |
| `usdc_ethereum` | USDC (Ethereum) | Ethereum | 6 | 12 | Etherscan V2 |
| `usdc_polygon` | USDC (Polygon) | Polygon | 6 | 12 | Etherscan V2 |
| `usdc_base` | USDC (Base) | Base | 6 | 12 | Blockscout (free, no key) |
| `usdc_solana` | USDC (Solana) | Solana SPL | 6 | 1 | Solana RPC (Helius preferred) |

## Payment Flow (Detailed)

### 1. Checkout
Customer selects crypto asset at checkout. Order is created with `status: PENDING`, `paymentStatus: UNPAID`.

### 2. Intent Creation (`POST /api/payments/intents`)
- Fetch order, verify ownership
- Check no active intent exists for this order
- Get gateway settings (deposit address, min confirmations)
- Fetch CoinGecko rates (USD → crypto)
- Compute unique amount:
  ```
  base_atomic = floor((usd_total / rate) * 10^decimals)
  suffix = random(1, 9999)
  expected_atomic = base_atomic + suffix
  ```
- Check for collision (another active intent with same deposit address + expected atomic)
- Retry up to 5 times if collision
- Create PaymentIntent record
- Update order: `paymentIntentId`, `cryptoAsset`

### 3. Pay Session (guest only, `POST /api/payments/pay-session`)
- If user not logged in, mint HMAC pay token bound to orderId
- Token format: `base64url(payload).base64url(hmac_signature)`
- Payload: `{ typ: "pay", orderId, exp }`
- TTL: 48 hours
- Token allows guest to view/pay their invoice without an account

### 4. Payment Modal (`CryptoPayModal`)
- Shows QR code: `{assetSymbol}:{depositAddress}?amount={expectedAmount}`
- Shows deposit address with copy button
- Shows exact amount to send
- Polls `POST /api/payments/poll` every 15 seconds
- Status transitions: PENDING → DETECTED → CONFIRMED (or EXPIRED/CANCELLED)
- Auto-closes 2 seconds after CONFIRMED

### 5. Polling (`POST /api/payments/poll`)
- Called by modal every 15s while open
- Calls `watchSingleOrder(orderId)` in watcher
- Watcher:
  1. Fetches the active intent
  2. Calls the chain-specific adapter to fetch recent transfers to deposit address
  3. Looks for a transfer matching `expectedAtomic` exactly
  4. If match found and confirmations ≥ min: → CONFIRMED
  5. If match found but confirmations < min: → DETECTED
  6. Updates intent status, tx hash, confirmations

### 6. Confirmation (on CONFIRMED)
- PaymentIntent → CONFIRMED, set `confirmedAt`, `txHash`, `confirmations`
- Order → `paymentStatus: PAID`, `status: PAID`, `cryptoTxHash`
- **Deduct inventory**: For each order item, decrement product `stockQty` (kits × 5)
- **Send email**: Payment received notification
- Modal auto-closes, redirects to order detail

### 7. Daily Cron (`/api/cron/payment-watcher`)
- Runs daily at 9 AM UTC (Vercel Cron)
- Expires stale intents (PENDING/DETECTED past `expiresAt`)
- For expired intents: clears `paymentIntentId` + `cryptoAsset` on order (so new invoice can be created)
- Processes all active intents (same logic as polling, but for all orders)
- Safety net for when users close the modal before payment confirms

## Chain Adapters

### Esplora (BTC + LTC)
- **API**: `https://blockstream.info/api` (BTC), `https://litecoinspace.org/api` (LTC)
- **Auth**: None (free, no key)
- **Method**: GET `/address/{address}/txs`
- **Matching**: Sum vout values where `scriptpubkey_address === deposit_address`
- **Confirmations**: From `status.confirmations`

### Etherscan V2 (Ethereum + Polygon USDC)
- **API**: `https://api.etherscan.io/v2/api`
- **Auth**: API key (free, 5 req/s) — **NEEDED, not yet configured**
- **Method**: GET with `module=account&action=tokentx&contractaddress={usdc_contract}&address={deposit}`
- **Matching**: Filter `to === deposit_address`, compare `value`
- **Chains**: 1 (Ethereum), 137 (Polygon)
- **Fallback**: Blockscout for Base (chain 8453) — Etherscan free tier doesn't cover Base

### Blockscout (Base USDC)
- **API**: `https://base.blockscout.com/api`
- **Auth**: None (free)
- **Method**: Etherscan-compatible API
- **Why**: Etherscan V2 free tier doesn't cover Base chain

### Solana RPC (SOL + USDC SPL)
- **API**: Helius (`https://mainnet.helius-rpc.com/?api-key={key}`) or public (`https://api.mainnet-beta.solana.com`)
- **Auth**: Helius API key (free, 100k req/mo) — **NEEDED, not yet configured**
- **Method**: `getSignaturesForAddress` + `getTransaction`
- **SOL matching**: Compare `preBalances` vs `postBalances` for deposit address
- **USDC matching**: Compare `preTokenBalances` vs `postTokenBalances` for USDC mint
- **Confirmations**: `confirmationStatus` (processed/confirmed/finalized)

## Key Files

```
src/lib/payments/
├── constants.ts          # 7 crypto assets metadata (ASSETS object)
├── types.ts              # PaymentIntent, SitePaymentSettings, etc.
├── validation.ts         # Address validation per asset (regex)
├── amounts.ts            # CoinGecko fetch + computeUniqueAmount
├── payToken.ts           # HMAC token sign/verify (guest access)
├── settings.ts           # PaymentSettings CRUD + sanitizeIntentForClient
├── orderHelpers.ts       # isCryptoOrder, parseCryptoAssetFromMethod
├── intentStatus.ts       # effectiveIntentStatus (resolves expiry)
├── handlers.ts           # handleCreatePaymentIntent, get, cancel
├── adminActivity.ts      # Admin activity ledger + summary
├── watcher.ts            # runWatcher, watchSingleOrder, expireStaleIntents
├── adapters/
│   ├── esplora.ts        # BTC + LTC
│   ├── etherscan.ts      # EVM USDC (Etherscan + Blockscout fallback)
│   └── solana.ts         # SOL + SPL USDC
└── index.ts              # Public barrel
```

## Admin Configuration

Admin configures the payment gateway at `/admin/payments`:
- Toggle each asset on/off
- Enter deposit wallet address (public key only)
- Set min confirmations (defaults: BTC/LTC/SOL = 1, EVM USDC = 12)
- Set payment intent TTL (default: 48 hours)

Settings stored in `PaymentSettings` singleton (id: `"site"`).

## Important Notes

### No Partial Credit
The system matches on **exact atomic amount**. If a customer sends 0.00123456 BTC but the expected amount is 0.00123457 BTC, the payment will NOT be detected. The unique suffix ensures each order has a unique amount.

### No Refunds On-Chain
If a customer overpays or sends to the wrong address, we cannot reverse it. The admin must manually reconcile by sending a refund from the deposit wallet.

### Exchange Warning
The modal warns customers: "Send from a personal wallet, not an exchange." Exchanges may not send the exact amount (they batch transactions).

### Invoice Expiry
Invoices expire after 48 hours (configurable). After expiry:
- Intent status → EXPIRED
- Order's `paymentIntentId` + `cryptoAsset` cleared
- Customer can create a new invoice

If a customer sends payment after expiry but before the watcher processes it, the payment will still be detected on the next cron run (the watcher checks all active intents, not just non-expired ones). This is a deliberate grace period.

### CoinGecko Rate Freshness
Rates are fetched at intent creation time. If crypto prices move significantly during the 48-hour invoice window, the USD value of the payment may differ from the order total. This is acceptable — the customer pays the crypto amount shown, not the USD amount.

### Database Constraints
- `PaymentIntent.orderId` is `@unique` — one active intent per order
- If a new intent is needed, the old one must be cancelled or expired first
