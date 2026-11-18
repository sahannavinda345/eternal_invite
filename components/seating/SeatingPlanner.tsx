"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Guest, Invitation, SeatTable, SeatingLayout, TableKind } from "@/lib/types";
import { cx, randomKey } from "@/lib/utils";
import { SEAT, WORLD, bounds, initials, seatPositions, tableSize } from "./geometry";

type Plan = { layout: SeatingLayout; published: boolean };
type Drag =
  | { type: "guest"; guestId: string; from?: string; x: number; y: number; started: boolean; sx: number; sy: number }
  | { type: "table"; id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean };

const EMPTY: SeatingLayout = { tables: [], assignments: {} };
const SIDE_COLOR: Record<string, string> = { Bride: "#f3b6c4", Groom: "#a9cdf0", Both: "#ffffff" };

const NEW_TABLE: Record<TableKind, { label: string; seats: number; w?: number; h?: number }> = {
  round: { label: "Table", seats: 8 },
  banquet: { label: "Table", seats: 10 },
  head: { label: "Head table", seats: 6 },
  row: { label: "Chairs", seats: 8 },
  decor: { label: "Dance floor", seats: 0, w: 220, h: 140 },
};

export default function SeatingPlanner({ invitation: inv }: { invitation: Invitation }) {
  const supabase = useMemo(() => createClient(), []);
  const [ev, setEv] = useState(inv.events[0]?.key ?? "");
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [view, setView] = useState<"designer" | "list">("designer");
  const [labels, setLabels] = useState<"initials" | "full">("initials");
  const [zoom, setZoom] = useState(0.7);
  const [selected, setSelected] = useState<string | null>(null); // table id
  const [seatMenu, setSeatMenu] = useState<string | null>(null); // seat key
  const [drag, setDrag] = useState<Drag | null>(null);
  const [toast, setToast] = useState("");
  const [q, setQ] = useState("");
  const [fSide, setFSide] = useState("All");
  const [fGroup, setFGroup] = useState("All");
  const [fRsvp, setFRsvp] = useState("All");
  const [onlyUnseated, setOnlyUnseated] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const savedJson = useRef<Record<string, string>>({});

  const plan: Plan = plans[ev] ?? { layout: EMPTY, published: false };
  const layout = plan.layout;
  const setLayout = useCallback((fn: (l: SeatingLayout) => SeatingLayout) =>
    setPlans((p) => ({ ...p, [ev]: { ...(p[ev] ?? { layout: EMPTY, published: false }), layout: fn((p[ev] ?? { layout: EMPTY }).layout) } })), [ev]);

  /* ---------- load ---------- */
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setView("list");
    (async () => {
      const [{ data: g }, { data: sp }] = await Promise.all([
        supabase.from("guests").select("*, rsvps(*)").eq("invitation_id", inv.id).order("name"),
        supabase.from("seating_plans").select("*").eq("invitation_id", inv.id),
      ]);
      setGuests((g ?? []) as Guest[]);
      const map: Record<string, Plan> = {};
      for (const row of (sp ?? []) as { event_key: string; layout: SeatingLayout; published: boolean }[]) {
        map[row.event_key] = { layout: { tables: row.layout?.tables ?? [], assignments: row.layout?.assignments ?? {} }, published: row.published };
        savedJson.current[row.event_key] = JSON.stringify(map[row.event_key]);
      }
      setPlans(map);
      setLoaded(true);
    })();
  }, [supabase, inv.id]);

  /* ---------- autosave ---------- */
  useEffect(() => {
    if (!loaded || !plans[ev]) return;
    const json = JSON.stringify(plans[ev]);
    if (json === savedJson.current[ev]) return;
    setStatus("dirty");
    const t = setTimeout(async () => {
      setStatus("saving");
      const { error } = await supabase.from("seating_plans").upsert(
        { invitation_id: inv.id, event_key: ev, layout: plans[ev].layout, published: plans[ev].published, updated_at: new Date().toISOString() },
        { onConflict: "invitation_id,event_key" });
      if (error) { setStatus("error"); return; }
      savedJson.current[ev] = json;
      setStatus("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [plans, ev, loaded, supabase, inv.id]);

  /* ---------- guests for this event ---------- */
  const eventGuests = useMemo(() => (guests ?? []).filter((g) => g.events.includes(ev)), [guests, ev]);
  const byId = useMemo(() => Object.fromEntries(eventGuests.map((g) => [g.id, g])), [eventGuests]);
  const rsvpOf = (g: Guest) => g.rsvps?.find((r) => r.event_key === ev);
  const need = (g: Guest) => { const r = rsvpOf(g); return r?.status === "accepted" ? Math.max(1, r.heads) : g.heads; };
  const seatsOf = useCallback((id: string) => Object.entries(layout.assignments).filter(([, v]) => v === id).map(([k]) => k), [layout.assignments]);
  const seatedCount = (id: string) => seatsOf(id).length;
  const groups = useMemo(() => Array.from(new Set(eventGuests.map((g) => g.grp))).sort(), [eventGuests]);

  const shownGuests = eventGuests.filter((g) => {
    const r = rsvpOf(g);
    const rs = r ? (r.status === "accepted" ? "Accepted" : "Declined") : "Pending";
    if (fSide !== "All" && g.side !== fSide) return false;
    if (fGroup !== "All" && g.grp !== fGroup) return false;
    if (fRsvp !== "All" && rs !== fRsvp) return false;
    if (onlyUnseated && seatedCount(g.id) >= need(g)) return false;
    return !q || g.name.toLowerCase().includes(q.toLowerCase());
  });

  const realTables = layout.tables.filter((t) => t.kind !== "decor");
  const totalSeats = realTables.reduce((n, t) => n + t.seats, 0);
  const seatedHeads = Object.values(layout.assignments).filter((id) => byId[id]).length;
  const neededHeads = eventGuests.filter((g) => rsvpOf(g)?.status !== "declined").reduce((n, g) => n + need(g), 0);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2600); }

  /* ---------- seating logic ---------- */
  /** Seat a guest's whole party, starting at a chair and filling the next empty chairs at that table. */
  function seatGuest(guestId: string, seatKey: string) {
    const g = byId[guestId];
    if (!g) return;
    const [tableId, idxStr] = seatKey.split(":");
    const table = layout.tables.find((t) => t.id === tableId);
    if (!table) return;
    setLayout((l) => {
      const a = Object.fromEntries(Object.entries(l.assignments).filter(([, v]) => v !== guestId)); // move the party
      const want = need(g);
      let placed = 0;
      for (let k = 0; k < table.seats && placed < want; k++) {
        const key = `${tableId}:${(Number(idxStr) + k) % table.seats}`;
        if (!a[key]) { a[key] = guestId; placed++; }
      }
      if (placed < want) flash(placed ? `${g.name}: ${placed} of ${want} seated – ${table.label} is full` : `${table.label} is full`);
      return { ...l, assignments: a };
    });
  }

  function unseat(guestId: string) {
    setLayout((l) => ({ ...l, assignments: Object.fromEntries(Object.entries(l.assignments).filter(([, v]) => v !== guestId)) }));
  }

  function firstFreeSeat(t: SeatTable) {
    for (let i = 0; i < t.seats; i++) if (!layout.assignments[`${t.id}:${i}`]) return `${t.id}:${i}`;
    return null;
  }

  /* ---------- tables ---------- */
  function addTable(kind: TableKind) {
    const c = canvas.current;
    const cx0 = c ? (c.scrollLeft + c.clientWidth / 2) / zoom : WORLD.w / 2;
    const cy0 = c ? (c.scrollTop + c.clientHeight / 2) / zoom : WORLD.h / 2;
    const d = NEW_TABLE[kind];
    const n = layout.tables.filter((t) => t.kind !== "decor" && t.kind !== "head" && t.kind !== "row").length + 1;
    const t: SeatTable = {
      id: randomKey(6), kind, seats: d.seats, w: d.w, h: d.h,
      label: kind === "round" || kind === "banquet" ? `${d.label} ${n}` : d.label,
      x: Math.round((cx0 + (layout.tables.length % 4) * 20) / 10) * 10, y: Math.round((cy0 + (layout.tables.length % 4) * 20) / 10) * 10,
    };
    setLayout((l) => ({ ...l, tables: [...l.tables, t] }));
    setSelected(t.id);
  }

  function updateTable(id: string, patch: Partial<SeatTable>) {
    setLayout((l) => {
      const tables = l.tables.map((t) => (t.id === id ? { ...t, ...patch } : t));
      const t = tables.find((x) => x.id === id)!;
      // drop assignments on chairs that no longer exist
      const assignments = Object.fromEntries(Object.entries(l.assignments).filter(([k]) => {
        const [tid, i] = k.split(":");
        return tid !== id || Number(i) < t.seats;
      }));
      return { tables, assignments };
    });
  }

  function removeTable(id: string) {
    setLayout((l) => ({
      tables: l.tables.filter((t) => t.id !== id),
      assignments: Object.fromEntries(Object.entries(l.assignments).filter(([k]) => !k.startsWith(`${id}:`))),
    }));
    setSelected(null);
  }

  function duplicateTable(id: string) {
    const t = layout.tables.find((x) => x.id === id);
    if (!t) return;
    const copy = { ...t, id: randomKey(6), x: t.x + 60, y: t.y + 60, label: t.kind === "round" || t.kind === "banquet" ? `Table ${realTables.length + 1}` : `${t.label} 2` };
    setLayout((l) => ({ ...l, tables: [...l.tables, copy] }));
    setSelected(copy.id);
  }

  function fit() {
    const c = canvas.current;
    if (!c || !layout.tables.length) return;
    const b = layout.tables.map(bounds);
    const x0 = Math.min(...b.map((v) => v.x0)) - 40, y0 = Math.min(...b.map((v) => v.y0)) - 40;
    const x1 = Math.max(...b.map((v) => v.x1)) + 40, y1 = Math.max(...b.map((v) => v.y1)) + 40;
    const z = Math.max(0.35, Math.min(1.4, c.clientWidth / (x1 - x0), c.clientHeight / (y1 - y0)));
    setZoom(z);
    requestAnimationFrame(() => { c.scrollLeft = x0 * z; c.scrollTop = y0 * z; });
  }

  // First visit to the designer: fit what's there
  const fitted = useRef("");
  useEffect(() => {
    if (view === "designer" && loaded && fitted.current !== ev && layout.tables.length) { fitted.current = ev; fit(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, loaded, ev, layout.tables.length]);

  /* ---------- dragging (mouse and touch) ---------- */
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      if (drag.type === "guest") {
        const started = drag.started || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5;
        setDrag({ ...drag, x: e.clientX, y: e.clientY, started });
      } else {
        const dx = (e.clientX - drag.sx) / zoom, dy = (e.clientY - drag.sy) / zoom;
        if (!drag.moved && Math.hypot(dx, dy) < 3) return;
        updateTablePos(drag.id, Math.round((drag.ox + dx) / 10) * 10, Math.round((drag.oy + dy) / 10) * 10);
        if (!drag.moved) setDrag({ ...drag, moved: true });
      }
    };
    const up = (e: PointerEvent) => {
      if (drag.type === "guest") {
        if (drag.started) {
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const seat = el?.closest<HTMLElement>("[data-seat]")?.dataset.seat;
          if (seat) seatGuest(drag.guestId, seat);
          else if (drag.from && el?.closest("[data-unseat]")) unseat(drag.guestId);
        } else if (drag.from) {
          setSeatMenu(drag.from); // a tap on a chair
        }
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  });

  function updateTablePos(id: string, x: number, y: number) {
    setPlans((p) => {
      const cur = p[ev] ?? { layout: EMPTY, published: false };
      return { ...p, [ev]: { ...cur, layout: { ...cur.layout, tables: cur.layout.tables.map((t) => (t.id === id ? { ...t, x, y } : t)) } } };
    });
  }

  function startGuestDrag(e: React.PointerEvent, guestId: string, from?: string) {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDrag({ type: "guest", guestId, from, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, started: false });
  }

  /* ---------- rendering helpers ---------- */
  const seatLabel = (g: Guest) => (labels === "initials" ? initials(g.name) : g.name.split(/\s+/)[0].slice(0, 7));
  const selTable = layout.tables.find((t) => t.id === selected);
  const menuGuest = seatMenu ? byId[layout.assignments[seatMenu]] : null;

  if (!loaded || !guests) return <div className="card p-10 text-center text-muted">Loading seating plan…</div>;

  const guestPanel = (
    <aside data-unseat className="card flex min-h-0 flex-col md:w-72 md:shrink-0" aria-label="Guests">
      <div className="flex items-center justify-between gap-2 border-b border-line p-3">
        <div>
          <p className="text-sm text-white">Guests</p>
          <p className="text-xs text-muted">{seatedHeads}/{neededHeads} seated</p>
        </div>
        <div className="flex border border-line text-[0.62rem] uppercase tracking-[0.14em]">
          {(["initials", "full"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setLabels(v)} className={cx("px-2 py-1", labels === v ? "bg-white text-black" : "text-muted")}>{v === "initials" ? "Initials" : "Names"}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-b border-line p-3">
        <input className="field" placeholder="Search guests" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search guests" />
        {[["Side", ["All", "Bride", "Groom", "Both"], fSide, setFSide], ["Group", ["All", ...groups], fGroup, setFGroup], ["RSVP", ["All", "Accepted", "Pending", "Declined"], fRsvp, setFRsvp]].map(([label, opts, val, set]) => (
          <div key={label as string} className="scroll-row flex items-center gap-1">
            <span className="w-11 shrink-0 text-[0.58rem] uppercase tracking-[0.16em] text-muted">{label as string}</span>
            {(opts as string[]).map((o) => (
              <button key={o} type="button" onClick={() => (set as (v: string) => void)(o)}
                className={cx("shrink-0 border px-2 py-0.5 text-xs", val === o ? "border-white bg-white text-black" : "border-line text-muted")}>{o}</button>
            ))}
          </div>
        ))}
        <label className="flex items-center gap-2 text-xs text-muted" htmlFor="only-unseated">
          <input id="only-unseated" type="checkbox" className="accent-white" checked={onlyUnseated} onChange={(e) => setOnlyUnseated(e.target.checked)} /> Only show guests without seats
        </label>
      </div>
      <ul className="max-h-[230px] min-h-0 flex-1 overflow-y-auto p-2 md:max-h-[520px]">
        {shownGuests.map((g) => {
          const s = seatedCount(g.id), n = need(g), r = rsvpOf(g);
          return (
            <li key={g.id}>
              <div onPointerDown={(e) => (e.pointerType === "mouse" ? startGuestDrag(e, g.id) : undefined)}
                className={cx("mb-1.5 flex cursor-grab select-none items-center gap-2 border p-2 text-sm active:cursor-grabbing", s >= n ? "border-line opacity-60" : "border-white/20", r?.status === "declined" && "opacity-40")}>
                <span onPointerDown={(e) => startGuestDrag(e, g.id)} className="touch-none px-1 text-muted" aria-hidden="true">⋮⋮</span>
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: SIDE_COLOR[g.side] ?? "#fff" }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-white">{g.name}</span>
                  <span className="text-[0.62rem] text-muted">{g.grp} · {r ? (r.status === "accepted" ? "Coming" : "Declined") : "Pending"}</span>
                </span>
                <span className={cx("shrink-0 border px-1.5 text-[0.62rem] tabular-nums", s >= n ? "border-emerald-400/40 text-emerald-300" : "border-line text-muted")}>{s}/{n}</span>
              </div>
            </li>
          );
        })}
        {!shownGuests.length && <li className="p-6 text-center text-xs text-muted">{eventGuests.length ? "No guests match." : "Add guests first, then seat them here."}</li>}
      </ul>
      <p className="hidden border-t border-line p-2 text-center text-[0.6rem] text-muted md:block">Drag a guest onto a chair · drag a chair back here to unseat</p>
    </aside>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- top controls ---------- */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {inv.events.length > 1 && (
          <div className="inline-flex border border-line p-0.5">
            {inv.events.map((e) => (
              <button key={e.key} type="button" onClick={() => { setEv(e.key); setSelected(null); setSeatMenu(null); }}
                className={cx("px-3 py-1.5 text-sm", ev === e.key ? "bg-white/10 text-white" : "text-muted")}>{e.label}</button>
            ))}
          </div>
        )}
        <p className="text-xs text-muted">{realTables.length} tables · {seatedHeads}/{neededHeads} guests seated · {totalSeats} seats</p>
        <span className={cx("text-[0.6rem] uppercase tracking-[0.18em]", status === "error" ? "text-red-300" : status === "saved" ? "text-emerald-300" : "text-muted")}>
          {status === "saving" ? "Saving…" : status === "dirty" ? "Unsaved" : status === "error" ? "Not saved" : "Saved"}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="inline-flex border border-line p-0.5">
            {(["list", "designer"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} className={cx("px-3 py-1.5 text-xs uppercase tracking-[0.14em]", view === v ? "bg-white text-black" : "text-muted")}>{v === "list" ? "List" : "Designer"}</button>
            ))}
          </div>
          <button type="button" className="btn" onClick={() => window.print()}>Print</button>
          <button type="button" className={plan.published ? "btn" : "btn-primary"}
            onClick={() => setPlans((p) => ({ ...p, [ev]: { ...plan, published: !plan.published } }))}>
            {plan.published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>
      {plan.published && <p className="-mt-2 text-xs text-emerald-300 print:hidden">Published: guests see their table on their invitation.</p>}

      {/* ---------- designer ---------- */}
      {view === "designer" ? (
        <div className="flex flex-col gap-3 md:flex-row print:hidden">
          {guestPanel}
          <div className="card relative flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="scroll-row flex items-center gap-1.5 border-b border-line p-2">
              {([["round", "Round table"], ["banquet", "Banquet table"], ["head", "Head table"], ["row", "Chair row"], ["decor", "Decor area"]] as const).map(([k, l]) => (
                <button key={k} type="button" className="btn min-h-[34px] shrink-0 px-3 py-1.5" onClick={() => addTable(k)}>+ {l}</button>
              ))}
            </div>
            <div ref={canvas} className="relative h-[62vh] min-h-[420px] overflow-auto bg-[#0e0e0e]"
              onPointerDown={(e) => { if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.world) { setSelected(null); setSeatMenu(null); } }}>
              <div style={{ width: WORLD.w * zoom, height: WORLD.h * zoom }} className="relative">
                <div data-world="1" className="absolute left-0 top-0 origin-top-left"
                  style={{
                    width: WORLD.w, height: WORLD.h, transform: `scale(${zoom})`,
                    backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}>
                  {layout.tables.map((t) => {
                    const { w, h } = tableSize(t);
                    const isSel = selected === t.id;
                    const filled = seatPositions(t).filter((_, i) => layout.assignments[`${t.id}:${i}`]).length;
                    return (
                      <div key={t.id} className="absolute" style={{ left: t.x, top: t.y }}>
                        {/* table top */}
                        <div
                          onPointerDown={(e) => { if (e.button !== 0) return; e.stopPropagation(); setSelected(t.id); setSeatMenu(null); setDrag({ type: "table", id: t.id, sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y, moved: false }); }}
                          className={cx("absolute flex cursor-move touch-none select-none flex-col items-center justify-center text-center",
                            t.kind === "decor" ? "border border-dashed border-white/30 bg-white/[0.03]" : t.kind === "row" ? "" : "border bg-white/[0.07]",
                            t.kind === "round" && "rounded-full", (t.kind === "banquet" || t.kind === "head") && "rounded-md",
                            isSel ? "border-white shadow-[0_0_0_3px_rgba(255,255,255,.15)]" : "border-white/35")}
                          style={{ left: -w / 2, top: -h / 2, width: w, height: t.kind === "row" ? SEAT : h, marginTop: t.kind === "row" ? -SEAT / 2 + h / 2 : 0 }}>
                          {t.kind !== "row" && (
                            <>
                              <span className="max-w-full truncate px-1 text-[11px] text-white">{t.label}</span>
                              {t.kind !== "decor" && <span className="text-[9px] text-white/50">{filled}/{t.seats}</span>}
                            </>
                          )}
                        </div>
                        {t.kind === "row" && <span className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] text-white/60" style={{ top: SEAT / 2 + 4 }}>{t.label}</span>}
                        {/* chairs */}
                        {seatPositions(t).map((p, i) => {
                          const key = `${t.id}:${i}`;
                          const g = byId[layout.assignments[key]];
                          const hl = drag?.type === "guest" && drag.started && !g;
                          return (
                            <button key={key} type="button" data-seat={key}
                              onPointerDown={(e) => { if (g) startGuestDrag(e, g.id, key); else { e.stopPropagation(); setSeatMenu(null); } }}
                              title={g ? g.name : `${t.label} · seat ${i + 1}`}
                              className={cx("absolute grid touch-none select-none place-items-center rounded-full border text-[9px] font-semibold leading-none",
                                g ? "border-transparent text-black" : "border-dashed border-white/30 text-white/40", hl && "border-white/70 bg-white/10",
                                seatMenu === key && "ring-2 ring-white")}
                              style={{ left: p.x - SEAT / 2, top: p.y - SEAT / 2, width: SEAT, height: SEAT, background: g ? SIDE_COLOR[g.side] ?? "#fff" : undefined }}>
                              {g ? seatLabel(g) : i + 1}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  {/* chair menu */}
                  {seatMenu && menuGuest && (() => {
                    const [tid, i] = seatMenu.split(":");
                    const t = layout.tables.find((x) => x.id === tid);
                    if (!t) return null;
                    const p = seatPositions(t)[Number(i)];
                    return (
                      <div className="absolute z-10 w-48 border border-line bg-surface p-3 text-left shadow-xl" style={{ left: t.x + p.x + 18, top: t.y + p.y - 10 }}
                        onPointerDown={(e) => e.stopPropagation()}>
                        <p className="text-sm text-white">{menuGuest.name}</p>
                        <p className="mb-2 text-xs text-muted">{t.label} · {seatedCount(menuGuest.id)} of {need(menuGuest)} seated</p>
                        <button type="button" className="btn w-full" onClick={() => { unseat(menuGuest.id); setSeatMenu(null); }}>Unseat party</button>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {!layout.tables.length && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
                  Add a round or banquet table above, then drag guests from the list onto the chairs.
                </div>
              )}
            </div>
            {/* zoom */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 border border-line bg-surface/95 p-1 text-xs">
              <button type="button" className="h-8 w-8" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.1).toFixed(2)))}>−</button>
              <span className="w-10 text-center tabular-nums text-muted">{Math.round(zoom * 100)}%</span>
              <button type="button" className="h-8 w-8" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}>+</button>
              <button type="button" className="h-8 px-2 text-[0.6rem] uppercase tracking-[0.14em] text-muted" onClick={fit}>Fit</button>
            </div>
            {/* selected table */}
            {selTable && (
              <div className="absolute right-3 top-[58px] flex w-[min(280px,calc(100%-1.5rem))] flex-col gap-2 border border-line bg-surface/95 p-3 shadow-xl backdrop-blur" onPointerDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <input aria-label="Table name" className="field" value={selTable.label} onChange={(e) => updateTable(selTable.id, { label: e.target.value })} />
                  <button type="button" className="text-xl text-muted" aria-label="Close" onClick={() => setSelected(null)}>×</button>
                </div>
                {selTable.kind === "decor" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="label" htmlFor="dw">Width<input id="dw" type="number" min={60} max={1200} step={10} className="field" value={selTable.w ?? 220} onChange={(e) => updateTable(selTable.id, { w: Number(e.target.value) })} /></label>
                    <label className="label" htmlFor="dh">Height<input id="dh" type="number" min={40} max={900} step={10} className="field" value={selTable.h ?? 140} onChange={(e) => updateTable(selTable.id, { h: Number(e.target.value) })} /></label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted">Seats</span>
                    <button type="button" className="btn min-h-[32px] px-3 py-1" onClick={() => updateTable(selTable.id, { seats: Math.max(1, selTable.seats - 1) })}>−</button>
                    <span className="w-6 text-center tabular-nums">{selTable.seats}</span>
                    <button type="button" className="btn min-h-[32px] px-3 py-1" onClick={() => updateTable(selTable.id, { seats: Math.min(selTable.kind === "row" ? 30 : 20, selTable.seats + 1) })}>+</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" className="btn flex-1 px-2" onClick={() => duplicateTable(selTable.id)}>Duplicate</button>
                  <button type="button" className="btn flex-1 border-red-400/40 px-2 text-red-300" onClick={() => removeTable(selTable.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ---------- list view ---------- */
        <div className="flex flex-col gap-4 print:hidden">
          <div className="scroll-row flex gap-1.5">
            {([["round", "Round table"], ["banquet", "Banquet table"], ["head", "Head table"], ["row", "Chair row"]] as const).map(([k, l]) => (
              <button key={k} type="button" className="btn shrink-0" onClick={() => addTable(k)}>+ {l}</button>
            ))}
          </div>
          {!realTables.length && <div className="card p-8 text-center text-sm text-muted">Add a table to start seating guests.</div>}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {realTables.map((t) => {
              const unseated = eventGuests.filter((g) => rsvpOf(g)?.status !== "declined" && seatedCount(g.id) < need(g));
              const free = firstFreeSeat(t);
              return (
                <section key={t.id} className="card flex flex-col">
                  <div className="flex items-center gap-2 border-b border-line p-3">
                    <input aria-label="Table name" className="min-w-0 flex-1 bg-transparent text-white outline-none" value={t.label} onChange={(e) => updateTable(t.id, { label: e.target.value })} />
                    <span className="text-xs tabular-nums text-muted">{Object.keys(layout.assignments).filter((k) => k.startsWith(`${t.id}:`) && byId[layout.assignments[k]]).length}/{t.seats}</span>
                    <button type="button" className="h-8 w-8 border border-line" aria-label="Fewer seats" onClick={() => updateTable(t.id, { seats: Math.max(1, t.seats - 1) })}>−</button>
                    <button type="button" className="h-8 w-8 border border-line" aria-label="More seats" onClick={() => updateTable(t.id, { seats: Math.min(t.kind === "row" ? 30 : 20, t.seats + 1) })}>+</button>
                  </div>
                  <ol className="flex-1 text-sm">
                    {Array.from({ length: t.seats }, (_, i) => {
                      const g = byId[layout.assignments[`${t.id}:${i}`]];
                      return (
                        <li key={i} className="flex items-center gap-2 border-b border-line/60 px-3 py-2 last:border-0">
                          <span className="w-5 text-xs tabular-nums text-muted">{i + 1}</span>
                          {g ? (
                            <>
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: SIDE_COLOR[g.side] }} aria-hidden="true" />
                              <span className="min-w-0 flex-1 truncate text-white">{g.name}</span>
                              <button type="button" className="text-muted hover:text-red-300" aria-label={`Unseat ${g.name}`} onClick={() => unseat(g.id)}>×</button>
                            </>
                          ) : <span className="text-muted/60">Empty</span>}
                        </li>
                      );
                    })}
                  </ol>
                  <div className="flex gap-2 border-t border-line p-3">
                    <select aria-label={`Seat a guest at ${t.label}`} className="field flex-1" value="" disabled={!free}
                      onChange={(e) => { if (e.target.value && free) seatGuest(e.target.value, free); }}>
                      <option value="">{free ? "Seat a guest…" : "Table is full"}</option>
                      {unseated.map((g) => <option key={g.id} value={g.id}>{g.name} ({need(g) - seatedCount(g.id)} to seat)</option>)}
                    </select>
                    <button type="button" className="btn border-red-400/40 px-3 text-red-300" aria-label={`Delete ${t.label}`} onClick={() => removeTable(t.id)}>×</button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- printed seating chart ---------- */}
      <div className="hidden text-black print:block">
        <h1 className="mb-1 text-2xl font-semibold">{inv.partner1} &amp; {inv.partner2} – seating plan</h1>
        <p className="mb-4 text-sm">{inv.events.find((e) => e.key === ev)?.label}</p>
        <div className="grid grid-cols-3 gap-4">
          {realTables.map((t) => (
            <div key={t.id} className="break-inside-avoid border border-black/30 p-3">
              <p className="mb-1 font-semibold">{t.label}</p>
              <ol className="text-sm">
                {Array.from({ length: t.seats }, (_, i) => byId[layout.assignments[`${t.id}:${i}`]]).map((g, i) => (
                  <li key={i}>{i + 1}. {g ? g.name : "—"}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* drag ghost */}
      {drag?.type === "guest" && drag.started && byId[drag.guestId] && (
        <div className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold text-black shadow-xl"
          style={{ left: drag.x, top: drag.y, background: SIDE_COLOR[byId[drag.guestId].side] ?? "#fff" }}>
          {byId[drag.guestId].name} · {need(byId[drag.guestId])}
        </div>
      )}
      {toast && <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 border border-line bg-surface px-4 py-2 text-sm text-white shadow-xl md:bottom-6" role="status">{toast}</div>}
      <p className="text-[0.62rem] text-muted print:hidden">
        Chair colours: <span style={{ color: SIDE_COLOR.Bride }}>● Bride&apos;s side</span> · <span style={{ color: SIDE_COLOR.Groom }}>● Groom&apos;s side</span> · <span>● Both</span>
      </p>
    </div>
  );
}
