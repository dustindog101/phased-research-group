# 09 — Environment Variables

All env vars are configured on Vercel (production + preview + development). Local dev uses `.env` (gitignored).

## Required (already set)

### `DATABASE_URL`
- **Purpose**: Neon Postgres connection string
- **Set by**: Vercel Neon integration (auto-configured)
- **Example**: `postgresql://neondb_owner:npg_xxx@ep-tiny-scene-atahkm2n-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`
- **Local dev**: `file:./db/custom.db` (SQLite)

### `AUTH_SECRET`
- **Purpose**: NextAuth JWT signing secret
- **Generated with**: `openssl rand -base64 32`
- **Set on**: Vercel (encrypted)

### `PAY_TOKEN_SECRET`
- **Purpose**: HMAC token signing for guest crypto invoice access
- **Generated with**: `openssl rand -hex 32`
- **Set on**: Vercel (encrypted)

### `CRYPTO_PAYMENTS_ENABLED`
- **Purpose**: Feature flag for crypto payment gateway
- **Value**: `true`
- **Set on**: Vercel (plain)

### `ADMIN_EMAIL`
- **Purpose**: Default admin email for seed script
- **Value**: `admin@phasedresearchgroup.com`
- **Set on**: Vercel (plain)

### `ADMIN_PASSWORD`
- **Purpose**: Default admin password for seed script
- **Warning**: Change immediately after first login!
- **Set on**: Vercel (encrypted)

### `RESEND_API_KEY`
- **Purpose**: Send transactional emails
- **Value**: `re_A7V8A9HT_8gwyL87mXnVpGo7ttsjDBbT4`
- **Set on**: Vercel (encrypted)

### `EMAIL_FROM`
- **Purpose**: From address for outgoing emails
- **Value**: `Phased Research Group <noreply@phasedresearchgroup.com>`
- **Note**: Domain not verified yet. Resend sends from `onboarding@resend.dev` until verified.
- **Set on**: Vercel (plain)

### `CRON_SECRET`
- **Purpose**: Protects `/api/cron/*` endpoints from unauthorized access
- **Set on**: Vercel (production only, encrypted)

## Needed (not yet set)

### `ETHERSCAN_API_KEY`
- **Purpose**: Etherscan V2 API for USDC payment detection (Ethereum + Polygon)
- **Get from**: https://etherscan.io/register (free, 5 req/s)
- **Set on**: Vercel (encrypted)
- **Without this**: USDC on ETH/Polygon won't be detected. USDC on Base still works (uses Blockscout).

### `HELIUS_API_KEY`
- **Purpose**: Solana RPC for SOL + USDC (Solana) payment detection
- **Get from**: https://helius.dev (free, 100k req/mo)
- **Set on**: Vercel (encrypted)
- **Without this**: Falls back to public Solana RPC (rate-limited, may miss payments)

## Optional (not set)

### `COINGECKO_API_KEY`
- **Purpose**: Higher rate limits for CoinGecko price API
- **Get from**: https://www.coingecko.com/api/pricing (free demo plan)
- **Without this**: 30 req/min limit (sufficient for current volume)

### `BLOB_READ_WRITE_TOKEN`
- **Purpose**: Vercel Blob for product image uploads
- **Get from**: Vercel dashboard → Storage → Blob
- **Without this**: Admin can't upload images via UI. Images must be added via file system + optimization script.

### `SOLANA_RPC_URL`
- **Purpose**: Custom Solana RPC endpoint (alternative to Helius)
- **Without this**: Uses public RPC or Helius (if key set)

## How to Set Env Vars

### Via Vercel API (preferred for agents)
```bash
curl -X POST "https://api.vercel.com/v10/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEW_VAR","value":"xxx","type":"encrypted","target":["production","preview","development"]}'
```

### Via Vercel CLI
```bash
vercel env add NEW_VAR
```

### Via Vercel Dashboard
Settings → Environment Variables → Add New

## How to Update an Existing Env Var

```bash
# Get the env var ID
ENV_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  | python3 -c "import json,sys; data=json.load(sys.stdin); [print(e['id']) for e in data.get('envs',[]) if e['key']=='VAR_NAME']")

# Update it
curl -X PATCH "https://api.vercel.com/v9/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env/$ENV_ID?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"new_value","type":"encrypted","target":["production","preview","development"]}'
```

## Local Development

For local dev, create a `.env` file (gitignored):
```bash
cp .env.example .env
# Edit .env with your local values
```

Local dev uses SQLite, so `DATABASE_URL` should be:
```
DATABASE_URL=file:./db/custom.db
```

The Prisma dev schema (`prisma/schema.dev.prisma`, gitignored) uses SQLite. The production schema (`prisma/schema.prisma`) uses PostgreSQL.

**Important**: After changing env vars locally, run:
```bash
bun run db:push    # Recreate SQLite schema
bun run db:seed    # Reseed data
```
