import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

/** The signed-in admin, or a redirect. Use at the top of every admin page and action. */
export const requireAdmin = cache(async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (data?.role !== "admin") redirect("/dashboard");
  return { user, profile: data, db: adminClient() };
});
