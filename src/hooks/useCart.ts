"use client";

/**
 * Cart store — uses Zustand + localStorage for guests
 * Syncs to DB Cart/CartItem when user is logged in
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartLineItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  displayName: string;
  dosage: string;
  price: number; // single vial unit price
  capColor: string;
  isKit: boolean; // default false for single vials
  quantity: number;
}

interface CartState {
  items: CartLineItem[];
  couponCode: string | null;
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,

      addItem: (item, quantity = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.variantId === item.variantId);
        if (idx >= 0) {
          items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
        } else {
          items.push({ ...item, isKit: item.isKit ?? false, quantity });
        }
        set({ items });
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter((i) => i.variantId !== variantId),
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        const items = get().items.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        );
        set({ items });
      },

      clear: () => set({ items: [], couponCode: null }),

      applyCoupon: (code) => set({ couponCode: code.toUpperCase().trim() }),
      removeCoupon: () => set({ couponCode: null }),

      subtotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      itemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: "prg-cart",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    }
  )
);
