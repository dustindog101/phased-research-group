import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const pgUrl = process.env.POSTGRES_URL || "";
  const pgPrismaUrl = process.env.POSTGRES_PRISMA_URL || "";
  const unpooledUrl = process.env.DATABASE_URL_UNPOOLED || "";

  const mask = (s: string) => s ? s.replace(/:[^:@]+@/, ":***@") : "EMPTY";

  try {
    const tables = await db.$queryRaw<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name ASC
    `;

    return NextResponse.json({
      activeMaskedUrls: {
        DATABASE_URL: mask(dbUrl),
        POSTGRES_URL: mask(pgUrl),
        POSTGRES_PRISMA_URL: mask(pgPrismaUrl),
        DATABASE_URL_UNPOOLED: mask(unpooledUrl),
      },
      publicTables: tables.map((t) => t.table_name),
      tableCount: tables.length,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : String(e),
        activeMaskedUrls: {
          DATABASE_URL: mask(dbUrl),
          POSTGRES_URL: mask(pgUrl),
          POSTGRES_PRISMA_URL: mask(pgPrismaUrl),
          DATABASE_URL_UNPOOLED: mask(unpooledUrl),
        },
      },
      { status: 500 }
    );
  }
}
