import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email: string;
      password: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const username = normalizedEmail.split("@")[0] + Math.random().toString(36).slice(2, 6);
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        email: normalizedEmail,
        username,
        passwordHash,
        name: name?.trim() || null,
        role: "USER",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/auth/register error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Registration failed" },
      { status: 500 }
    );
  }
}
