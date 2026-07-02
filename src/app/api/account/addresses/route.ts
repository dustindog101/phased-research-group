/**
 * Address Book API — CRUD for user shipping addresses
 *   GET    /api/account/addresses       — list addresses
 *   POST   /api/account/addresses       — create address
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const addresses = await db.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fullName, line1, line2, city, state, zip, country, phone, isDefault } = body;

    if (!fullName || !line1 || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.id,
        fullName,
        line1,
        line2: line2 || null,
        city,
        state,
        zip,
        country: country || "US",
        phone: phone || null,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ address });
  } catch (e) {
    console.error("POST /api/account/addresses error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create address" },
      { status: 500 }
    );
  }
}
