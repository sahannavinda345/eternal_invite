import Link from "next/link";
import CopyButton from "@/components/dashboard/CopyButton";
import CreateInvitation from "@/components/dashboard/CreateInvitation";
import PageHead from "@/components/dashboard/PageHead";
import { GoTo } from "@/components/dashboard/InvitationActions";
import PhonePreview from "@/components/editor/PhonePreview";
import { getDesign } from "@/components/designs";
import { getSession } from "@/lib/dashboard";
import type { Guest } from "@/lib/types";
import { daysUntil, formatShortDate, invitationLink, timeAgo } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const { supabase, invitation: inv, invitations, profile } = await getSession();

  if (!inv) {
    return (
      <>
        <PageHead eyebrow="Welcome" title="Let's begin your chapter" sub="Create your first invitation. You'll design it with a live phone preview." />
        <CreateInvitation isFirst allowedDesigns={profile?.role === "admin" ? null : profile?.allowed_designs ?? null} />
      </>
    );
  }

  const { data } = await supabase.from("guests").select("*, rsvps(*)").eq("invitation_id", inv.id);
  const guests = (data ?? []) as Guest[];
  const first = inv.events[0];
  const invitedHeads = guests.reduce((n, g) => n + g.heads, 0);
  const attending = guests.reduce((n, g) => n + (g.rsvps?.find((r) => r.event_key === first?.key && r.status === "accepted")?.heads ?? 0), 0);
  const replies = guests
    .flatMap((g) => (g.rsvps ?? []).map((r) => ({ ...r, name: g.name })))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);
  const live = invitations.filter((i) => i.published).length;
  const days = daysUntil(first?.starts_at);

  const steps = [
    { label: "Create account", done: true, href: "/dashboard" },
    { label: "Choose template", done: true, href: "/dashboard/invitation" },
    { label: "Add guest list", done: guests.length > 0, href: "/dashboard/guests/add" },
    { label: "Customize details", done: !!(inv.families || inv.story) && !!first?.starts_at && !!first?.venue, href: "/dashboard/invitation" },
    { label: "Publish & share", done: inv.published, href: "/dashboard/invitations" },
  ];
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  return (
    <>
      <PageHead eyebrow="Dashboard" title={`Welcome back, ${inv.partner1} & ${inv.partner2}`}
        sub={`${live} of your ${invitations.length} invitation${invitations.length === 1 ? " is" : "s are"} live. Here's what's happening.`} />

      {/* ---------- invitations ---------- */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[0.7rem] uppercase tracking-[0.28em] text-white">Your invitations</h2>
            <p className="text-xs text-muted">{invitations.length} invitation{invitations.length === 1 ? "" : "s"} · {live} live</p>
          </div>
          <Link href="/dashboard/invitations" className="text-[0.65rem] uppercase tracking-[0.22em] text-white/70 hover:text-white">Manage all →</Link>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {invitations.map((i) => {
            const ev = i.events[0];
            const link = invitationLink(i.slug);
            return (
              <article key={i.id} className="card flex gap-4 overflow-hidden p-5">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={i.published ? "pill-accepted" : "pill-pending"}>{i.published ? "Live" : "Draft"}</span>
                    <span className="border border-line px-2 py-0.5 text-xs text-muted">{getDesign(i.design).name}</span>
                  </div>
                  <div>
                    <h3 className="display text-xl">{i.title}</h3>
                    <p className="text-sm text-muted">{i.partner1} &amp; {i.partner2}</p>
                    <p className="mt-2 text-xs text-muted">{formatShortDate(ev?.starts_at)}</p>
                    <p className="text-xs text-muted">{ev?.venue || "No venue yet"}</p>
                  </div>
                  {i.published ? (
                    <div className="flex items-center gap-2 border border-line bg-canvas p-1.5 pl-3">
                      <span className="min-w-0 flex-1 truncate text-xs">{link.replace(/^https?:\/\//, "")}</span>
                      <CopyButton text={link} label="Copy" />
                    </div>
                  ) : (
                    <p className="text-xs text-muted">Only you can see it. <GoToLink id={i.id} /></p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {i.published
                      ? <GoTo id={i.id} href="/dashboard/guests/links" primary>Send to guests</GoTo>
                      : <GoTo id={i.id} href="/dashboard/invitation" primary>Edit</GoTo>}
                    {i.published
                      ? <GoTo id={i.id} href="/dashboard/invitation">Edit</GoTo>
                      : <a href={`/i/${i.slug}`} target="_blank" rel="noopener" className="btn">Preview</a>}
                  </div>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <PhonePreview invitation={i} scale={0.4} interactive={false} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- getting started ---------- */}
      <section className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm text-white">Getting started · {inv.title}</h2>
            <p className="text-xs text-muted">{next ? `Next: ${next.label}` : "Everything is ready. Enjoy the replies."}</p>
          </div>
          <span className="border border-line px-2 py-0.5 text-xs tabular-nums">{Math.round((done / steps.length) * 100)}%</span>
        </div>
        <div className="h-px bg-line">
          <div className="h-px bg-white transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {steps.map((s, n) => (
            <Link key={s.label} href={s.href}
              className={s.done ? "flex flex-col items-center gap-2 border border-white/25 bg-white/[0.04] p-3 text-center text-xs text-white" : "flex flex-col items-center gap-2 border border-line p-3 text-center text-xs text-muted hover:border-white/30"}>
              <span className={s.done ? "grid h-6 w-6 place-items-center rounded-full bg-white text-black" : "grid h-6 w-6 place-items-center rounded-full border border-line"}>{s.done ? "✓" : n + 1}</span>
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
        {[
          ["Total guests", String(guests.length), `${invitedHeads} seats invited`],
          ["Page views", String(inv.views ?? 0), "guest link opens"],
          ["Attending", `${attending} / ${invitedHeads}`, invitedHeads ? `${Math.round((attending / invitedHeads) * 100)}% attending so far` : "No guests yet"],
          ["Days to go", days === null ? "–" : String(days), formatShortDate(first?.starts_at)],
        ].map(([l, v, s]) => (
          <div key={l} className="card flex flex-col gap-1 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">{l}</p>
            <b className="font-display text-2xl font-light tabular-nums text-white sm:text-3xl">{v}</b>
            <p className="text-xs text-muted">{s}</p>
          </div>
        ))}
      </section>

      {/* ---------- replies + quick actions ---------- */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card flex flex-col">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="text-sm text-white">Guest responses</h2>
            <Link href="/dashboard/guests/rsvp" className="text-[0.65rem] uppercase tracking-[0.22em] text-white/70 hover:text-white">Details →</Link>
          </div>
          {replies.length ? (
            <ul>
              {replies.map((r) => (
                <li key={r.id} className="flex items-center gap-3 border-b border-line px-4 py-3 text-sm last:border-0">
                  <span className={`pill-${r.status}`}>{r.status === "accepted" ? "Coming" : "Declined"}</span>
                  <span className="min-w-0 flex-1 truncate">{r.name}{r.status === "accepted" && r.heads > 1 ? ` · ${r.heads} guests` : ""}</span>
                  <span className="text-xs text-muted">{timeAgo(r.updated_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-center text-sm text-muted">No replies yet. They&apos;ll appear here as guests answer.</p>
          )}
        </div>
        <div className="card flex flex-col gap-2 p-4">
          <h2 className="mb-1 text-sm text-white">Quick actions</h2>
          <Link href="/dashboard/guests/add" className="btn justify-start">Add guests</Link>
          <Link href="/dashboard/guests/links" className="btn justify-start">Send WhatsApp links</Link>
          <Link href="/dashboard/invitation" className="btn justify-start">Edit invitation</Link>
          <Link href="/dashboard/invitations/new" className="btn justify-start">New invitation</Link>
        </div>
      </section>
    </>
  );
}

function GoToLink({ id }: { id: string }) {
  return <span className="inline-block align-middle"><GoTo id={id} href="/dashboard/invitations">Publish it →</GoTo></span>;
}
