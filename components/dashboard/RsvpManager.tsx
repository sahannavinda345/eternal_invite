"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Guest, Invitation, Rsvp } from "@/lib/types";
import { cx, timeAgo } from "@/lib/utils";

type Status = "accepted" | "declined" | "pending";
type Toast = { id: number; title: string; sub: string };

function statusOf(g: Guest, ev: string): { status: Status; r?: Rsvp } {
  const r = g.rsvps?.find((x) => x.event_key === ev);
  return { status: r ? r.status : "pending", r };
}

export default function RsvpManager({ invitation: inv }: { invitation: Invitation }) {
  const supabase = useMemo(() => createClient(), []);
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [error, setError] = useState("");
  const [ev, setEv] = useState(inv.events[0]?.key ?? "");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flash, setFlash] = useState<Record<string, number>>({});
  const guestsRef = useRef<Guest[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("guests").select("*, rsvps(*)").eq("invitation_id", inv.id).order("name");
    if (error) setError(error.message);
    else { setGuests(data as Guest[]); guestsRef.current = data as Guest[]; }
  }, [supabase, inv.id]);

  // Initial load + live updates from Supabase Realtime
  useEffect(() => {
    load();
    const channel = supabase
      .channel(`rsvps-${inv.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, (payload) => {
        const row = (payload.new ?? {}) as Partial<Rsvp>;
        const g = guestsRef.current.find((x) => x.id === row.guest_id);
        if (g && row.updated_by === "guest" && (payload.eventType === "INSERT" || payload.eventType === "UPDATE")) {
          const label = inv.events.find((e) => e.key === row.event_key)?.label ?? "";
          const t: Toast = row.status === "accepted"
            ? { id: Date.now(), title: `${g.name} is coming`, sub: `${row.heads} guest${row.heads === 1 ? "" : "s"} · ${label}` }
            : { id: Date.now(), title: `${g.name} can't make it`, sub: label };
          setToasts((ts) => [...ts, t]);
          setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 5000);
          setFlash((f) => ({ ...f, [g.id]: Date.now() }));
        }
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, inv.id, inv.events, load]);

  const list = (guests ?? []).filter((g) => g.events.includes(ev));
  const counts = { accepted: 0, declined: 0, pending: 0 };
  let attending = 0, invited = 0;
  for (const g of list) {
    const { status, r } = statusOf(g, ev);
    counts[status]++;
    invited += g.heads;
    if (status === "accepted") attending += r!.heads;
  }
  const rate = list.length ? Math.round(((counts.accepted + counts.declined) / list.length) * 100) : 0;
  const rows = list
    .filter((g) => filter === "all" || statusOf(g, ev).status === filter)
    .filter((g) => {
      if (!q) return true;
      const r = statusOf(g, ev).r;
      return `${g.name} ${g.phone ?? ""} ${r?.message ?? ""}`.toLowerCase().includes(q.toLowerCase());
    })
    .sort((a, b) => (statusOf(b, ev).r?.updated_at ?? "").localeCompare(statusOf(a, ev).r?.updated_at ?? ""));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="card flex flex-col gap-1 p-4">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">✓</span>Attending
          </p>
          <b className="font-display text-4xl font-normal tabular-nums">{attending}</b>
          <p className="text-sm text-muted">of {invited} invited</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${invited ? (attending / invited) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="card flex flex-col gap-1 p-4">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-red-400/10 text-red-300">✕</span>Declined
          </p>
          <b className="font-display text-4xl font-normal tabular-nums">{counts.declined}</b>
          <p className="text-sm text-muted">{counts.declined === 1 ? "response" : "responses"}</p>
        </div>
        <div className="card flex flex-col gap-1 p-4">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-400/10 text-amber-300">…</span>Pending
          </p>
          <b className="font-display text-4xl font-normal tabular-nums">{counts.pending}</b>
          <p className="text-sm text-muted">{rate}% response rate</p>
        </div>
      </div>

      <div className="inline-flex self-start rounded-sm border border-line bg-surface p-1" role="tablist">
        {inv.events.map((e) => (
          <button key={e.key} type="button" role="tab" aria-selected={ev === e.key} onClick={() => setEv(e.key)}
            className={cx("rounded-sm px-3.5 py-1.5 text-sm", ev === e.key ? "bg-brand-soft font-semibold text-brand" : "text-muted")}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[0.68rem] uppercase tracking-[0.14em] text-muted">Status</span>
        {([["all", "All", list.length], ["accepted", "Accepted", counts.accepted], ["pending", "Pending", counts.pending], ["declined", "Declined", counts.declined]] as const).map(([k, t, n]) => (
          <button key={k} type="button" onClick={() => setFilter(k)}
            className={cx("inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-sm",
              filter === k ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface")}>
            {t}
            <span className={cx("rounded-sm px-1.5 text-xs tabular-nums", filter === k ? "bg-brand text-black" : "bg-canvas text-muted")}>{n}</span>
          </button>
        ))}
      </div>

      <input aria-label="Search" className="field bg-surface py-2.5" placeholder="Search by name, WhatsApp or message…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="card">
        <p className="border-b border-line px-4 py-3 text-sm text-muted">
          {rows.length} of {list.length} guests · {attending} attending · {invited} invited
        </p>
        {error ? <p className="p-6 text-sm text-red-300">{error}</p>
          : !guests ? <p className="p-8 text-center text-muted">Loading replies…</p>
          : !list.length ? <p className="p-8 text-center text-muted">No guests invited to this event yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                    {["Name", "Status", "Heads", "Message", "Updated", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => {
                    const { status, r } = statusOf(g, ev);
                    const heads = status === "accepted" ? `${r!.heads} / ${g.heads}` : status === "declined" ? `0 / ${g.heads}` : `– / ${g.heads}`;
                    const isNew = flash[g.id] && Date.now() - flash[g.id] < 4000;
                    return (
                      <tr key={g.id} className={cx("border-b border-line transition-colors last:border-0", isNew && "bg-emerald-400/10")}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{g.name}</div>
                          <div className="text-xs tabular-nums text-muted">{g.phone ? `+94 ${g.phone}` : "No WhatsApp number"}</div>
                        </td>
                        <td className="px-4 py-3"><span className={`pill-${status}`}>{status[0].toUpperCase() + status.slice(1)}</span></td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{heads}</td>
                        <td className="max-w-[280px] px-4 py-3 text-muted">{r?.message || "–"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{timeAgo(r?.updated_at)}</td>
                        <td className="px-4 py-3 text-right"><button type="button" className="btn" onClick={() => setEditing(g)}>Edit</button></td>
                      </tr>
                    );
                  })}
                  {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No guests match this filter.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {editing && (
        <EditModal guest={editing} ev={ev} evLabel={inv.events.find((e) => e.key === ev)?.label ?? ""}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}

      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="card flex min-w-[240px] items-center gap-3 p-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">✓</span>
            <div><b className="block text-sm">{t.title}</b><span className="text-xs text-muted">{t.sub}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditModal({ guest, ev, evLabel, onClose, onSaved }: { guest: Guest; ev: string; evLabel: string; onClose: () => void; onSaved: () => void }) {
  const current = statusOf(guest, ev);
  const [status, setStatus] = useState<Status>(current.status);
  const [heads, setHeads] = useState(current.r?.heads || guest.heads);
  const [message, setMessage] = useState(current.r?.message ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const supabase = createClient();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (status === "accepted" && (heads < 1 || heads > guest.heads)) return setError(`Heads must be between 1 and ${guest.heads}.`);
    setBusy(true);
    const res = status === "pending"
      ? await supabase.from("rsvps").delete().eq("guest_id", guest.id).eq("event_key", ev)
      : await supabase.from("rsvps").upsert({
          guest_id: guest.id, event_key: ev, status, heads: status === "accepted" ? heads : 0,
          message: message.trim() || null, updated_by: "couple", updated_at: new Date().toISOString(),
        }, { onConflict: "guest_id,event_key" });
    setBusy(false);
    if (res.error) setError(res.error.message);
    else onSaved();
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    const { error } = await supabase.from("guests").delete().eq("id", guest.id);
    setBusy(false);
    if (error) setError(error.message);
    else onSaved();
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/75 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={save} className="card flex w-full max-w-md flex-col gap-3.5 p-5" role="dialog" aria-label={`Edit ${guest.name}`}>
        <div>
          <h3 className="font-display text-xl">{guest.name}</h3>
          <p className="text-sm text-muted">{evLabel} · up to {guest.heads} guest{guest.heads > 1 ? "s" : ""}</p>
        </div>
        <label className="label" htmlFor="m-status">Status
          <select id="m-status" className="field normal-case tracking-normal" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option>
          </select>
        </label>
        {status === "accepted" && (
          <label className="label" htmlFor="m-heads">Heads attending
            <input id="m-heads" type="number" min={1} max={guest.heads} className="field" value={heads} onChange={(e) => setHeads(parseInt(e.target.value, 10) || 0)} />
          </label>
        )}
        {status !== "pending" && (
          <label className="label" htmlFor="m-msg">Message
            <textarea id="m-msg" className="field min-h-[70px] normal-case tracking-normal" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
        )}
        {error && <p className="rounded-sm bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className="text-sm text-red-300" disabled={busy} onClick={remove}>
            {confirmDelete ? "Click again to remove guest" : "Remove guest"}
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
