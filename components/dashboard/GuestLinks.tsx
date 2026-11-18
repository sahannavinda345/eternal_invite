"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Guest, Invitation } from "@/lib/types";
import { formatDay, guestLink } from "@/lib/utils";
import CopyButton from "./CopyButton";

const PLACEHOLDERS = ["{name}", "{couple}", "{events}", "{link}", "{date}"];

function defaultTemplate(inv: Invitation) {
  return `Hi {name},

With so much love in our hearts, we're excited to invite you to celebrate our {events} – {couple}.

Your personal invitation:
{link}

${inv.rsvp_by ? `Please reply by ${formatDay(inv.rsvp_by)}. ` : ""}We can't wait to celebrate with you!`;
}

export default function GuestLinks({ invitation: inv }: { invitation: Invitation }) {
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [error, setError] = useState("");
  const [tpl, setTpl] = useState(() => defaultTemplate(inv));
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const ta = useRef<HTMLTextAreaElement>(null);
  const storeKey = `wa-template-${inv.id}`;

  useEffect(() => {
    try { const t = localStorage.getItem(storeKey); if (t) setTpl(t); } catch {}
    createClient().from("guests").select("*, rsvps(*)").eq("invitation_id", inv.id).order("name")
      .then(({ data, error }) => { if (error) setError(error.message); else setGuests(data as Guest[]); });
  }, [inv.id, storeKey]);

  function updateTpl(v: string) {
    setTpl(v);
    try { localStorage.setItem(storeKey, v); } catch {}
  }

  function fill(g: Pick<Guest, "name" | "token" | "events">) {
    const evs = inv.events.filter((e) => g.events.includes(e.key)).map((e) => e.label.toLowerCase());
    return tpl
      .replaceAll("{name}", g.name)
      .replaceAll("{couple}", `${inv.partner1} & ${inv.partner2}`)
      .replaceAll("{events}", evs.join(" and ") || "celebration")
      .replaceAll("{link}", guestLink(inv.slug, g.token))
      .replaceAll("{date}", inv.events[0] ? formatDay(inv.events[0].starts_at.slice(0, 10)) : "");
  }

  function insert(ph: string) {
    const el = ta.current;
    const at = el?.selectionStart ?? tpl.length;
    updateTpl(tpl.slice(0, at) + ph + tpl.slice(at));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(at + ph.length, at + ph.length); });
  }

  const sample = guests?.[0] ?? { name: "Nimal Perera", token: "sample12", events: inv.events.map((e) => e.key) };
  const shown = useMemo(() => (guests ?? []).filter((g) =>
    (filter === "all" || g.events.includes(filter)) && (!q || g.name.toLowerCase().includes(q.toLowerCase()))
  ), [guests, filter, q]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <b>WhatsApp message template</b>
          <button type="button" className="btn" onClick={() => updateTpl(defaultTemplate(inv))}>Reset</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PLACEHOLDERS.map((p) => (
            <button key={p} type="button" className="rounded-sm border border-line px-3 py-1 text-xs hover:border-brand hover:text-brand" onClick={() => insert(p)}>+ {p}</button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <textarea ref={ta} aria-label="Message template" className="field min-h-[220px] leading-relaxed" value={tpl} maxLength={2000} onChange={(e) => updateTpl(e.target.value)} />
          <div>
            <p className="mb-1.5 text-xs text-muted">Preview · as {sample.name} will receive it</p>
            <div className="min-h-[220px] whitespace-pre-wrap rounded-sm border border-line bg-canvas p-3 text-sm">{fill(sample)}</div>
          </div>
        </div>
        <p className="text-xs text-muted">{tpl.length}/2000 · The template is saved in this browser.</p>
      </div>

      {!inv.published && (
        <p className="rounded-sm bg-amber-400/10 p-3 text-sm text-amber-300">Your invitation is still a draft. Publish it from the Overview before sending links, or guests will see “link not valid”.</p>
      )}

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <div className="scroll-row flex gap-2">
            {[{ key: "all", label: "All events" }, ...inv.events].map((e) => (
              <button key={e.key} type="button" onClick={() => setFilter(e.key)}
                className={filter === e.key ? "shrink-0 rounded-sm bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand" : "shrink-0 rounded-sm px-3 py-1.5 text-sm text-muted"}>
                {e.label}
              </button>
            ))}
          </div>
          <input aria-label="Search guests" className="field sm:ml-auto sm:max-w-xs" placeholder="Search guests…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {error ? <p className="p-6 text-sm text-red-300">{error}</p>
          : !guests ? <p className="p-6 text-center text-muted">Loading guests…</p>
          : !shown.length ? <p className="p-6 text-center text-muted">No guests here yet.</p>
          : (
            <>
            {/* Phones: a card per guest with big buttons */}
            <ul className="md:hidden">
              {shown.map((g) => {
                const link = guestLink(inv.slug, g.token);
                return (
                  <li key={g.id} className="flex flex-col gap-2.5 border-b border-line px-4 py-4 last:border-0">
                    <div>
                      <p className="font-medium text-white">{g.name}</p>
                      <p className="text-xs text-muted">{g.grp} · {g.side} · {g.heads} seat{g.heads > 1 ? "s" : ""}{g.phone ? ` · +94 ${g.phone}` : ""}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {inv.events.filter((e) => g.events.includes(e.key)).map((e) => (
                        <span key={e.key} className="rounded-sm border border-line px-2 py-0.5 text-xs text-muted">{e.label}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <CopyButton text={link} label="Copy link" />
                      {g.phone ? (
                        <a className={sent[g.id] ? "btn" : "btn-primary"} target="_blank" rel="noopener"
                          href={`https://wa.me/94${g.phone}?text=${encodeURIComponent(fill(g))}`}
                          onClick={() => setSent((s) => ({ ...s, [g.id]: true }))}>
                          {sent[g.id] ? "Opened ✓" : "WhatsApp"}
                        </a>
                      ) : <span className="grid place-items-center text-xs text-muted">No number</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                    <th className="px-4 py-3 font-semibold">Guest</th><th className="px-4 py-3 font-semibold">Invited to</th>
                    <th className="px-4 py-3 font-semibold">Personal link</th><th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((g) => {
                    const link = guestLink(inv.slug, g.token);
                    return (
                      <tr key={g.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{g.name}</div>
                          <div className="text-xs text-muted">{g.grp} · {g.side} · {g.heads} seat{g.heads > 1 ? "s" : ""}</div>
                        </td>
                        <td className="px-4 py-3">
                          {inv.events.filter((e) => g.events.includes(e.key)).map((e) => (
                            <span key={e.key} className="mr-1 rounded-sm border border-line px-2 py-0.5 text-xs text-muted">{e.label}</span>
                          ))}
                        </td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-xs text-muted">{link}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <span className="inline-flex gap-2">
                            <CopyButton text={link} label="Copy link" />
                            {g.phone ? (
                              <a className={sent[g.id] ? "btn" : "btn-primary"} target="_blank" rel="noopener"
                                href={`https://wa.me/94${g.phone}?text=${encodeURIComponent(fill(g))}`}
                                onClick={() => setSent((s) => ({ ...s, [g.id]: true }))}>
                                {sent[g.id] ? "Opened ✓" : "Send on WhatsApp"}
                              </a>
                            ) : <span className="self-center text-xs text-muted">No number</span>}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
      </div>
    </div>
  );
}
