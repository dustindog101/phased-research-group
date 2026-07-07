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
 * Resize an image to a specific size using Canvas, return as WebP Blob.
 * Preserves transparency (no background fill) so PNGs with alpha look clean.
 */
async function resizeImage(file: File | Blob, width: number): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Don't fill background — preserve transparency
  // The product card already has a light gradient background that will show through

  // Draw image scaled to fit (contain), centered
  const scale = Math.min(width / img.width, width / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (width - drawHeight) / 2;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);

  // Convert to WebP with alpha
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/webp",
      0.9 // higher quality for cleaner output
    );
  });
}

/** Load a File/Blob into an HTMLImageElement */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
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

  /** Process and upload an image file (from input, drop, or paste) */
  const processAndUpload = useCallback(async (file: File | Blob) => {
    // Validate type if it's a File
    if (file instanceof File) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a PNG, JPG, WebP, or GIF image");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }
    }

    setUploading(true);
    try {
      toast.info("Optimizing image...");
      const blobs: Record<string, Blob> = {};
      for (const size of SIZES) {
        blobs[size.name] = await resizeImage(file, size.width);
      }

      const formData = new FormData();
      for (const [name, blob] of Object.entries(blobs)) {
        formData.append(name, blob, `${name}.webp`);
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

  /** Handle drop */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    const file = files[0];
    await processAndUpload(file);
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
