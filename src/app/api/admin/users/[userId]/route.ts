import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await requireAdmin();
  const { userId } = await params;
  try {
    const body = await req.json();
    const allowed = ["role", "name"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }
    if (data.role && !["USER", "ADMIN"].includes(data.role as string)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, role: true, name: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    console.error("PATCH /api/admin/users error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update user" },
      { status: 500 }
    );
  }
}
