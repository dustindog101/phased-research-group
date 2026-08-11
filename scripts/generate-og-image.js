import sharp from "sharp";
import fs from "fs";
import path from "path";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradients -->
    <radialGradient id="glowTopRight" cx="85%" cy="15%" r="65%">
      <stop offset="0%" stop-color="#0284C7" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#0F172A" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottomLeft" cx="15%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#0D9488" stop-opacity="0.30" />
      <stop offset="60%" stop-color="#0F172A" stop-opacity="0" />
    </radialGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.75" />
    </linearGradient>

    <!-- Card Border Gradient -->
    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#94A3B8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#2DD4BF" stop-opacity="0.3" />
    </linearGradient>

    <!-- Logo Gradient -->
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0D9488" />
    </linearGradient>

    <!-- Text Gradient -->
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>

    <!-- Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" stroke-opacity="0.25" />
    </pattern>
  </defs>

  <!-- Base Dark Canvas -->
  <rect width="1200" height="630" fill="#070A11" />

  <!-- Grid Overlay -->
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Ambient Glows -->
  <rect width="1200" height="630" fill="url(#glowTopRight)" />
  <rect width="1200" height="630" fill="url(#glowBottomLeft)" />

  <!-- Main Container Glassmorphic Card -->
  <rect x="60" y="55" width="1080" height="520" rx="24" fill="url(#cardBg)" stroke="url(#cardBorder)" stroke-width="1.5" />

  <!-- TOP BRANDING ROW -->
  <g transform="translate(110, 100)">
    <!-- Logo Box -->
    <rect width="72" height="72" rx="18" fill="url(#logoGrad)" />
    <!-- PR Logo Icon graphics inside box -->
    <g transform="translate(18, 18) scale(1.2)">
      <path fill="#FFFFFF" opacity="0.9" d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z"/>
      <polygon fill="#FFFFFF" points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1"/>
      <path fill="#FFFFFF" opacity="0.9" d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z"/>
    </g>

    <!-- Brand Name Text -->
    <text x="96" y="40" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#FFFFFF" letter-spacing="2.5">PHASE RESEARCH</text>
    <text x="96" y="62" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="14" fill="#94A3B8" letter-spacing="6">G R O U P</text>
  </g>

  <!-- Top-Right Status Badge -->
  <g transform="translate(815, 115)">
    <rect width="275" height="42" rx="21" fill="#0F172A" stroke="#0284C7" stroke-width="1" stroke-opacity="0.5" />
    <circle cx="26" cy="21" r="5" fill="#10B981" />
    <text x="42" y="26" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="13" fill="#38BDF8" letter-spacing="1.5">3RD-PARTY LAB TESTED</text>
  </g>

  <!-- HERO CONTENT SECTION -->
  <g transform="translate(110, 245)">
    <!-- Subtitle Tag -->
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16" fill="#2DD4BF" letter-spacing="3">LABORATORY RESEARCH SUPPLIES</text>
    
    <!-- Main Headline -->
    <text x="0" y="52" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="48" fill="url(#textGrad)" letter-spacing="-0.5">Premium Research Peptides</text>
    
    <!-- Mobile Description Body -->
    <text x="0" y="102" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="22" fill="#94A3B8" width="900">
      High-purity peptides for qualified research. 3rd-party lab verified
    </text>
    <text x="0" y="132" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="22" fill="#94A3B8">
      with Certificates of Analysis (COA) for every batch.
    </text>
  </g>

  <!-- FEATURE BADGES ROW -->
  <g transform="translate(110, 435)">
    <!-- Badge 1 -->
    <g>
      <rect width="210" height="38" rx="10" fill="#0F766E" fill-opacity="0.3" stroke="#0D9488" stroke-width="1" />
      <text x="20" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="14" fill="#2DD4BF">✓ 99%+ Purity Verified</text>
    </g>
    <!-- Badge 2 -->
    <g transform="translate(225, 0)">
      <rect width="210" height="38" rx="10" fill="#1E293B" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
      <text x="20" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="14" fill="#E2E8F0">✓ COA Batch Included</text>
    </g>
    <!-- Badge 3 -->
    <g transform="translate(450, 0)">
      <rect width="240" height="38" rx="10" fill="#1E293B" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
      <text x="20" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="14" fill="#E2E8F0">✓ Fast Secure Fulfillment</text>
    </g>
  </g>

  <!-- FOOTER DOMAIN BAR -->
  <g transform="translate(110, 520)">
    <line x1="0" y1="0" x2="980" y2="0" stroke="#334155" stroke-width="1" stroke-opacity="0.5" />
    <text x="0" y="30" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#38BDF8" letter-spacing="1">phaseresearch.org</text>
    <text x="200" y="30" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="16" fill="#64748B">•  dev.phaseresearch.org</text>
    <text x="980" y="30" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="14" fill="#64748B">Lawful Laboratory Use Only</text>
  </g>
</svg>
`;

async function generate() {
  const outputPath = path.join(process.cwd(), "public", "og-image.png");
  await sharp(Buffer.from(svg))
    .png({ quality: 100 })
    .toFile(outputPath);
  console.log("Successfully generated:", outputPath);
}

generate().catch(console.error);
