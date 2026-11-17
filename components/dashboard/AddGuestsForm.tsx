"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EventItem } from "@/lib/types";
import { normalisePhone } from "@/lib/utils";

const GROUPS = ["Family", "Friends", "Office", "Neighbors", "VIP", "Other"];
const SIDES = ["Bride", "Groom", "Both"];
type Row = { name: string; phone: string; heads: number; grp: string; side: string };
const blank = (): Row => ({ name: "", phone: "", heads: 1, grp: "Family", side: "Both" });

/** Parse pasted lines: "Name, 0712345678, 2" (phone and heads optional) */
function parsePaste(text: string): Row[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, phone = "", heads = "1"] = l.split(/[,\t]/).map((s) => s.trim());
    return { ...blank(), name, phone, heads: Math.min(20, Math.max(1, parseInt(heads, 10) || 1)) };
  });
}

export default function AddGuestsForm({ invitationId, events }: { invitationId: string; events: EventItem[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([blank()]);
  const [invite, setInvite] = useState<string[]>(events.slice(0, 1).map((e) => e.key));
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setRow = (i: number, p: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const filled = rows.filter((r) => r.name.trim());

  async function save() {
    setMsg(null);
    if (!filled.length) return setMsg({ ok: false, text: "Enter at least one name." });
    if (!invite.length) return setMsg({ ok: false, text: "Tick at least one event to invite these guests to." });
    const bad = filled.find((r) => normalisePhone(r.phone) === null);
    if (bad) return setMsg({ ok: false, text: `Check the WhatsApp number for ${bad.name}. Use a Sri Lankan mobile like 071 234 5678.` });
    setBusy(true);
    const { error } = await createClient().from("guests").insert(
      filled.map((r) => ({
        invitation_id: invitationId, name: r.name.trim(), phone: normalisePhone(r.phone) || null,
        heads: r.heads, grp: r.grp, side: r.side, events: invite,
      }))
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: `Saved ${filled.length} guest${filled.length > 1 ? "s" : ""}. Send their links from Guest list & links.` });
    setRows([blank()]);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center gap-4 p-4">
        <b className="text-sm">Invite to:</b>
        {events.map((e) => (
          <label key={e.key} className="flex items-center gap-2 text-sm" htmlFor={`inv-${e.key}`}>
            <input id={`inv-${e.key}`} type="checkbox" className="h-4 w-4 accent-white" checked={invite.includes(e.key)}
              onChange={(ev) => setInvite((v) => (ev.target.checked ? [...v, e.key] : v.filter((k) => k !== e.key)))} />
            {e.label}
          </label>
        ))}
      </div>

      <div className="card overflow-x-auto p-4">
        <div className="grid min-w-[760px] grid-cols-[28px_2fr_1.5fr_110px_1fr_1fr_32px] items-center gap-2">
          {["#", "Name *", "WhatsApp", "Heads", "Category", "Side", ""].map((h) => (
            <div key={h} className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">{h}</div>
          ))}
          {rows.map((r, i) => (
            <div key={i} className="contents">
              <div className="text-sm text-muted">{i + 1}</div>
              <input aria-label={`Name ${i + 1}`} className="field" placeholder="Full name" value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} />
              <div className="flex items-center overflow-hidden rounded-sm border border-line bg-canvas">
                <span className="border-r border-line px-2 text-sm text-muted">+94</span>
                <input aria-label={`WhatsApp ${i + 1}`} inputMode="tel" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" placeholder="71 234 5678"
                  value={r.phone} onChange={(e) => setRow(i, { phone: e.target.value })} />
              </div>
              <div className="flex items-center rounded-sm border border-line bg-canvas">
                <button type="button" aria-label="Fewer" className="px-2.5 py-2" onClick={() => setRow(i, { heads: Math.max(1, r.heads - 1) })}>−</button>
                <span className="flex-1 text-center text-sm tabular-nums">{r.heads}</span>
                <button type="button" aria-label="More" className="px-2.5 py-2" onClick={() => setRow(i, { heads: Math.min(20, r.heads + 1) })}>+</button>
              </div>
              <select aria-label={`Category ${i + 1}`} className="field" value={r.grp} onChange={(e) => setRow(i, { grp: e.target.value })}>
                {GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
              <select aria-label={`Side ${i + 1}`} className="field" value={r.side} onChange={(e) => setRow(i, { side: e.target.value })}>
                {SIDES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button type="button" aria-label="Remove row" className="text-lg text-muted hover:text-red-300"
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, j) => j !== i) : [blank()]))}>×</button>
            </div>
          ))}
        </div>
      </div>

      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-medium">Paste a list from Excel or Google Sheets</summary>
        <p className="mt-2 text-sm text-muted">One guest per line: name, WhatsApp number, heads. Copy three columns from a spreadsheet and paste them here.</p>
        <textarea className="field mt-2 min-h-[110px]" value={paste} onChange={(e) => setPaste(e.target.value)}
          placeholder={"Nimal Perera, 0771234567, 2\nChamari Dissanayake, 0712345678, 3"} />
        <button type="button" className="btn mt-2" onClick={() => {
          const parsed = parsePaste(paste);
          if (parsed.length) { setRows((rs) => [...rs.filter((r) => r.name.trim()), ...parsed]); setPaste(""); }
        }}>Add to rows</button>
      </details>

      {msg && <p className={msg.ok ? "rounded-sm bg-emerald-400/10 p-3 text-sm text-emerald-300" : "rounded-sm bg-red-400/10 p-3 text-sm text-red-300"}>{msg.text}</p>}

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="btn" onClick={() => setRows((rs) => [...rs, blank()])}>+ Row</button>
        <button type="button" className="btn-primary" disabled={busy} onClick={save}>
          {busy ? "Saving…" : `Save ${filled.length || ""} guest${filled.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
