# 17 — GitHub & Vercel Access

## GitHub

### Repository
- **URL**: https://github.com/dustindog101/phased-research-group
- **Owner**: dustindog101 (Dustin)
- **Default branch**: `main`
- **Auto-deploy**: Pushes to `main` trigger Vercel deployment

### GitHub Token
- **Token**: Provided by user (stored in agent context, not in code)
- **Scopes**: `repo` (full repository access)
- **Usage**: For pushing code via git

### How to Push Code
```bash
# Set up remote with token (if not already done)
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/dustindog101/phased-research-group.git

# Normal git workflow
git add -A
git commit -m "descriptive commit message"
git push origin main
```

### Commit Message Convention
Use conventional commits format:
- `feat:` — New feature
- `fix:` — Bug fix
- `deploy:` — Deployment-related changes
- `docs:` — Documentation
- `refactor:` — Code refactoring
- `chore:` — Maintenance

Example:
```
feat: add product image system with optimization

- Build ProductImage component with Next.js Image
- Add image optimization script (sharp)
- Generate WebP images in 5 sizes (thumb, sm, md, lg, xl)
- Update ProductCard, ProductDetail, ProductList, Cart, Checkout
- Retatrutide image added for all 6 dosage variants
- Fallback to SVG vial when no image exists
```

### Important: Don't Commit Secrets
GitHub will reject pushes that contain secrets (API keys, tokens, passwords). The `.gitignore` file excludes:
- `.env*` (except `.env.example`)
- `db/custom.db` (SQLite database)
- `prisma/schema.dev.prisma` (dev schema)
- `scripts/vercel-secrets.env`
- `.vercel/` directory
- `download/` (screenshots)
- `reference/` (reference repos)
- `upload/` (uploaded files)

If a push is rejected with "repository rule violations", check for accidentally committed secrets.

## Vercel

### Project
- **Project ID**: `prj_X7M7OFrDepXpYkne5bwmgVBumXUT`
- **Team ID**: `team_6EU1Yo9MpMkU2FJHCFnLQgY2`
- **Team name**: dustin-hartles-projects
- **Production URL**: https://phased-research-group.vercel.app
- **Framework**: Next.js (auto-detected)

### Vercel Token
- **Token**: Provided by user (stored in agent context, not in code)
- **Usage**: For API calls to Vercel

### Common Vercel API Operations

#### Check deployment status
```bash
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=prj_X7M7OFrDepXpYkne5bwmgVBumXUT&teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2&limit=1&target=production" \
  | python3 -c "import json,sys; d=json.load(sys.stdin)['deployments'][0]; print(f'State: {d.get(\"state\")}')"
```

#### Trigger new deployment
```bash
curl -X POST "https://api.vercel.com/v13/deployments?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2&forceNewDeployment=true" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"phased-research-group","project":"prj_X7M7OFrDepXpYkne5bwmgVBumXUT","target":"production","gitSource":{"type":"github","org":"dustindog101","repo":"phased-research-group","ref":"main"}}'
```

#### Set environment variable
```bash
curl -X POST "https://api.vercel.com/v10/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEW_VAR","value":"xxx","type":"encrypted","target":["production","preview","development"]}'
```

#### Update environment variable
```bash
# Get env var ID first
ENV_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  | python3 -c "import json,sys; data=json.load(sys.stdin); [print(e['id']) for e in data.get('envs',[]) if e['key']=='VAR_NAME']")

# Update it
curl -X PATCH "https://api.vercel.com/v9/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env/$ENV_ID?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"new_value","type":"encrypted","target":["production","preview","development"]}'
```

#### List environment variables
```bash
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/prj_X7M7OFrDepXpYkne5bwmgVBumXUT/env?teamId=team_6EU1Yo9MpMkU2FJHCFnLQgY2" \
  | python3 -c "import json,sys; data=json.load(sys.stdin); [print(f'{e[\"key\"]}: target={e.get(\"target\",[])}') for e in data.get('envs',[])]"
```

### Vercel CLI (alternative to API)
```bash
# Install
npm install -g vercel

# Set env var
vercel env add NEW_VAR --token $VERCEL_TOKEN

# Pull env vars locally
vercel env pull .env.vercel --token $VERCEL_TOKEN

# Deploy manually
vercel --prod --token $VERCEL_TOKEN
```

### Neon Postgres (via Vercel integration)

#### Database details
- **Resource name**: `neon-bronze-prism`
- **Integration ID**: `icfg_0wVQS8Zu6WEYvxdToyLgB6Mb`
- **Connected to project**: Yes (production, preview, development)

#### Get connection string
The `DATABASE_URL` env var is auto-set by the Neon integration. To get the actual value:
```bash
# Pull env vars locally
vercel env pull .env.vercel --token $VERCEL_TOKEN

# Read the DATABASE_URL
grep DATABASE_URL .env.vercel
```

#### Push schema to production
```bash
# Get the connection string first (from Vercel env vars)
DATABASE_URL="postgresql://..." bun run db:push:prod
```

#### Seed production database
```bash
DATABASE_URL="postgresql://..." bun run db:seed:prod
```

### Resend (Email)

#### Account
- **API key**: `re_A7V8A9HT_8gwyL87mXnVpGo7ttsjDBbT4` (set on Vercel as `RESEND_API_KEY`)
- **From email**: `noreply@phasedresearchgroup.com` (set as `EMAIL_FROM`)
- **Domain status**: Not verified yet. Emails send from `onboarding@resend.dev` until verified.

#### Verify domain
1. Log into Resend dashboard
2. Add `phasedresearchgroup.com` domain
3. Add DNS records (SPF, DKIM, DMARC) to domain registrar
4. Wait for verification (usually minutes to hours)

## Deployment Workflow

### Standard flow (most common)
1. Make code changes locally
2. `bun run lint` — must pass with 0 errors
3. `git add -A && git commit -m "feat: description"`
4. `git push origin main`
5. Vercel auto-builds (~1-2 minutes)
6. Check deployment status via API
7. Verify production site with agent-browser

### If build fails on Vercel
1. Check build logs: `https://vercel.com/dustin-hartles-projects/phased-research-group`
2. Common issues:
   - ESLint errors (fix locally, re-push)
   - Prisma generate failed (check `postinstall` script)
   - Missing env vars (set on Vercel)
   - TypeScript errors (check `tsconfig.json`)
3. Fix locally, re-push

### If production is broken
1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production" (rollback)
4. Fix the issue locally
5. Re-push when ready

## Security Notes

- **Never commit tokens to git**. Use env vars or the agent's context.
- **Rotate tokens if leaked**. GitHub and Vercel tokens can be regenerated.
- **The admin password is in `.env`** (gitignored). Don't share it in chat.
- **Vercel env vars are encrypted** at rest. Safe to store secrets there.
