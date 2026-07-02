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

interface CreateOrderBody {
  items: Array<{
    productId: string;
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

    const productIds = [...new Set(body.items.map((i) => i.productId))];
    const products = await db.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      name: string;
      dosage: string;
      sku: string;
      price: number;
      quantity: number;
      isKit: boolean;
    }> = [];

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      if (!product.inStock) {
        return NextResponse.json({ error: `${product.displayName} is out of stock` }, { status: 400 });
      }
      const unitPrice = item.isKit ? product.kitPrice / 5 : product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        productId: product.id,
        name: product.name,
        dosage: product.dosage,
        sku: product.sku,
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
