/**
 * Phased Research Group — Site-wide constants
 * Ported from the original static site's js/app.js
 */

// ============ SHIPPING ============
export const FREE_SHIPPING_THRESHOLD = 175; // USD
export const SHIPPING_GROUND = 10.75;
export const SHIPPING_EXPRESS = 22.95;

export function getShippingCost(subtotal: number, method: "ground" | "express" = "ground"): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return method === "express" ? SHIPPING_EXPRESS : SHIPPING_GROUND;
}

// ============ PRODUCT DESCRIPTION ============
export const DEFAULT_PRODUCT_DESCRIPTION =
  "This material is supplied exclusively for lawful laboratory research use by qualified personnel.";

// ============ PRODUCT CATEGORIES ============
export const CATEGORIES = [
  { id: "metabolic", label: "Metabolic & GLP Agonists" },
  { id: "healing", label: "Healing & Recovery" },
  { id: "hormone", label: "Hormone & Endocrine" },
  { id: "neuro", label: "Neuro & Cognitive" },
  { id: "longevity", label: "Longevity & Anti-Aging" },
  { id: "other", label: "Other Research Peptides" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

// ============ US STATES (limited set from original site) ============
export const US_STATES = [
  "TX", "CA", "FL", "NY", "AZ", "CO", "GA", "IL", "NC", "OH", "PA", "WA",
] as const;

// ============ ORDER NUMBER GENERATION ============
export function generateOrderNumber(): string {
  return "PRG-" + Date.now().toString(36).toUpperCase().slice(-8);
}

// ============ CURRENCY FORMATTING ============
export function formatPrice(n: number): string {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ============ SITE METADATA ============
export const SITE = {
  name: "Phased Research Group",
  shortName: "PRG",
  tagline: "Premium Research Peptides — Laboratory Grade, Independently Verified",
  email: "support@phasedresearchgroup.com",
  url: "https://phasedresearchgroup.com",
  description:
    "Premium research peptides supplied exclusively for lawful laboratory research use by qualified personnel. Every batch is third-party tested with Certificates of Analysis available.",
};

// ============ RUO (Research Use Only) DISCLAIMER ============
export const RUO_DISCLAIMER =
  "All products are sold for research use only (RUO). Not for human consumption, diagnostic, or therapeutic use. Purchaser must be 21+ and qualified research personnel.";
