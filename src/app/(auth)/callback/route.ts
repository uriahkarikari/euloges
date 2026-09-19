import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-link", request.url),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Unable to exchange auth code:", error);

    return NextResponse.redirect(
      new URL("/login?error=invalid-link", request.url),
    );
  }

  if (next === "update-password") {
    return NextResponse.redirect(new URL("/update-password", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}
