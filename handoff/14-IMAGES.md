# 14 — Images

## How Product Images Work

### Convention
Product images are stored in `public/products/{slug}/` where `{slug}` is the product's slug field (e.g., `prg-retatrutide-10mg`).

### File Structure
```
public/products/
└── {slug}/
    ├── thumb.webp     # 80×80px   (1-2KB)   — table view, checkout cart
    ├── sm.webp        # 200×200px (5KB)     — product cards
    ├── md.webp        # 400×400px (16KB)    — product detail main image
    ├── lg.webp        # 800×800px (55KB)    — high-res detail
    └── xl.webp        # 1200×1200px (116KB) — retina / zoom
```

### Fallback
If no image exists for a product, the `ProductImage` component falls back to the procedural SVG vial (`VialSVG` / `VialThumb`) colored with the product's `capColor`.

## Adding a Product Image

### Option 1: Admin Panel Direct Drag & Drop (Recommended)
Admins can upload product images directly from `/admin/products/[productId]` via the `ImageUpload` component.

#### Supported Drag & Drop Sources:
1. **Desktop Files**: Drag PNG, JPG, WebP, GIF files from Finder/Explorer.
2. **Cross-Site / Google Images**: Drag images directly from external websites, Google Images, or other browser tabs.
3. **Base64 Data URLs**: Drag directly from Figma, Photoshop, or web tools.
4. **Clipboard Paste (`Cmd+V` / `Ctrl+V`)**: Copy an image or screenshot anywhere and paste it directly on the product edit page.

#### Cross-Site Proxy (`/api/admin/proxy-image`):
Because browsers block reading canvas data from cross-origin remote URLs (CORS security restriction), remote web image URLs are securely fetched server-to-server via `/api/admin/proxy-image?url=...`.
- Requires ADMIN authentication.
- Implements SSRF protections (blocks internal IP ranges & non-HTTP protocols).
- Enforces 10MB maximum download limit and 8-second request timeout.
- Serves responses with `Cache-Control: private, max-age=3600` to prevent redundant serverless function executions.

### Option 2: Local CLI Optimization Script
```bash
bun run scripts/optimize-product-image.ts <path-to-image> <product-slug>
```

Example:
```bash
bun run scripts/optimize-product-image.ts ~/Downloads/retatrutide.png prg-retatrutide-10mg
```

This generates 5 sizes in WebP/PNG format at `public/products/{slug}/`.

## Image Component

Use `ProductImage` from `@/components/store/product-image`:

```tsx
import { ProductImage } from "@/components/store/product-image";

<ProductImage
  slug={product.slug}
  capColor={product.capColor}
  alt={`${product.displayName} research peptide`}
  variant="card"  // "card" | "detail" | "thumb" | "table"
  priority={false}  // true for above-the-fold images (LCP optimization)
/>
```

### Variants
| Variant | Size | Used in |
|---|---|---|
| `card` | 200×200 | Shop page, featured products, related products |
| `detail` | 400×400 | Product detail page (main image) |
| `thumb` | 80×80 | Cart page, larger thumbnails |
| `table` | 40×40 | Product list table, checkout summary |

### Priority
Set `priority={true}` for images above the fold (e.g., product detail main image). This tells Next.js to preload them, improving LCP (Largest Contentful Paint).

## Current Image Status

| Product | Has Image? | Notes |
|---|---|---|
| Retatrutide (all 6 dosages) | ✅ Yes | 5mg, 10mg, 15mg, 20mg, 30mg, 60mg |
| All other products | ❌ No | Using SVG vial placeholder (Uploadable via Admin Panel) |
