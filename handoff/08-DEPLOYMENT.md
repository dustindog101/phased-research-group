# 08 — Deployment

## Current Setup

- **Platform**: Vercel Hobby (free tier)
- **Project ID**: `prj_X7M7OFrDepXpYkne5bwmgVBumXUT`
- **Team ID**: `team_6EU1Yo9MpMkU2FJHCFnLQgY2`
- **Auto-deploy**: On push to `main` branch on GitHub
- **Production URL**: https://phased-research-group.vercel.app
- **GitHub**: https://github.com/dustindog101/phased-research-group

## How to Deploy

### Automatic (preferred)
1. Push to `main` branch on GitHub
2. Vercel auto-builds and deploys
3. Production URL updates within ~2 minutes
4. Check status: https://vercel.com/dustin-hartles-projects/phased-research-group

### Manual (via API)
```bash
curl -X POST "https://api.vercel.com/v13/deployments?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2&forceNewDeployment=true" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"phased-research-group","project":"prj_X7M7OFrDepXpYkne5bwmgVBumXUT","target":"production","gitSource":{"type":"github","org":"dustindog101","repo":"phased-research-group","ref":"main"}}'
```

## Build Configuration

- **Framework**: Next.js (auto-detected)
- **Build command**: `next build` (in package.json)
- **Install command**: `bun install` (auto-detected)
- **Output**: Default (`.next/`)
- **Node version**: 20.x (Vercel default)

**Important**: The `build` script in package.json is just `next build`. Do NOT add `cp` commands (they were there before and broke Vercel builds — see `15-KNOWN-ISSUES.md`).

## Cron Jobs

Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/payment-watcher",
      "schedule": "0 9 * * *"
    }
  ]
}
```

- **Schedule**: Daily at 9 AM UTC (2 AM PST, 3 AM PDT)
- **Purpose**: Expires stale payment intents, reconciles missed payments
- **Auth**: Protected by `CRON_SECRET` env var (if set)
- **Vercel free tier**: 2 cron jobs allowed, minimum 1/day frequency

## Database (Neon Postgres)

- **Provider**: Neon (via Vercel marketplace integration)
- **Resource name**: `neon-bronze-prism`
- **Region**: US East 1 (sfo1 compute, but pooled connection)
- **Free tier**: 0.5GB storage, 1 always-on branch, 100 branches
- **Connection**: Pooled via `?channel_binding=require&sslmode=require`

### To push schema to production:
```bash
# Set DATABASE_URL to Neon connection string (from Vercel env vars)
DATABASE_URL="postgresql://..." bun run db:push:prod
```

### To seed production:
```bash
DATABASE_URL="postgresql://..." bun run db:seed:prod
```

**Warning**: `db:seed:prod` will create a default admin user with password `admin12345`. Change this immediately after first login.

## Environment Variables

All env vars are set on Vercel (production + preview + development). See `09-ENVIRONMENT-VARIABLES.md` for the full list.

To set a new env var via API:
```bash
curl -X POST "https://api.vercel.com/v10/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEW_VAR","value":"xxx","type":"encrypted","target":["production","preview","development"]}'
```

## Custom Domain Setup

1. Buy domain (e.g., from Namecheap, Cloudflare, Google Domains)
2. In Vercel dashboard: Settings → Domains → Add
3. Add DNS records Vercel provides:
   - A record pointing to `76.76.21.21` (or CNAME to `cname.vercel-dns.com`)
   - (Optional) CNAME for `www` subdomain
4. Wait for DNS propagation (5 min to 24 hours)
5. Vercel auto-provisions SSL certificate
6. Update `EMAIL_FROM` env var to use new domain
7. Update Resend domain verification for email deliverability

## Rollback

To rollback to a previous deployment:
1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

Or via API:
```bash
curl -X POST "https://api.vercel.com/v13/deployments/{deployment_id}/promote?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

## Monitoring

- **Vercel dashboard**: Build logs, runtime logs, analytics
- **Neon dashboard**: Database queries, storage, connections
- **Resend dashboard**: Email delivery stats, bounce rates
- **Application**: `EmailLog` table tracks all sent emails

## Free Tier Limits

| Service | Limit | Current Usage | Status |
|---|---|---|---|
| Vercel bandwidth | 100 GB/mo | < 1 GB | ✅ Fine |
| Vercel serverless | 100 GB-hrs/mo | < 1 GB-hr | ✅ Fine |
| Vercel cron jobs | 2 jobs, 1/day min | 1 job | ✅ Fine |
| Neon storage | 0.5 GB | ~5 MB | ✅ Fine |
| Neon compute | Always-on 1 branch | 1 branch | ✅ Fine |
| Resend emails | 3,000/mo, 100/day | < 10 sent | ✅ Fine |

## Deployment Checklist (for new agents)

Before deploying:
- [ ] `bun run lint` passes with 0 errors
- [ ] `bun run build` succeeds locally
- [ ] No console.log in production code (except error logging)
- [ ] No secrets in committed code
- [ ] `.env.example` updated if new env vars added
- [ ] Prisma schema changes pushed to production (`db:push:prod`)
- [ ] Database seeded if new seed data (`db:seed:prod`)

After deploying:
- [ ] Visit production URL, verify home page loads
- [ ] Test login flow
- [ ] Test admin dashboard
- [ ] Check Vercel function logs for errors
- [ ] Run agent-browser verification on key flows
