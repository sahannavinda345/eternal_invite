import { createClient } from "@supabase/supabase-js";

/**
 * Full-access Supabase client for the admin panel. SERVER ONLY.
 * Uses SUPABASE_SERVICE_ROLE_KEY, which bypasses all security rules –
 * never import this file from a "use client" component.
 */
export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and to Vercel (Settings → Environment Variables).");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
