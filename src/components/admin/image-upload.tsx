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

// High-resolution Retina size targets (2x - 3x pixel density for tack-sharp displays)
const SIZES = [
  { name: "thumb", width: 160 },
  { name: "sm", width: 400 },
  { name: "md", width: 800 },
  { name: "lg", width: 1200 },
  { name: "xl", width: 1600 },
];

/** Convert base64 data URL to Blob directly without network */
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Fetch a remote image URL as a Blob.
 * Handles data: URLs directly, attempts direct fetch first, and falls back to /api/admin/proxy-image for CORS bypass.
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:")) {
    return dataURLtoBlob(url);
  }

  // First try direct fetch (works if remote server enables CORS)
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) return await res.blob();
  } catch {
    // Ignore CORS error and try server proxy
  }

  // Fallback to server proxy for CORS bypass
  const proxyUrl = `/api/admin/proxy-image?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load image from remote URL");
  }
  return await res.blob();
}

/**
 * Progressive step-down image resizing using HTML5 Canvas with high-quality Lanczos-style smoothing.
 * Halves resolution step-by-step to prevent single-step downscaling blur on high-res originals.
 */
async function resizeImage(source: File | Blob | string, targetWidth: number, sizeName: string): Promise<Blob> {
  const img = await loadImage(source);

  // Create canvas for multi-step progressive downsampling
  let currentCanvas = document.createElement("canvas");
  currentCanvas.width = img.width;
  currentCanvas.height = img.height;
  let currentCtx = currentCanvas.getContext("2d");
  if (!currentCtx) throw new Error("Canvas context failed");

  currentCtx.imageSmoothingEnabled = true;
  currentCtx.imageSmoothingQuality = "high";
  currentCtx.drawImage(img, 0, 0);

  // Step-down halving loop for smooth downsampling without aliasing
  const maxDim = Math.max(img.width, img.height);
  if (maxDim > targetWidth) {
    let curW = img.width;
    let curH = img.height;

    while (Math.max(curW, curH) / 2 >= targetWidth) {
      curW = Math.floor(curW / 2);
      curH = Math.floor(curH / 2);

      const nextCanvas = document.createElement("canvas");
      nextCanvas.width = curW;
      nextCanvas.height = curH;
      const nextCtx = nextCanvas.getContext("2d");
      if (!nextCtx) break;

      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = "high";
      nextCtx.drawImage(currentCanvas, 0, 0, currentCanvas.width, currentCanvas.height, 0, 0, curW, curH);

      currentCanvas = nextCanvas;
    }
  }

  // Final render into square target container, centered with preserved alpha
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetWidth;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) throw new Error("Final canvas failed");

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";

  const scale = Math.min(targetWidth / currentCanvas.width, targetWidth / currentCanvas.height);
  const drawWidth = currentCanvas.width * scale;
  const drawHeight = currentCanvas.height * scale;
  const x = (targetWidth - drawWidth) / 2;
  const y = (targetWidth - drawHeight) / 2;

  finalCtx.drawImage(currentCanvas, 0, 0, currentCanvas.width, currentCanvas.height, x, y, drawWidth, drawHeight);

  // PNG for large sizes (lossless), WebP 95% for smaller sizes
  const usePNG = sizeName === "lg" || sizeName === "xl" || sizeName === "md";
  const mimeType = usePNG ? "image/png" : "image/webp";
  const quality = usePNG ? undefined : 0.95;

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Blob creation failed"));
      },
      mimeType,
      quality
    );
  });
}

/** Load a File/Blob/URL into an HTMLImageElement */
function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const img = new Image();
    if (typeof source === "string" && !source.startsWith("data:")) {
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

  // Use high-resolution md/lg preview URL for crisp admin preview
  const previewUrl = blobImages?.lg ?? blobImages?.md ?? (currentImageKey === null ? `/products/${slug}/lg.webp` : null);

  /** Process and upload an image (from input, drop, paste, or cross-tab URL) */
  const processAndUpload = useCallback(
    async (source: File | Blob | string) => {
      setUploading(true);
      try {
        let imageBlob: Blob | File;

        if (typeof source === "string") {
          toast.info("Fetching remote image...");
          imageBlob = await fetchImageAsBlob(source);
        } else {
          imageBlob = source;
        }

        // Validate type/size if File or Blob
        if (imageBlob instanceof File || imageBlob instanceof Blob) {
          if (imageBlob.type && !imageBlob.type.startsWith("image/") && !imageBlob.type.includes("octet-stream")) {
            toast.error("Please select a valid image format (PNG, JPG, WebP, GIF)");
            return;
          }
          if (imageBlob.size > 15 * 1024 * 1024) {
            toast.error("Image must be under 15MB");
            return;
          }
        }

        toast.info("Optimizing high-resolution image...");
        const blobs: Record<string, Blob> = {};
        for (const size of SIZES) {
          const blob = await resizeImage(imageBlob, size.width, size.name);
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
        toast.success("High-resolution image uploaded successfully!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [productId, onImageChange]
  );

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

  /** Handle drop — supports desktop files, cross-tab images, URLs, and HTML img elements */
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

    // 2. Check for image items (Safari/Chrome/macOS app drags)
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

    // 3. Check for URL (image dragged from another tab / Google Images)
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:"))) {
      await processAndUpload(url);
      return;
    }

    // 4. Check for HTML (dragged image element with src attribute)
    const html = e.dataTransfer.getData("text/html");
    if (html) {
      const match = html.match(/<img[^>]+src="([^"]+)"/i);
      if (match && match[1]) {
        await processAndUpload(match[1]);
        return;
      }
    }

    toast.error("No valid image or URL found. Try dragging an image or file.");
  };

  /** Handle paste event (Cmd+V / Ctrl+V) */
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);

      // Check for image files in clipboard
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            await processAndUpload(file);
            return;
          }
        }
      }

      // Check for image URL text in clipboard
      const text = e.clipboardData?.getData("text/plain")?.trim();
      if (text && (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("data:image/"))) {
        await processAndUpload(text);
      }
    },
    [processAndUpload]
  );

  // Add paste listener (only when component is mounted)
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
        Drag &amp; drop, paste (Cmd+V), or click to upload. High-resolution Retina quality. Max 15MB.
      </p>
    </div>
  );
}
