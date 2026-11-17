"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventItem, GuestView, RsvpStatus } from "@/lib/types";
import { TONES, type Tone } from "./tones";

type Props = {
  slug: string; token: string; guest: GuestView; events: EventItem[]; rsvpBy?: string | null;
  /** Editor preview: replies are not sent. */
  demo?: boolean;
  tone?: Tone;
  /** Hide the built-in "Kindly reply" heading when the design shows its own. */
  showHeading?: boolean;
};

type Draft = { status: RsvpStatus | null; heads: number; message: string; saved: boolean; busy: boolean; error: string };

export default function RsvpSection({ slug, token, guest, events, rsvpBy, demo = false, tone = "gold", showHeading = true }: Props) {
  const t = TONES[tone];
  const mine = events.filter((e) => guest.events.includes(e.key));
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      mine.map((e) => {
        const r = guest.rsvps.find((x) => x.event_key === e.key);
        return [e.key, { status: r?.status ?? null, heads: r?.heads || guest.heads, message: r?.message ?? "", saved: !!r, busy: false, error: "" }];
      })
    )
  );

  const set = (k: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [k]: { ...d[k], ...patch } }));

  async function send(k: string) {
    const d = drafts[k];
    if (!d.status) return set(k, { error: "Choose accept or decline first." });
    if (d.status === "accepted" && (d.heads < 1 || d.heads > guest.heads))
      return set(k, { error: `Guests attending must be between 1 and ${guest.heads}.` });
    if (demo) return set(k, { saved: true, error: "" });
    set(k, { busy: true, error: "" });
    const { error } = await createClient().rpc("submit_rsvp", {
      p_slug: slug, p_token: token, p_event: k, p_status: d.status,
      p_heads: d.status === "accepted" ? d.heads : 0, p_message: d.message,
    });
    if (error) set(k, { busy: false, error: "Your reply couldn't be saved. Please try again, or message the couple on WhatsApp." });
    else set(k, { busy: false, saved: true });
  }

  if (!mine.length) return null;

  return (
    <section className="flex flex-col gap-5">
      {showHeading ? <h2 className={t.heading}>Kindly reply{rsvpBy ? ` by ${rsvpBy}` : ""}</h2> : rsvpBy ? <p className={`text-center ${t.label}`}>Please reply by {rsvpBy}</p> : null}
      {mine.map((e) => {
        const d = drafts[e.key];
        return (
          <div key={e.key} className={t.card}>
            <p className={t.label}>{e.label}</p>
            {d.saved ? (
              <div className={t.doneBox}>
                <b className={t.doneTitle}>{d.status === "accepted" ? "See you there!" : "Thank you for letting us know"}</b>
                <p className={t.muted}>
                  {d.status === "accepted" ? `Reply saved for ${d.heads} guest${d.heads > 1 ? "s" : ""}.` : "We'll miss you."}
                </p>
                <button type="button" onClick={() => set(e.key, { saved: false })} className={t.ghostBtn}>Change reply</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {([["accepted", "Joyfully accept"], ["declined", "Regretfully decline"]] as const).map(([v, label]) => (
                    <button key={v} type="button" aria-pressed={d.status === v} onClick={() => set(e.key, { status: v, error: "" })}
                      className={d.status === v ? t.optOn : t.optOff}>
                      {label}
                    </button>
                  ))}
                </div>
                {d.status === "accepted" && guest.heads > 1 && (
                  <label className={t.fieldLabel} htmlFor={`heads-${e.key}`}>
                    Guests attending (up to {guest.heads})
                    <input id={`heads-${e.key}`} type="number" min={1} max={guest.heads} value={d.heads}
                      onChange={(ev) => set(e.key, { heads: parseInt(ev.target.value, 10) || 0 })} className={t.input} />
                  </label>
                )}
                <label className={t.fieldLabel} htmlFor={`msg-${e.key}`}>
                  A note for the couple (optional)
                  <textarea id={`msg-${e.key}`} maxLength={500} value={d.message}
                    onChange={(ev) => set(e.key, { message: ev.target.value })} className={`min-h-[70px] ${t.input}`} />
                </label>
                {d.error && <p className={t.error}>{d.error}</p>}
                <button type="button" disabled={d.busy} onClick={() => send(e.key)} className={t.send}>
                  {d.busy ? "Sending…" : "Send reply"}
                </button>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
