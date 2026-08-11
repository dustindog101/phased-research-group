import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not found in process.env" }, { status: 500 });
    }

    const { blobs } = await list({ token });

    return NextResponse.json({
      totalBlobs: blobs.length,
      blobs: blobs.map((b) => ({
        pathname: b.pathname,
        url: b.url,
        uploadedAt: b.uploadedAt,
        size: b.size,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
