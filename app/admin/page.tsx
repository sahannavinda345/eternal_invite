import Link from "next/link";
import PageHead from "@/components/dashboard/PageHead";
import { requireAdmin } from "@/lib/admin";
import type { Profile } from "@/lib/types";
import { isPaused } from "@/lib/types";
import { lkr, timeAgo } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const { db } = await requireAdmin();
  const [{ data: profiles }, { data: invs }, { count: guests }, { data: rsvps }] = await Promise.all([
    db.from("profiles").select("*").eq("role", "couple").order("created_at", { ascending: false }),
    db.from("invitations").select("id, owner_id, published, views"),
    db.from("guests").select("id", { count: "exact", head: true }),
    db.from("rsvps").select("status, heads"),
  ]);
  const couples = (profiles ?? []) as Profile[];
  const invitations = invs ?? [];
  const now = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const expiring = couples.filter((c) => c.expires_at && c.expires_at >= now && c.expires_at <= soon);
  const paused = couples.filter((c) => isPaused(c)).length;
  const revenue = couples.reduce((n, c) => n + Number(c.paid_amount || 0), 0);
  const attending = (rsvps ?? []).filter((r) => r.status === "accepted").reduce((n, r) => n + (r.heads ?? 0), 0);
  const views = invitations.reduce((n, i) => n + (i.views ?? 0), 0);

  const stats = [
    ["Couples", String(couples.length), `${couples.length - paused} active · ${paused} paused`],
    ["Revenue recorded", lkr(revenue), "sum of amounts paid"],
    ["Invitations", String(invitations.length), `${invitations.filter((i) => i.published).length} published · ${views} guest views`],
    ["Guests", String(guests ?? 0), `${attending} attending so far`],
  ];

  return (
    <>
      <PageHead eyebrow="Admin" title="Overview" sub="Every couple, plan and invitation on Eternal Chapter."
        action={<Link href="/admin/couples/new" className="btn-primary">+ Add couple</Link>} />

      <section className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
        {stats.map(([l, v, s]) => (
          <div key={l} className="card flex flex-col gap-1 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">{l}</p>
            <b className="truncate font-display text-2xl font-light tabular-nums text-white sm:text-3xl">{v}</b>
            <p className="text-xs text-muted">{s}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="text-sm text-white">Newest couples</h2>
            <Link href="/admin/couples" className="text-[0.65rem] uppercase tracking-[0.22em] text-white/70 hover:text-white">All couples →</Link>
          </div>
          {couples.length ? (
            <ul>
              {couples.slice(0, 6).map((c) => (
                <li key={c.id} className="border-b border-line last:border-0">
                  <Link href={`/admin/couples/${c.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.03]">
                    <span className="min-w-0 flex-1 truncate">{c.couple_name || c.email}</span>
                    <span className="text-xs text-muted">{lkr(c.paid_amount)}</span>
                    <span className="text-xs text-muted">{timeAgo(c.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="p-6 text-center text-sm text-muted">No couples yet. <Link href="/admin/couples/new" className="text-white underline">Add the first one</Link>.</p>}
        </div>
        <div className="card">
          <div className="border-b border-line p-4"><h2 className="text-sm text-white">Access ending in the next 30 days</h2></div>
          {expiring.length ? (
            <ul>
              {expiring.map((c) => (
                <li key={c.id} className="border-b border-line last:border-0">
                  <Link href={`/admin/couples/${c.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.03]">
                    <span className="min-w-0 flex-1 truncate">{c.couple_name || c.email}</span>
                    <span className="pill-pending">{c.expires_at}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="p-6 text-center text-sm text-muted">Nobody&apos;s access ends soon.</p>}
        </div>
      </section>
    </>
  );
}
