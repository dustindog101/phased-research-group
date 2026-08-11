/**
 * Orders API
 *   POST   /api/orders          — create a new order (auth or guest)
 *   GET    /api/orders          — list current user's orders (auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/constants";
import type { CryptoAssetId } from "@/lib/payments/constants";
import { sendOrderConfirmation } from "@/lib/email";

interface CreateOrderBody {
  items: Array<{
    variantId?: string;
    productId?: string;
    quantity: number;
    isKit: boolean;
  }>;
  email?: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    phone?: string;
  };
  shippingMethod: "ground" | "express";
  couponCode?: string;
  paymentMethod?: string;
  cryptoAsset?: CryptoAssetId;
  ruoAccepted: boolean;
  ageConfirmed: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;
    const session = await getSession();

    if (!body.items?.length) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }
    if (!body.shippingAddress?.fullName || !body.shippingAddress?.line1 || !body.shippingAddress?.city) {
      return NextResponse.json({ error: "Shipping address required" }, { status: 400 });
    }
    if (!body.ruoAccepted || !body.ageConfirmed) {
      return NextResponse.json({ error: "RUO and age confirmation required" }, { status: 400 });
    }

    const variantIds = body.items.map((i) => i.variantId).filter(Boolean) as string[];
    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let subtotal = 0;
    const orderItems: Array<{
      variantId: string;
      name: string;
      dosage: string;
      sku: string;
      price: number;
      quantity: number;
      isKit: boolean;
    }> = [];

    for (const item of body.items) {
      const variant = item.variantId ? variantMap.get(item.variantId) : null;
      if (!variant) {
        return NextResponse.json({ error: `Selected product variant not found` }, { status: 400 });
      }
      if (!variant.inStock) {
        return NextResponse.json({ error: `${variant.displayName} is out of stock` }, { status: 400 });
      }
      const unitPrice = item.isKit ? variant.kitPrice / 5 : variant.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        variantId: variant.id,
        name: variant.product.name,
        dosage: variant.dosage,
        sku: variant.sku,
        price: unitPrice,
        quantity: item.quantity,
        isKit: item.isKit,
      });
    }

    let discountAmount = 0;
    let couponCode: string | null = null;
    if (body.couponCode) {
      const code = body.couponCode.toUpperCase().trim();
      const coupon = await db.coupon.findUnique({ where: { code } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }
      if (subtotal < coupon.minOrder) {
        return NextResponse.json(
          { error: `Minimum order of $${coupon.minOrder} required for this coupon` },
          { status: 400 }
        );
      }
      couponCode = code;
      discountAmount =
        coupon.discountType === "PERCENT"
          ? (subtotal * coupon.value) / 100
          : Math.min(coupon.value, subtotal);
    }

    const afterDiscount = subtotal - discountAmount;
    const FREE_SHIPPING = 175;
    const shipping =
      afterDiscount >= FREE_SHIPPING
        ? 0
        : body.shippingMethod === "express"
          ? 22.95
          : 10.75;
    const total = afterDiscount + shipping;

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.id,
        guestEmail: !session ? body.email : undefined,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: body.paymentMethod,
        cryptoAsset: body.cryptoAsset,
        subtotal,
        discountAmount,
        shipping,
        total,
        couponCode,
        shippingAddress: body.shippingAddress as object,
        shippingMethod: body.shippingMethod,
        source: "web",
        ruoAccepted: body.ruoAccepted,
        ageConfirmed: body.ageConfirmed,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    if (couponCode) {
      await db.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Send order confirmation email (non-blocking)
    const customerEmail = session?.email ?? body.email;
    if (customerEmail) {
      sendOrderConfirmation({
        to: customerEmail,
        orderNumber: order.orderNumber,
        orderId: order.id,
        items: order.items.map((i) => ({
          name: i.name,
          dosage: i.dosage,
          quantity: i.quantity,
          isKit: i.isKit,
          price: i.price,
        })),
        total: order.total,
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discountAmount,
        shippingAddress: body.shippingAddress as {
          fullName: string;
          line1: string;
          city: string;
          state: string;
          zip: string;
        },
      }).catch((e) => console.error("Order confirmation email failed:", e));
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentStatus: order.paymentStatus,
    });
  } catch (e) {
    console.error("POST /api/orders error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { userId: session.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("GET /api/orders error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
