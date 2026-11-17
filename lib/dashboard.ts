import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Invitation } from "@/lib/types";
import { CURRENT_INVITATION_COOKIE } from "@/lib/utils";

/**
 * The signed-in couple, all their invitations, and the one they are working on
 * (chosen in the sidebar, remembered in a cookie). Redirects to /login when signed out.
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });
  const invitations = (data ?? []) as Invitation[];

  const chosen = (await cookies()).get(CURRENT_INVITATION_COOKIE)?.value;
  const invitation = invitations.find((i) => i.id === chosen) ?? invitations[0] ?? null;

  return { supabase, user, invitations, invitation };
}
