import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GuestView, Invitation } from "@/lib/types";
import { formatLongDate } from "@/lib/utils";
import { getDesign } from "@/components/designs";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ g?: string }>;
};

const load = cache(async function load(slug: string, token?: string) {
  const supabase = await createClient();
  const { data: invitation } = await supabase.from("invitations").select("*").eq("slug", slug).maybeSingle<Invitation>();
  if (!invitation) return { invitation: null, guest: null };
  let guest: GuestView | null = null;
  if (token) {
    const { data } = await supabase.rpc("get_guest", { p_slug: slug, p_token: token });
    guest = (data as GuestView | null) ?? null;
  }
  return { invitation, guest };
});

// WhatsApp uses these tags for the link preview
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { g } = await searchParams;
  const { invitation, guest } = await load(slug, g);
  if (!invitation) return { title: "Invitation not found" };
  const couple = `${invitation.partner1} & ${invitation.partner2}`;
  const first = invitation.events[0];
  const description = guest
    ? `Dear ${guest.name}, you're invited to celebrate with ${couple}.`
    : `You're invited to celebrate with ${couple}${first ? ` on ${formatLongDate(first.starts_at).toLowerCase()}` : ""}.`;
  return {
    title: `${couple} – Wedding Invitation`,
    description,
    openGraph: { title: `${couple} – Wedding Invitation`, description, type: "website" },
    robots: { index: false },
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { g } = await searchParams;
  const { invitation, guest } = await load(slug, g);
  if (!invitation) notFound();

  // Count guest visits (only when opened from a personal link)
  if (guest) {
    const supabase = await createClient();
    await supabase.rpc("track_view", { p_slug: slug });
  }

  // All designs receive the same props, so new designs are just new components.
  const { Component } = getDesign(invitation.design);
  return <Component invitation={invitation} guest={guest} token={g ?? null} />;
}
