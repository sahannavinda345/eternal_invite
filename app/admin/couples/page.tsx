import Link from "next/link";
import PageHead from "@/components/dashboard/PageHead";
import { requireAdmin } from "@/lib/admin";
import { isPaused, type Plan, type Profile } from "@/lib/types";
import { lkr } from "@/lib/utils";

export const metadata = { title: "Couples" };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function CouplesPage({ searchParams }: Props) {
  const { q = "", status = "all" } = await searchParams;
  const { db } = await requireAdmin();
  const [{ data: profiles }, { data: invs }, { data: plans }] = await Promise.all([
    db.from("profiles").select("*").eq("role", "couple").order("created_at", { ascending: false }),
    db.from("invitations").select("owner_id, published"),
    db.from("plans").select("*"),
  ]);
  const planName = Object.fromEntries(((plans ?? []) as Plan[]).map((p) => [p.id, p.name]));
  const used: Record<string, number> = {};
  for (const i of invs ?? []) used[i.owner_id] = (used[i.owner_id] ?? 0) + 1;

  const needle = q.trim().toLowerCase();
  const rows = ((profiles ?? []) as Profile[]).filter((c) => {
    if (status === "active" && isPaused(c)) return false;
    if (status === "paused" && !isPaused(c)) return false;
    return !needle || `${c.couple_name ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(needle);
  });

  return (
    <>
      <PageHead eyebrow="Admin" title={`Couples (${profiles?.length ?? 0})`} sub="Click a couple to change their plan, templates, access or password."
        action={<Link href="/admin/couples/new" className="btn-primary">+ Add couple</Link>} />

      <form className="flex flex-wrap gap-2" action="/admin/couples">
        <input name="q" defaultValue={q} aria-label="Search couples" placeholder="Search by name, email or phone…" className="field max-w-sm bg-surface" />
        <select name="status" defaultValue={status} aria-label="Status" className="field w-auto bg-surface">
          <option value="all">All</option><option value="active">Active</option><option value="paused">Paused</option>
        </select>
        <button type="submit" className="btn">Search</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.62rem] uppercase tracking-[0.18em] text-muted">
              {["Couple", "Plan", "Invitations", "Paid", "Access until", "Status"].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const paused = isPaused(c);
              return (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/couples/${c.id}`} className="block">
                      <span className="block text-white">{c.couple_name || "No name yet"}</span>
                      <span className="text-xs text-muted">{c.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.plan_id ? planName[c.plan_id] ?? c.plan_id : "Custom"}</td>
                  <td className="px-4 py-3 tabular-nums">{used[c.id] ?? 0} / {c.max_invitations}</td>
                  <td className="px-4 py-3 tabular-nums">{lkr(c.paid_amount)}</td>
                  <td className="px-4 py-3 text-muted">{c.expires_at ?? "No end date"}</td>
                  <td className="px-4 py-3"><span className={paused ? "pill-declined" : "pill-accepted"}>{paused ? (c.status === "suspended" ? "Suspended" : "Expired") : "Active"}</span></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No couples match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
