"use client";
/**
 * Story engine: the invitation plays like a short film. Each part is a full-screen scene;
 * its words write themselves in (letter by letter, soft blur) when the guest scrolls to it.
 * The four Story templates only supply the look: background, scene frame, colours, opening.
 */
import { useEffect, useRef, useState } from "react";
import Countdown from "@/components/invitation/Countdown";
import Gallery from "@/components/invitation/Gallery";
import RsvpSection from "@/components/invitation/RsvpSection";
import VenueMap from "@/components/invitation/VenueMap";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import IntroVideo from "@/components/invitation/IntroVideo";
import BottomNav from "@/components/invitation/BottomNav";
import type { DesignProps } from "../types";
import type { Tone } from "@/components/invitation/tones";
import type { EventItem, GuestView, Invitation } from "@/lib/types";
import { formatDay, visibleSections } from "@/lib/utils";
import { Icon } from "./art";

/* ---------------- text that writes itself ---------------- */

/** Letter-by-letter blur-in. Words never break in the middle. */
export function Letters({ text, className, style, delay = 0, step = 0.04 }: { text: string; className?: string; style?: React.CSSProperties; delay?: number; step?: number }) {
  let n = 0;
  return (
    <span className={className} style={style} aria-label={text} role="text">
      {text.split(/(\s+)/).map((w, i) => /^\s+$/.test(w) ? " " : (
        <span key={i} className="inline-block whitespace-nowrap" aria-hidden="true">
          {Array.from(w).map((c, k) => <span key={k} className="st-l" style={{ animationDelay: `${(delay + n++ * step).toFixed(2)}s` }}>{c}</span>)}
        </span>
      ))}
    </span>
  );
}

/** Word-by-word blur-in, for longer lines. */
export function Words({ text, className, style, delay = 0, step = 0.06 }: { text: string; className?: string; style?: React.CSSProperties; delay?: number; step?: number }) {
  return (
    <span className={className} style={style}>
      {text.split(/\s+/).filter(Boolean).map((w, i) => <span key={i}><span className="st-w" style={{ animationDelay: `${(delay + i * step).toFixed(2)}s` }}>{w}</span>{" "}</span>)}
    </span>
  );
}

/** Fades a block in (blur → sharp) after a delay. */
export function Fade({ children, delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "p" | "span" }) {
  return <Tag className={`st-fade ${className}`} style={{ animationDelay: `${delay}s` }}>{children}</Tag>;
}

/* ---------------- scene ---------------- */

/** A full-screen part of the story. Its animations wait until it scrolls into view. */
export function Scene({ children, id, preview, className = "", style }: { children: React.ReactNode; id?: string; preview?: boolean; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} className={`st-scene relative flex scroll-mt-0 flex-col items-center justify-center ${preview ? "min-h-[620px]" : "min-h-[100svh]"} ${className}`} style={style}>
      {children}
    </section>
  );
}

/* ---------------- opening ---------------- */

export type Stage = "cover" | "opening" | "intro" | "open";

/** Cover → opening animation → (intro video) → invitation. Music starts on the tap. */
export function useOpening(inv: Invitation, ms = 1800) {
  const [stage, setStage] = useState<Stage>("cover");
  function open() {
    if (stage !== "cover") return;
    setStage("opening");
    if (!inv.intro_video) announceOpen();
    setTimeout(() => setStage(inv.intro_video ? "intro" : "open"), ms);
  }
  return { stage, open, done: () => { setStage("open"); announceOpen(); } };
}

/* ---------------- dates ---------------- */

const fmt = (iso: string | null | undefined, o: Intl.DateTimeFormatOptions) =>
  iso && !Number.isNaN(new Date(iso).getTime()) ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", ...o }).format(new Date(iso)) : "";
export const dateParts = (iso?: string | null) => ({
  weekday: fmt(iso, { weekday: "long" }), day: fmt(iso, { day: "numeric" }), month: fmt(iso, { month: "long" }), year: fmt(iso, { year: "numeric" }),
  time: fmt(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase(),
  full: fmt(iso, { day: "numeric", month: "long", year: "numeric" }),
});

/** Month calendar with the wedding day circled by a hand-drawn heart. */
export function Calendar({ iso, ink, accent, heading }: { iso: string; ink: string; accent: string; heading: string }) {
  const p = dateParts(iso);
  if (!p.day) return null;
  const y = Number(p.year), m = new Date(`${p.month} 1, ${y}`).getMonth();
  const startDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="w-full max-w-[300px]" style={{ color: ink }}>
      <Letters text={`${p.month} ${p.year}`.toUpperCase()} className={heading} delay={0.5} />
      <div className="mt-4 grid grid-cols-7 gap-y-2.5 text-center">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => <Fade key={d} delay={0.9 + i * 0.04} className="text-[0.55rem] tracking-[0.08em] opacity-80">{d}</Fade>)}
        {cells.map((d, i) => (
          <Fade key={i} delay={1.1 + i * 0.025} className="relative font-serif text-[1.05rem] leading-7 tabular-nums">
            {d}
            {d === Number(p.day) && (
              <svg viewBox="0 0 40 36" className="pointer-events-none absolute left-1/2 top-1/2 h-11 w-12 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
                <path d="M20 33C8 25 2 18 3 11 4 4 12 1 20 9 28 1 36 4 37 11 38 18 32 25 20 33Z" fill="none" stroke={accent} strokeWidth="1.6" pathLength={1}
                  className="st-anim" style={{ strokeDasharray: 1, animation: "st-draw 1.4s ease-in-out 2.1s both" }} />
              </svg>
            )}
          </Fade>
        ))}
      </div>
    </div>
  );
}

/* ---------------- the scenes ---------------- */

export type StoryLook = {
  ink: string; accent: string; muted: string; line: string;
  caps: string;   // engraved capitals heading class
  script: string; // script class
  body: string;   // serif body class
  tone: Tone;     // RSVP + countdown colours
  frame: string;  // photo frame class (gallery, map)
  button: string; // map button
  /** "arch": the couple photo sits in an arched frame with the date under it; "full": full-screen photo. */
  photo: "arch" | "full";
  /** Names in engraved capitals (default) or large script with a soft ampersand. */
  names?: "caps" | "script";
};

type Props = {
  inv: Invitation; guest: GuestView | null; token: string | null; preview: boolean; look: StoryLook;
  /** Wraps each scene's content (arch panel, deckled card, …). */
  Frame: (p: { children: React.ReactNode; kind: string }) => React.ReactNode;
  /** The last scene (wreath, monogram…). */
  closing: React.ReactNode;
};

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function StoryScenes({ inv, guest, token, preview, look: L, Frame, closing }: Props) {
  const first = inv.events[0];
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const sections = visibleSections(inv.sections);
  const photo = inv.cover_photo || inv.gallery?.[0] || null;
  const d = dateParts(first?.starts_at);
  const divider = <span className="my-1 block h-px w-10" style={{ background: L.line }} />;
  const H = ({ kicker, title }: { kicker?: string; title: string }) => (
    <div className="flex flex-col items-center gap-1">
      {kicker && <Letters text={kicker} className={`${L.script} text-[2.3rem] leading-none`} style={{ color: L.accent }} delay={0.1} step={0.05} />}
      <Letters text={title.toUpperCase()} className={`${L.caps} text-[1.05rem]`} delay={0.5} />
    </div>
  );

  const eventScene = (e: EventItem, i: number) => {
    const p = dateParts(e.starts_at);
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <H kicker={i === 0 ? "Join us for" : "and"} title={e.title || e.label} />
        {[["calendar", [p.weekday, `${p.day} ${p.month} ${p.year}`.trim()].filter(Boolean).join(", ")], ["pin", e.venue], ["clock", p.time === "12:00 AM" ? "" : p.time]]
          .filter(([, v]) => v).map(([icon, v], k) => (
            <Fade key={icon} delay={0.9 + k * 0.45} className="flex flex-col items-center gap-2">
              <span style={{ color: L.accent }}><Icon name={icon as "pin"} /></span>
              <span className={`${L.caps} max-w-[24ch] text-[0.78rem] leading-relaxed`}>{v}</span>
            </Fade>
          ))}
        {e.note && <Fade delay={2.2} className={`${L.body} text-base italic`}>{e.note}</Fade>}
        {e.venue && (
          <Fade delay={2.4}>
            <a href={mapsUrl(e.venue)} target="_blank" rel="noopener" className={L.button}><Icon name="pin" className="h-4 w-4" /> Directions</a>
          </Fade>
        )}
      </div>
    );
  };

  const scenes: { key: string; kind: string; id?: string; node: React.ReactNode }[] = [];
  for (const s of sections) {
    if (s === "hero") {
      scenes.push({
        key: "invite", kind: "invite", id: "ec-home", node: (
          <div className="flex flex-col items-center gap-3 text-center">
            {inv.families && <Words text={inv.families} className={`${L.caps} max-w-[30ch] text-[0.62rem] leading-[1.9]`} style={{ color: L.muted }} delay={0.2} step={0.05} />}
            <Letters text={(first?.title || first?.label || "Wedding ceremony").toUpperCase()} className={`${L.caps} mt-2 text-[1.15rem]`} style={{ color: L.accent }} delay={1.2} />
            {divider}
            {L.names === "script"
              ? <Letters text={inv.partner1 || "Partner"} className={`${L.script} text-[3.4rem] leading-[1.05]`} style={{ color: L.accent }} delay={1.9} step={0.09} />
              : <Letters text={(inv.partner1 || "Partner").toUpperCase()} className={`${L.caps} text-[1.6rem]`} delay={1.9} step={0.07} />}
            {inv.partner1_parents && <Fade delay={2.5} className={`${L.caps} text-[0.58rem]`}><span style={{ color: L.muted }}>{inv.partner1_parents}</span></Fade>}
            {L.names === "script"
              ? <Fade delay={2.7} className="-my-3 font-serif text-5xl font-light leading-none opacity-40">&amp;</Fade>
              : <Letters text="with" className={`${L.script} text-4xl leading-none`} style={{ color: L.accent }} delay={2.7} step={0.1} />}
            {L.names === "script"
              ? <Letters text={inv.partner2 || "Partner"} className={`${L.script} text-[3.4rem] leading-[1.05]`} style={{ color: L.accent }} delay={3.1} step={0.09} />
              : <Letters text={(inv.partner2 || "Partner").toUpperCase()} className={`${L.caps} text-[1.6rem]`} delay={3.1} step={0.07} />}
            {inv.partner2_parents && <Fade delay={3.7} className={`${L.caps} text-[0.58rem]`}><span style={{ color: L.muted }}>{inv.partner2_parents}</span></Fade>}
            <Fade delay={4} className={`${L.body} mt-3 text-[0.95rem] italic`}><span style={{ color: L.muted }}>with love, for </span>{guest?.name ?? "you"}</Fade>
          </div>
        ),
      });
      if (photo && L.photo === "arch") {
        scenes.push({
          key: "photo", kind: "photo", node: (
            <div className="flex w-full flex-col items-center gap-5 text-center">
              <Fade delay={0.1} className="relative w-[68%] max-w-[260px]">
                <span className="absolute -inset-2.5 rounded-t-full border" style={{ borderColor: L.line }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`${inv.partner1} & ${inv.partner2}`} className="relative aspect-[3/4] w-full rounded-t-full object-cover" />
              </Fade>
              <Letters text="IN THE CELEBRATION OF THEIR LOVE" className={`${L.caps} text-[0.55rem]`} style={{ color: L.muted }} delay={0.9} step={0.025} />
              {d.day && (
                <Fade delay={1.6} className="flex flex-col items-center" >
                  <span className={`${L.caps} text-[0.7rem]`}>{d.month.toUpperCase()}</span>
                  <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <span className={`${L.caps} border-y py-1 text-right text-[0.62rem]`} style={{ borderColor: L.line }}>{d.weekday.toUpperCase()}</span>
                    <span className="font-serif text-4xl leading-none" style={{ color: L.accent }}>{d.day}</span>
                    <span className={`${L.caps} border-y py-1 text-left text-[0.62rem]`} style={{ borderColor: L.line }}>{d.time !== "12:00 AM" ? `AT ${d.time}` : d.year}</span>
                  </span>
                  <span className={`${L.caps} mt-1 text-[0.7rem]`}>{d.year}</span>
                </Fade>
              )}
            </div>
          ),
        });
      }
    } else if (s === "countdown" && first?.starts_at && d.day) {
      scenes.push({
        key: "date", kind: "calendar", node: (
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <Letters text="Save the Date" className={`${L.script} text-[2.6rem] leading-none`} style={{ color: L.accent }} delay={0.1} step={0.06} />
            <Calendar iso={first.starts_at} ink={L.ink} accent={L.accent} heading={`${L.caps} text-[1.1rem]`} />
            <Fade delay={2.8} className="mt-4 w-full max-w-[300px]"><Countdown to={first.starts_at} tone={L.tone} /></Fade>
          </div>
        ),
      });
    } else if (s === "events") {
      shown.forEach((e, i) => scenes.push({ key: `ev-${e.key}`, kind: "event", id: i === 0 ? "ec-events" : undefined, node: eventScene(e, i) }));
    } else if (s === "story" && inv.story) {
      scenes.push({
        key: "story", kind: "text", node: (
          <div className="flex flex-col items-center gap-5 text-center">
            <H kicker="our story" title="How it began" />
            <Words text={inv.story} className={`${L.body} max-w-[32ch] text-[1.08rem] leading-relaxed`} delay={1} step={0.035} />
          </div>
        ),
      });
    } else if (s === "timeline" && inv.timeline?.length) {
      scenes.push({
        key: "timeline", kind: "list", node: (
          <div className="flex flex-col items-center gap-5 text-center">
            <H kicker="chapter by chapter" title="Our journey" />
            {inv.timeline.map((t, i) => (
              <Fade key={i} delay={1 + i * 0.35} className="flex flex-col items-center gap-1">
                <span className={`${L.script} text-2xl leading-none`} style={{ color: L.accent }}>{t.year}</span>
                <span className={`${L.caps} text-[0.78rem]`}>{t.title}</span>
                {t.text && <span className={`${L.body} max-w-[30ch] text-[0.95rem]`} style={{ color: L.muted }}>{t.text}</span>}
                {i < inv.timeline.length - 1 && divider}
              </Fade>
            ))}
          </div>
        ),
      });
    } else if (s === "schedule" && inv.schedule?.length) {
      scenes.push({
        key: "schedule", kind: "list", node: (
          <div className="flex flex-col items-center gap-4 text-center">
            <Letters text="timeline" className={`${L.script} text-[2.6rem] leading-none`} style={{ color: L.accent }} delay={0.1} step={0.07} />
            {inv.schedule.map((t, i) => (
              <Fade key={i} delay={0.8 + i * 0.3} className="flex flex-col items-center gap-0.5">
                <span className={`${L.caps} text-[0.72rem]`}>{t.title}</span>
                <span className={`${L.caps} text-[0.68rem]`} style={{ color: L.accent }}>{t.time}</span>
                {t.text && <span className={`${L.body} text-[0.9rem] italic`} style={{ color: L.muted }}>{t.text}</span>}
                {i < inv.schedule.length - 1 && divider}
              </Fade>
            ))}
          </div>
        ),
      });
    } else if (s === "kids" && (inv.polaroids?.p1_then || inv.polaroids?.p2_then)) {
      scenes.push({
        key: "kids", kind: "photo", node: (
          <div className="flex flex-col items-center gap-5 text-center">
            <H kicker="once upon a time" title="These two little ones" />
            <div className="grid grid-cols-2 gap-4">
              {[inv.polaroids.p1_then, inv.polaroids.p2_then].filter(Boolean).map((src, i) => (
                <Fade key={i} delay={1 + i * 0.3}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src!} alt="" className="aspect-[4/5] w-32 bg-white object-cover p-1.5 pb-5 shadow-lg" style={{ transform: `rotate(${i ? 4 : -4}deg)` }} />
                </Fade>
              ))}
            </div>
          </div>
        ),
      });
    } else if (s === "gallery" && inv.gallery?.length) {
      scenes.push({
        key: "gallery", kind: "wide", id: "ec-gallery", node: (
          <div className="flex w-full flex-col items-center gap-5">
            <H kicker="moments" title="Our gallery" />
            <Fade delay={0.9} className="w-full"><Gallery photos={inv.gallery} preview={preview} frame={L.frame} /></Fade>
          </div>
        ),
      });
    } else if (s === "venue" && first?.venue) {
      scenes.push({
        key: "venue", kind: "wide", id: "ec-venue", node: (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <H kicker="the venue" title={first.venue} />
            <Fade delay={1} className="w-full"><VenueMap venue={first.venue} preview={preview} frame={L.frame} button={L.button} /></Fade>
          </div>
        ),
      });
    } else if (s === "rsvp") {
      scenes.push({
        key: "rsvp", kind: "rsvp", id: "ec-rsvp", node: guest && (token || preview) ? (
          <div className="flex w-full flex-col gap-5 text-center">
            <H kicker="kindly" title="R.S.V.P" />
            {inv.rsvp_by && <Letters text={`BY ${formatDay(inv.rsvp_by).toUpperCase()}`} className={`${L.caps} text-[0.7rem]`} style={{ color: L.muted }} delay={0.9} step={0.03} />}
            <Fade delay={1.3} className="text-left">
              <RsvpSection slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone={L.tone} showHeading={false} />
            </Fade>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <H kicker="kindly" title="R.S.V.P" />
            <p className={`${L.body} max-w-[28ch]`} style={{ color: L.muted }}>{token ? "This invitation link isn't valid." : "Open your personal link from WhatsApp to reply."}</p>
          </div>
        ),
      });
    }
  }

  return (
    <>
      {scenes.map((s) => (
        <Scene key={s.key} id={s.id} preview={preview}>
          {Frame({ children: s.node, kind: s.kind })}
        </Scene>
      ))}
      <Scene preview={preview}>{closing}</Scene>
    </>
  );
}

/** Bottom-menu items that exist in this invitation. */
export function storyNav(inv: Invitation, guest: GuestView | null) {
  const s = visibleSections(inv.sections);
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  return ["home", ...(s.includes("events") && shown.length ? ["events"] : []), ...(s.includes("gallery") && inv.gallery?.length ? ["gallery"] : []), ...(s.includes("venue") && inv.events[0]?.venue ? ["venue"] : []), "rsvp"];
}

export const initialsOf = (inv: Invitation) => `${(inv.partner1 || "A").trim()[0]?.toUpperCase() ?? "A"}${(inv.partner2 || "B").trim()[0]?.toUpperCase() ?? "B"}`;

/* ---------------- page shell shared by the Story templates ---------------- */

export function StoryShell({ p, o, bg, color, backdrop, cover, lead, look, Frame, closing, navLook, musicTone = "light", flushEnd = false }: {
  p: DesignProps; o: ReturnType<typeof useOpening>; bg: string; color: string;
  backdrop?: React.ReactNode; cover: React.ReactNode; lead?: React.ReactNode; look: StoryLook;
  Frame: Props["Frame"]; closing: React.ReactNode; navLook: string; musicTone?: "light" | "dark"; flushEnd?: boolean;
}) {
  const { invitation: inv, guest, token, preview = false } = p;
  const lock = preview && o.stage !== "open" ? "h-[620px] overflow-hidden" : "";
  const couple = `${inv.partner1 || "Partner"} & ${inv.partner2 || "Partner"}`;
  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-x-clip`} style={{ background: bg, color }}>
      {backdrop && (
        <div className={`pointer-events-none sticky top-0 z-0 overflow-hidden ${preview ? "-mb-[620px] h-[620px]" : "-mb-[100svh] h-[100svh]"}`}>{backdrop}</div>
      )}
      {o.stage !== "open" && o.stage !== "intro" && cover}
      {o.stage === "intro" && inv.intro_video && (
        <IntroVideo src={inv.intro_video} contained={preview} title={couple} subtitle={dateParts(inv.events[0]?.starts_at).full || undefined} onDone={o.done} />
      )}
      <MusicPlayer src={inv.music_url} preview={preview} tone={musicTone} />
      <main className={`relative z-[2] ${flushEnd ? "" : "pb-24"} ${o.stage === "cover" ? "st-hold" : ""}`}>
        {lead}
        <StoryScenes inv={inv} guest={guest} token={token} preview={preview} look={look} Frame={Frame} closing={closing} />
      </main>
      {o.stage === "open" && <BottomNav items={storyNav(inv, guest)} preview={preview} look={navLook} />}
    </div>
  );
}
