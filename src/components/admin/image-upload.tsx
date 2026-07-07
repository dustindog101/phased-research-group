"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, ImageIcon } from "lucide-react";
import { VialSVG } from "@/components/store/VialSVG";

interface ImageUploadProps {
  productId: string;
  slug: string;
  capColor: string;
  imageKey: string | null;
  onImageChange?: (imageKey: string | null) => void;
}

export function ImageUpload({ productId, slug, capColor, imageKey, onImageChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  // Check if static image exists (we can't check at runtime easily, so show preview based on imageKey)
  const hasStaticImage = !currentImageKey; // If no blob image, static may exist
  const previewUrl = blobImages?.md ?? (hasStaticImage ? `/products/${slug}/md.webp` : null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setCurrentImageKey(data.imageKey || `blob:${JSON.stringify(data.images)}`);
      onImageChange?.(data.imageKey || `blob:${JSON.stringify(data.images)}`);
      toast.success("Image uploaded and optimized");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      <h3 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Product Image
      </h3>

      {/* Preview */}
      <div className="aspect-square flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-[var(--prg-radius)] p-6 mb-4 relative overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Product preview"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // If static image fails to load, show SVG vial
              e.currentTarget.style.display = "none";
              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = "block";
            }}
          />
        ) : null}
        <div style={{ display: previewUrl ? "none" : "block" }}>
          <VialSVG capColor={capColor} size={120} />
        </div>

        {(uploading || deleting) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[var(--prg-accent)]" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="product-image-upload"
        />
        <label
          htmlFor="product-image-upload"
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
        </label>

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

      <p className="text-[10px] text-[var(--prg-text-muted)] mt-3 leading-relaxed">
        Image is automatically optimized to 5 sizes (80px to 1200px) in WebP format.
        Square images work best. Max 10MB.
      </p>
    </div>
  );
}
