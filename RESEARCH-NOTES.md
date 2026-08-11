# Research Notes: Open Graph & Mobile Preview Optimization for Phase Research

## Researched Topic
Modern Open Graph (OG) cards and mobile link previews (iMessage, SMS, WhatsApp, Telegram, Twitter/X, Slack, LinkedIn) for high-end biotech/research e-commerce sites (`phaseresearch.org` & `dev.phaseresearch.org`).

## Source & Context
- **iMessage / Apple Messages Web Preview Guidelines**: 1.91:1 aspect ratio (1200×630px). High contrast dark background (`#0A0D14` / `#0F172A`) with bright accent typography and high-res vector logo prevents text clipping and blurriness on retina mobile screens.
- **Next.js 16 Metadata API**: Dynamic `metadataBase` configuration prevents host mismatches between staging (`dev.phaseresearch.org`) and production (`phaseresearch.org`).
- **Dual-Layer OG Strategy**: Combining static `public/og-image.png` (for instant SMS crawler caching) and dynamic `src/app/opengraph-image.tsx` via `next/og` (`ImageResponse`) for modern edge-rendered previews.

## Common Link Preview Patterns Evaluated
1. **Plain Logo on Solid Background**: Clean but lacks context in text message previews.
2. **Text-Heavy Layout**: Hard to read in small iMessage cards.
3. **Sleek Biotech/Lab Glassmorphism Card (Adopted)**:
   - High-contrast dark slate (`#0B0F19`) canvas.
   - Radial cyan/teal glowing ambient orb in top-right background.
   - Glassmorphic card overlay with subtle border (`rgba(255, 255, 255, 0.1)`).
   - Prominent Phase Research Logo (gradient PR mark + crisp typography).
   - Value Pillars Badge: "PREMIUM RESEARCH PEPTIDES • 3RD-PARTY LAB TESTED • COA VERIFIED".
   - Sub-badge: "For Laboratory Research Use Only".

## Strategy & Implementation Details
- Dynamic host resolution for `dev.phaseresearch.org` vs `phaseresearch.org`.
- Complete meta tags: `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `og:type`, `og:site_name`, `twitter:card: summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- Dual branch deployment (`dev` and `main`).
