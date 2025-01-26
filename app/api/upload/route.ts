import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    // For example, parse JSON from the request body
    const { filename, content } = await req.json();

    // The environment variable is automatically available on the server
    const result = await put(filename, content, {
      access: "public",
    });

    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
} 