# Phased Research Group — Work Log

Shared multi-agent work log. Append-only. Each new section starts with `---`.

---
Task ID: 0
Agent: main
Task: Project initialization and planning

Work Log:
- Explored phased-research-group (static HTML storefront, 75 peptide products, no backend)
- Explored nextjs-boilerplate (Next.js 16 + crypto payment gateway, frontend portable, backend in gitignored Python Lambdas)
- Read all 15 uploaded Python Lambda files (handlers, watcher, chain adapters, pricing, settings, validation)
- Initialized Next.js 16 project via fullstack-dev skill
- Installed: next-auth v5 beta, @auth/prisma-adapter, bcryptjs, qrcode.react, recharts, exceljs, date-fns, resend, @vercel/blob, @types/bcryptjs

Stage Summary:
- Tech stack confirmed: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + Prisma + Neon Postgres + NextAuth + Resend + Vercel Blob
- Crypto gateway strategy: port Python Lambda logic to TypeScript API routes (no AWS, no DynamoDB)
- Watcher strategy: Vercel Cron (daily) + client-side polling for real-time modal UX
- Original site has 75 products across 6 categories (metabolic, healing, hormone, longevity, neuro, other)
- Design tokens: navy #1e3a5f + teal #0d9488, Inter + Oswald fonts, SVG vial illustrations
