# Phased Research Group — Project Handoff

This folder contains everything a new AI agent or developer needs to pick up where the last session left off. Read these files in order.

## File Index

| File | What's in it | Read when |
|---|---|---|
| `01-PROJECT-OVERVIEW.md` | What the site is, who it's for, current status | First — always |
| `02-TECH-STACK.md` | Every technology, version, and why it was chosen | Before making architectural decisions |
| `03-ARCHITECTURE.md` | How the app is structured, request flow, data flow | Before touching code |
| `04-DATABASE-SCHEMA.md` | Every Prisma model, field, and relationship | Before touching the database |
| `05-API-ROUTES.md` | Every API endpoint, params, auth, response shape | Before building API features |
| `06-FEATURES-CURRENT.md` | What's built and working right now | Before planning new work |
| `07-FEATURES-PLANNED.md` | What the user wants next, in priority order | Before starting new work |
| `08-DEPLOYMENT.md` | How to deploy, env vars, cron jobs, domains | Before deploying |
| `09-ENVIRONMENT-VARIABLES.md` | Every env var, where to get it, what it does | Before deploying |
| `10-SECURITY.md` | Security measures, rate limits, CSP, known gaps | Before security work |
| `11-CRYPTO-PAYMENT-GATEWAY.md` | How the self-hosted crypto payment system works | Before touching payments |
| `12-ADMIN-GUIDE.md` | How to use the admin dashboard | For the site owner |
| `13-COPYWRITING-GUIDE.md` | Voice, tone, what to avoid (AI-sounding text) | Before writing any copy |
| `14-IMAGES.md` | How product images work, how to add new ones | Before adding product images |
| `15-KNOWN-ISSUES.md` | Bugs, limitations, tech debt | Before reporting issues |
| `16-RESEARCH-COMPETITORS.md` | Competitor analysis, Reddit findings | Before marketing/copy work |
| `17-GITHUB-VERCEL-ACCESS.md` | How to push code, trigger deploys, manage env | For deployment access |

## Quick Start for a New Agent

1. Read `01-PROJECT-OVERVIEW.md` and `06-FEATURES-CURRENT.md` to understand where things stand
2. Read `07-FEATURES-PLANNED.md` to see what the user wants next
3. Read `02-TECH-STACK.md` and `03-ARCHITECTURE.md` before touching code
4. Check `15-KNOWN-ISSUES.md` for known gotchas
5. Check `09-ENVIRONMENT-VARIABLES.md` for what keys are configured

## User Preferences (Important)

- **Communication style**: Direct, no fluff. The user is technical and wants results, not explanations.
- **Code style**: "Smart" code. No copy-paste from old projects. Clean, modern, secure.
- **Design**: Clinical lab-research aesthetic. Navy (#1e3a5f) + teal (#0d9488). Inter + Oswald fonts.
- **Copy**: Human, not AI-sounding. No em dashes. No "delve into" or "in today's world." See `13-COPYWRITING-GUIDE.md`.
- **Cost**: Free tiers only. Vercel Hobby, Neon free, Resend free. No paid services.
- **Payments**: Crypto only (self-hosted, no third-party processor). This is non-negotiable.
- **Privacy**: Strong security headers, rate limiting, minimal data collection.

## Current Status (as of last session)

- **Live URL**: https://phased-research-group.vercel.app
- **GitHub**: https://github.com/dustindog101/phased-research-group
- **Status**: Production-ready, deployed, accepting orders
- **Database**: Neon Postgres, seeded with 69 products, 2 coupons, admin user
- **Payments**: Crypto gateway built, needs wallet addresses configured in admin
- **Email**: Resend configured, sending order/payment/shipping emails
- **Last commit**: Retatrutide product images added, image optimization system built

## What Needs Doing Next

See `07-FEATURES-PLANNED.md` for the full list. Top priorities:
1. Configure crypto wallet addresses in admin (needed before going live with real payments)
2. Get Etherscan + Helius API keys (needed for USDC/SOL payment detection)
3. Add product images for remaining products (user will provide images)
4. Set up a custom domain (optional but recommended)
