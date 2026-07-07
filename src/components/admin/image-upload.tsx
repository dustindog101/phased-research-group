"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, ExternalLink, ImagePlus } from "lucide-react";
import { VialSVG } from "@/components/store/VialSVG";
import Link from "next/link";

interface ImageUploadProps {
  productId: string;
  slug: string;
  capColor: string;
  imageKey: string | null;
  onImageChange?: (imageKey: string | null) => void;
}

const SIZES = [
  { name: "thumb", width: 80 },
  { name: "sm", width: 200 },
  { name: "md", width: 400 },
  { name: "lg", width: 800 },
  { name: "xl", width: 1200 },
];

/**
 * Resize an image to a specific size using Canvas, return as Blob.
 * Uses PNG for large sizes (lossless, crisp text) and WebP for thumbnails (smaller).
 * Preserves transparency (no background fill) so PNGs with alpha look clean.
 */
async function resizeImage(source: File | Blob | string, width: number, sizeName: string): Promise<Blob> {
  const img = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Don't fill background — preserve transparency

  // Draw image scaled to fit (contain), centered
  const scale = Math.min(width / img.width, width / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (width - drawHeight) / 2;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);

  // Use PNG (lossless) for large sizes to keep text crisp, WebP for thumbnails
  const useLossless = sizeName === "lg" || sizeName === "xl" || sizeName === "md";
  const mimeType = useLossless ? "image/png" : "image/webp";
  const quality = useLossless ? undefined : 0.95;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      mimeType,
      quality
    );
  });
}

/** Load a File/Blob/URL into an HTMLImageElement (with CORS for cross-origin URLs) */
function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const img = new Image();
    // Set crossOrigin for URLs (allows canvas to read cross-origin images without tainting)
    if (typeof source === "string") {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/** Fetch an image URL and convert to a Blob (for cross-tab drops) */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("Failed to fetch image");
  return res.blob();
}

export function ImageUpload({ productId, slug, capColor, imageKey, onImageChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [currentImageKey, setCurrentImageKey] = useState(imageKey);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse blob images for preview
  const blobImages = currentImageKey?.startsWith("blob:")
    ? (() => {
        try {
          return JSON.parse(currentImageKey.replace("blob:", ""));
        } catch {
          return null;
        }
      })()
    : null;

  const previewUrl = blobImages?.md ?? (currentImageKey === null ? `/products/${slug}/md.webp` : null);

  /** Process and upload an image (from input, drop, paste, or cross-tab URL) */
  const processAndUpload = useCallback(async (source: File | Blob | string) => {
    // Validate type/size if it's a File
    if (source instanceof File) {
      if (!source.type.startsWith("image/")) {
        toast.error("Please select a PNG, JPG, WebP, or GIF image");
        return;
      }
      if (source.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }
    }

    setUploading(true);
    try {
      toast.info("Optimizing image...");
      const blobs: Record<string, Blob> = {};
      for (const size of SIZES) {
        const blob = await resizeImage(source, size.width, size.name);
        blobs[size.name] = blob;
      }

      const formData = new FormData();
      for (const [name, blob] of Object.entries(blobs)) {
        const ext = blob.type === "image/png" ? "png" : "webp";
        formData.append(name, blob, `${name}.${ext}`);
      }

      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newImageKey = `blob:${JSON.stringify(data.images)}`;
      setCurrentImageKey(newImageKey);
      onImageChange?.(newImageKey);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [productId, onImageChange]);

  /** Handle file input change */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Handle drag over */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  /** Handle drag leave */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  /** Handle drop — supports files from desktop AND images/URLs from other browser tabs */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    // 1. Check for dropped files (from desktop/file explorer)
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processAndUpload(files[0]);
      return;
    }

    // 2. Check for image dragged from another browser tab (Safari/Chrome)
    // The image data may be in items as a file
    const items = Array.from(e.dataTransfer.items || []);
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          await processAndUpload(file);
          return;
        }
      }
    }

    // 3. Check for URL (image dragged from another tab as a link)
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      try {
        // Try to fetch the image directly
        await processAndUpload(url);
      } catch {
        toast.error("Couldn't load that image. Try saving it first, then upload the file.");
      }
      return;
    }

    // 4. Check for HTML (dragged image element with src)
    const html = e.dataTransfer.getData("text/html");
    if (html) {
      const match = html.match(/<img[^>]+src="([^"]+)"/);
      if (match && match[1]) {
        try {
          await processAndUpload(match[1]);
        } catch {
          toast.error("Couldn't load that image. Try saving it first, then upload the file.");
        }
        return;
      }
    }

    toast.error("No image found. Try dragging an image file instead.");
  };

  /** Handle paste */
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          await processAndUpload(file);
          break;
        }
      }
    }
  }, [processAndUpload]);

  // Add paste listener (only when this component is mounted)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleDelete = async () => {
    if (!confirm("Remove this product image? Will revert to SVG vial placeholder.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/image`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setCurrentImageKey(null);
      onImageChange?.(null);
      toast.success("Image removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px]" style={{ fontFamily: "var(--font-display)" }}>
          Product Image
        </h3>
        {/* View product button */}
        <Link
          href={`/products/${slug}`}
          target="_blank"
          className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[1px] text-[var(--prg-accent)] hover:underline"
        >
          View Product <ExternalLink size={10} />
        </Link>
      </div>

      {/* Drop zone + preview */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`aspect-square rounded-[var(--prg-radius)] mb-4 relative overflow-hidden cursor-pointer transition-all ${
          dragging
            ? "border-2 border-[var(--prg-accent)] bg-[rgba(30,58,95,0.05)]"
            : "border-2 border-dashed border-[var(--prg-border)] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] hover:border-[var(--prg-accent)]"
        }`}
      >
        {/* Checkerboard pattern for transparency visibility */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #000 25%, transparent 25%),
              linear-gradient(-45deg, #000 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #000 75%),
              linear-gradient(-45deg, transparent 75%, #000 75%)
            `,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          }}
        />

        {/* Preview image or SVG fallback */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {previewUrl && !dragging ? (
            <img
              src={previewUrl}
              alt="Product preview"
              className="max-w-full max-h-full object-contain relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = "block";
              }}
            />
          ) : null}
          {(!previewUrl || dragging) && (
            <div className="text-center relative z-10" style={{ display: previewUrl && !dragging ? "none" : "block" }}>
              {dragging ? (
                <>
                  <ImagePlus size={32} className="mx-auto mb-2 text-[var(--prg-accent)]" />
                  <p className="text-xs font-medium text-[var(--prg-accent)]">Drop image here</p>
                </>
              ) : (
                <VialSVG capColor={capColor} size={120} />
              )}
            </div>
          )}
        </div>

        {/* Upload overlay on hover (when image exists) */}
        {previewUrl && !dragging && !uploading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="text-center text-white">
              <Upload size={24} className="mx-auto mb-1" />
              <p className="text-xs font-medium">Click or drop to replace</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {(uploading || deleting) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="text-center">
              <Loader2 size={24} className="animate-spin text-[var(--prg-accent)] mx-auto mb-2" />
              <p className="text-xs text-[var(--prg-text-muted)]">
                {uploading ? "Processing..." : "Deleting..."}
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--prg-accent)] text-white text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] cursor-pointer transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload size={14} /> {currentImageKey ? "Replace Image" : "Upload Image"}
            </>
          )}
        </button>

        {currentImageKey && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-[var(--prg-border)] text-[var(--prg-text-muted)] text-xs font-medium uppercase tracking-[1.5px] rounded-[var(--prg-radius)] hover:border-[var(--prg-danger)] hover:text-[var(--prg-danger)] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Remove Image
          </button>
        )}
      </div>

      <p className="text-[10px] text-[var(--prg-text-muted)] mt-3 leading-relaxed text-center">
        Drag &amp; drop, paste, or click to upload. PNG, JPG, WebP, GIF. Transparent backgrounds preserved. Max 10MB.
      </p>
    </div>
  );
}
