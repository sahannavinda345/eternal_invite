import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Older Supabase email links land here with ?code=…
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${nextParam?.startsWith("/") ? nextParam : "/dashboard"}`);
}
