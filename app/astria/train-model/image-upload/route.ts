import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Configure Vercel Blob (#7 step in the README)
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Validate request content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("Invalid content type:", contentType);
      return NextResponse.json(
        { error: "Invalid content type. Expected application/json" },
        { status: 400 }
      );
    }

    let body: HandleUploadBody;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    // Validate BLOB token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    console.log("Processing upload for user:", user.id);

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname) {
          console.error("Missing pathname in onBeforeGenerateToken");
          throw new Error("Pathname is required");
        }
        console.log("Generating token for pathname:", pathname);
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
          tokenPayload: JSON.stringify({
            userId: user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload completed for blob:", blob.url);
        try {
          if (!tokenPayload) {
            throw new Error("Token payload is missing");
          }
          const { userId } = JSON.parse(tokenPayload);
          console.log("Processing completed upload for user:", userId);
          // Here you could update your database with the blob URL if needed
        } catch (error) {
          console.error("Upload completion error:", error);
          throw new Error("Could not process upload completion");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 400 }
    );
  }
}
