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

### Step 1: Get the Image
- Customer sends an image (PNG, WebP, JPG)
- Square or near-square works best (1:1 aspect ratio)
- Minimum 800×800px recommended (larger is fine, script will resize)

### Step 2: Optimize the Image
```bash
bun run scripts/optimize-product-image.ts <path-to-image> <product-slug>
```

Example:
```bash
bun run scripts/optimize-product-image.ts ~/Downloads/retatrutide.png prg-retatrutide-10mg
```

This generates 5 sizes in WebP format at `public/products/{slug}/`.

### Step 3: For Multiple Variants (Same Image)
If multiple products share the same image (e.g., different dosages of same peptide):
```bash
# Optimize for the first variant
bun run scripts/optimize-product-image.ts retatrutide.png prg-retatrutide-10mg

# Copy to other variants
cp -r public/products/prg-retatrutide-10mg public/products/prg-retatrutide-5mg
cp -r public/products/prg-retatrutide-10mg public/products/prg-retatrutide-15mg
# etc.
```

### Step 4: Commit and Push
```bash
git add public/products/
git commit -m "feat: add product images for retatrutide variants"
git push
```

The images auto-appear on:
- Shop page (product cards)
- Product detail page (main image)
- Product list page (table thumbnails)
- Cart page (item thumbnails)
- Checkout page (order summary thumbnails)
- Admin products page (preview)

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

## Image Optimization Details

### Why WebP?
- 25-35% smaller than PNG at equivalent quality
- Supported by all modern browsers (97%+)
- Better than JPEG for images with transparency

### Why Not AVIF?
We also generate AVIF files (in the script), but the `ProductImage` component currently only references WebP. To enable AVIF:
1. Update `ProductImage` to use `next/image` with `formats: ['image/avif', 'image/webp']`
2. Next.js will auto-negotiate the best format based on `Accept` header

### Why Multiple Sizes?
Responsive loading. A mobile user doesn't need to download the 1200px image. The `sizes` prop on `next/image` tells the browser which size to fetch based on viewport.

### Background Color
The optimization script pads images to square with `#f8fafc` background (matches `--prg-bg-alt`). This ensures consistent display in the square product card containers.

## Current Image Status

| Product | Has Image? | Notes |
|---|---|---|
| Retatrutide (all 6 dosages) | ✅ Yes | 5mg, 10mg, 15mg, 20mg, 30mg, 60mg |
| All other products | ❌ No | Using SVG vial placeholder |

The user will send images for other products. When received, run the optimization script + commit.

## Image Best Practices

1. **Square images**: 1:1 aspect ratio works best with our card layout
2. **White or light background**: Matches the card background
3. **Product centered**: The vial/product should be centered in the frame
4. **Minimum 800×800**: Smaller images will look pixelated on retina displays
5. **No text overlay**: Let the image be the product, not a marketing graphic
6. **Consistent lighting/style**: All product images should look like they belong to the same catalog
7. **File naming**: The script handles this — output is always `{size}.webp`

## Admin Image Upload (Not Yet Built)

Currently, images are added via the file system + optimization script. A future feature could let admins upload images directly in the product form, using Vercel Blob storage. See `07-FEATURES-PLANNED.md`.
