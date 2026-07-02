/**
 * Single Address API
 *   PATCH  /api/account/addresses/:id  — update address
 *   DELETE /api/account/addresses/:id  — delete address
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { addressId } = await params;
  const body = await req.json();

  // Verify ownership
  const existing = await db.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  // If setting as default, unset others
  if (body.isDefault) {
    await db.address.updateMany({
      where: { userId: session.id, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const allowed = ["fullName", "line1", "line2", "city", "state", "zip", "country", "phone", "isDefault"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const address = await db.address.update({ where: { id: addressId }, data });
  return NextResponse.json({ address });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { addressId } = await params;

  // Verify ownership
  const existing = await db.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await db.address.delete({ where: { id: addressId } });
  return NextResponse.json({ success: true });
}
