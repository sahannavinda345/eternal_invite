import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing page for links in Supabase emails (invite, password reset, magic link).
 * The email templates send people to /auth/confirm?token_hash=…&type=…
 * Invites and resets continue to /set-password so the couple chooses a password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const needsPassword = type === "invite" || type === "recovery";
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : needsPassword ? "/set-password" : "/dashboard";

  const supabase = await createClient();
  let ok = false;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (!ok) return NextResponse.redirect(`${origin}/login?link=expired`);
  return NextResponse.redirect(`${origin}${next}`);
}
