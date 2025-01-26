import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { isAuthApiError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// If we want to do an upload from the server, import put from "@vercel/blob" here.
// import { put } from "@vercel/blob";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") || "/";
  const errorDescription = requestUrl.searchParams.get("error_description");

  // 1) Handle any error first
  if (error) {
    console.error("Supabase auth error occurred:", {
      error,
      errorDescription,
      code,
    });
    return NextResponse.redirect(
      `${requestUrl.origin}/login/failed?err=${encodeURIComponent(error)}`
    );
  }

  // 2) If code exists, attempt the Supabase session exchange
  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    try {
      // Exchange code for a session
      await supabase.auth.exchangeCodeForSession(code);

      // Optionally check if the user is set up with the correct rows
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("[login] [session] [500] Error getting user: ", userError);
        return NextResponse.redirect(`${requestUrl.origin}/login/failed?err=500`);
      }

      // If we want to do more server-side logic (insert into DB, fetch rows, etc.), do it here.

    } catch (err) {
      if (isAuthApiError(err)) {
        console.error("[login] [session] [AuthApiError]: ", err);
        return NextResponse.redirect(
          `${requestUrl.origin}/login/failed?err=AuthApiError`
        );
      } else {
        console.error("[login] [session] [500] Something else wrong: ", err);
        return NextResponse.redirect(`${requestUrl.origin}/login/failed?err=500`);
      }
    }
  }

  // 3) Finally, if we want to return the token or do a redirect
  //    If the route's main job is just to do the callback and then redirect the user,
  //    do the redirect below. Otherwise, we can return JSON if that's what we need.
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  // For a typical OAuth callback, we usually redirect the user to the "next" page.
  // For demonstration, let's do a simple redirect:
  return NextResponse.redirect(new URL(next, req.url));
}

export async function handleUpload(file: File) {
  // Implementation of handleUpload function
}
