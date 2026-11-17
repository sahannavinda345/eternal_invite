import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Invitation, Profile } from "@/lib/types";
import { CURRENT_INVITATION_COOKIE } from "@/lib/utils";

/**
 * The signed-in couple, their profile (plan limits), all their invitations, and the one
 * they are working on (chosen in the sidebar, remembered in a cookie).
 * Redirects to /login when signed out. Cached so a page and its layout share one lookup.
 */
export const getSession = cache(async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data }, { data: profile }] = await Promise.all([
    supabase.from("invitations").select("*").eq("owner_id", user.id).order("created_at", { ascending: true }),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
  ]);
  const invitations = (data ?? []) as Invitation[];

  const chosen = (await cookies()).get(CURRENT_INVITATION_COOKIE)?.value;
  const invitation = invitations.find((i) => i.id === chosen) ?? invitations[0] ?? null;

  // How many more invitations the plan allows (no profile yet = no limit)
  const maxInvitations = profile && profile.role !== "admin" ? profile.max_invitations : Infinity;
  const canCreate = invitations.length < maxInvitations;

  return { supabase, user, profile: profile ?? null, invitations, invitation, maxInvitations, canCreate };
});
