import { NextResponse } from "next/server";
import { handleListCryptoMethods } from "@/lib/payments/handlers";

export async function GET() {
  try {
    const result = await handleListCryptoMethods();
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/payments/methods error:", e);
    return NextResponse.json(
      { methods: [], enabled: false, error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
