import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/dashboard/PageHead";
import CoupleForm from "@/components/admin/CoupleForm";
import CoupleDangerZone from "@/components/admin/CoupleDangerZone";
import InvitationAdminActions from "@/components/admin/InvitationAdminActions";
import { getDesign } from "@/components/designs";
import { requireAdmin } from "@/lib/admin";
import { isPaused, type Invitation, type Plan, type Profile } from "@/lib/types";
import { formatShortDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "Couple" };

export default async function CouplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = await requireAdmin();
  const [{ data: profile }, { data: plans }, { data: invs }, { data: lastSignIn }] = await Promise.all([
    db.from("profiles").select("*").eq("id", id).maybeSingle<Profile>(),
    db.from("plans").select("*").order("sort"),
    db.from("invitations").select("*").eq("owner_id", id).order("created_at"),
    db.auth.admin.getUserById(id),
  ]);
  if (!profile) notFound();
  const invitations = (invs ?? []) as Invitation[];
  const ids = invitations.map((i) => i.id);
  const { data: guests } = ids.length
    ? await db.from("guests").select("invitation_id, heads, rsvps(status, heads)").in("invitation_id", ids)
    : { data: [] as { invitation_id: string; heads: number; rsvps: { status: string; heads: number }[] }[] };
  const per = (invId: string) => {
    const g = (guests ?? []).filter((x) => x.invitation_id === invId);
    const attending = g.reduce((n, x) => n + (x.rsvps ?? []).filter((r) => r.status === "accepted").reduce((m, r) => m + r.heads, 0), 0);
    return { guests: g.length, attending };
  };
  const name = profile.couple_name || profile.email || "Couple";
  const paused = isPaused(profile);
  const signedIn = lastSignIn?.user?.last_sign_in_at;

  return (
    <>
      <PageHead eyebrow="Couple" title={name}
        sub={`${profile.email ?? ""} · ${signedIn ? `last signed in ${timeAgo(signedIn)}` : "has not signed in yet"} · added ${formatShortDate(profile.created_at)}`}
        action={<span className={paused ? "pill-declined" : "pill-accepted"}>{paused ? "Paused" : "Active"}</span>} />

      <section className="card">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="text-sm text-white">Invitations ({invitations.length} of {profile.max_invitations})</h2>
        </div>
        {invitations.length ? (
          <ul>
            {invitations.map((i) => {
              const s = per(i.id);
              return (
                <li key={i.id} className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 text-sm last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-white">{i.title} <span className="text-xs text-muted">· {getDesign(i.design).name} · /i/{i.slug}</span></p>
                    <p className="text-xs text-muted">{i.published ? "Published" : "Draft"} · {formatShortDate(i.events[0]?.starts_at)} · {s.guests} guests · {s.attending} attending · {i.views ?? 0} views</p>
                  </div>
                  <InvitationAdminActions id={i.id} slug={i.slug} published={i.published} />
                </li>
              );
            })}
          </ul>
        ) : <p className="p-6 text-center text-sm text-muted">They haven&apos;t created an invitation yet.</p>}
      </section>

      <CoupleForm plans={(plans ?? []) as Plan[]} couple={profile} />
      <CoupleDangerZone id={profile.id} email={profile.email} label={name} />
      <Link href="/admin/couples" className="text-[0.65rem] uppercase tracking-[0.22em] text-muted hover:text-white">← All couples</Link>
    </>
  );
}
