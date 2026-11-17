"use client";
import { useState } from "react";
import { formatDay, formatEventDate, formatLongDate, googleCalendarUrl, visibleSections } from "@/lib/utils";
import Countdown from "@/components/invitation/Countdown";
import RsvpSection from "@/components/invitation/RsvpSection";
import Gallery from "@/components/invitation/Gallery";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import IntroVideo from "@/components/invitation/IntroVideo";
import PetalBurst from "@/components/invitation/PetalBurst";
import VenueMap from "@/components/invitation/VenueMap";
import BottomNav from "@/components/invitation/BottomNav";
import Reveal from "../animated/Reveal";
import { Elephant, EmbossedSpray, Lotus, Mandala } from "../animated/ornaments";
import type { DesignProps } from "../types";
import { DateBlock, EventIcon, Polaroid, SectionTitle, paperNoise } from "./parts";

const maroon = "#6b1d2a", gold = "#a8874a", ink = "#3d2a1e", muted = "#7a6a5a";

function Procession({ contained = true }: { contained?: boolean }) {
  const row = (
    <div className="flex shrink-0 items-end gap-9 px-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="anim-bob" style={{ animationDelay: `${i * 0.2}s` }}>
          <Elephant size={i % 3 === 1 ? 60 : 50} cloth={i % 2 ? "#7a1f2b" : "#a8742a"} />
        </div>
      ))}
    </div>
  );
  return (
    <div className={`pointer-events-none ${contained ? "absolute" : "fixed"} inset-x-0 bottom-0 h-14 overflow-hidden`} aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#efe0c4] to-transparent" />
      <div className="anim-walk flex w-max">{row}{row}</div>
    </div>
  );
}

export default function RoyalKandyan(props: DesignProps) {
  const { invitation: inv, guest, token, preview = false } = props;
  const [stage, setStage] = useState<"cover" | "intro" | "burst" | "open">("cover");
  const first = inv.events[0];
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const couple = `${inv.partner1 || "Partner"} & ${inv.partner2 || "Partner"}`;
  const pos = preview ? "absolute" : "fixed";
  const lock = preview && stage !== "open" ? "h-[600px] overflow-hidden" : "";
  const sections = visibleSections(inv.sections);
  const venue = first?.venue ?? "";

  function open() {
    if (inv.intro_video) { setStage("intro"); return; }
    setStage("burst");
    announceOpen();
    setTimeout(() => setStage("open"), 1600);
  }

  const card = "rounded-2xl border border-[#e3d3b4] bg-white/55 shadow-[0_8px_30px_rgba(120,90,40,.06)] backdrop-blur-[2px]";
  const btn = "inline-flex items-center gap-2 rounded-full border border-[#c9ae78] px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.24em] text-[#6b1d2a] hover:bg-[#c9ae78]/10";

  const blocks: Record<string, React.ReactNode> = {
    hero: (
      <section id="ec-home" className="flex scroll-mt-6 flex-col items-center gap-5 text-center">
        <Mandala size={150} color="#c9ae78" className="anim-spin -mb-4 opacity-70" />
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em]" style={{ color: maroon }}>Sri Subha Mangalam!</p>
        <p className="text-[0.58rem] uppercase tracking-[0.34em]" style={{ color: gold }}>You are invited to the wedding of</p>
        <h1 className={`font-serif italic leading-[1.05] ${preview ? "text-[2.6rem]" : "text-5xl sm:text-6xl"}`} style={{ color: maroon }}>
          {inv.partner1 || "Partner"} <span className="font-script not-italic" style={{ color: gold }}>&amp;</span> {inv.partner2 || "Partner"}
        </h1>
        {(inv.partner1_parents || inv.partner2_parents) && (
          <div className="grid w-full grid-cols-2 gap-4 text-[0.72rem] leading-snug" style={{ color: muted }}>
            <p><span className="block text-[0.55rem] uppercase tracking-[0.3em]" style={{ color: gold }}>{inv.partner1}</span>{inv.partner1_parents}</p>
            <p><span className="block text-[0.55rem] uppercase tracking-[0.3em]" style={{ color: gold }}>{inv.partner2}</span>{inv.partner2_parents}</p>
          </div>
        )}
        <DateBlock iso={first?.starts_at} />
        {(inv.illustration || inv.cover_photo) && (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inv.illustration || inv.cover_photo!} alt={couple}
              className={inv.illustration ? "mx-auto max-h-[420px] w-auto object-contain drop-shadow-[0_14px_20px_rgba(80,50,20,.18)]" : "mx-auto aspect-[3/4] w-56 rounded-t-full border-4 border-white object-cover shadow-xl"} />
          </div>
        )}
        {inv.families && <p className="max-w-[36ch] font-serif text-[1.05rem] italic leading-relaxed" style={{ color: ink }}>{inv.families}</p>}
        <p className="text-sm" style={{ color: muted }}>Invitation for <b className="font-medium" style={{ color: ink }}>{guest?.name ?? "our dear guest"}</b></p>
      </section>
    ),
    countdown: first ? (
      <section className="flex flex-col gap-5">
        <SectionTitle kicker="The big day awaits" title="Counting down" />
        <Countdown to={first.starts_at} tone="ivory" />
      </section>
    ) : null,
    story: inv.story ? (
      <section className="flex flex-col items-center gap-5 text-center">
        <SectionTitle kicker="Our story" title="Together forever" />
        <p className="max-w-[38ch] whitespace-pre-line font-serif text-[1.08rem] leading-relaxed" style={{ color: ink }}>{inv.story}</p>
        {first && <p className="font-serif text-lg italic" style={{ color: maroon }}>{formatLongDate(first.starts_at).toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</p>}
        {venue && <p className="text-[0.62rem] uppercase tracking-[0.34em]" style={{ color: gold }}>{venue}</p>}
      </section>
    ) : null,
    timeline: inv.timeline?.length ? (
      <section className="flex flex-col gap-6">
        <SectionTitle kicker="A journey together" title="Our love story" />
        <ol className="relative flex flex-col gap-6 border-l border-[#d9c49a] pl-6">
          {inv.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full border-2 border-[#fbf6ee]" style={{ background: maroon }} />
              <p className="font-serif text-2xl italic" style={{ color: gold }}>{t.year}</p>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em]" style={{ color: maroon }}>{t.title}</p>
              <p className="mt-1 text-[0.92rem] leading-relaxed" style={{ color: muted }}>{t.text}</p>
            </li>
          ))}
        </ol>
      </section>
    ) : null,
    kids: inv.polaroids?.p1_then || inv.polaroids?.p1_now ? (
      <section className="flex flex-col gap-6">
        <SectionTitle kicker="Then & now" title="These kids are getting married" />
        <div className="grid grid-cols-2 gap-4 px-2">
          <Polaroid src={inv.polaroids.p1_then} caption={`Little ${inv.partner1}`} tilt={-4} />
          <Polaroid src={inv.polaroids.p2_then} caption={`Little ${inv.partner2}`} tilt={3} />
          <Polaroid src={inv.polaroids.p1_now} caption={`${inv.partner1}, today`} tilt={2} />
          <Polaroid src={inv.polaroids.p2_now} caption={`${inv.partner2}, today`} tilt={-3} />
        </div>
      </section>
    ) : null,
    gallery: inv.gallery?.length ? (
      <section id="ec-gallery" className="flex scroll-mt-6 flex-col gap-5">
        <SectionTitle kicker="Captured moments" title="Our gallery" />
        <Gallery photos={inv.gallery} preview={preview} frame="rounded-xl border-4 border-white shadow-[0_8px_20px_rgba(80,60,40,.15)]" />
      </section>
    ) : null,
    events: shown.length ? (
      <section id="ec-events" className="flex scroll-mt-6 flex-col gap-5">
        <SectionTitle kicker="Join us for" title="Wedding events" />
        {shown.map((e, i) => (
          <article key={e.key} className={`${card} flex flex-col items-center gap-2 px-5 py-6 text-center`}>
            <EventIcon index={i} />
            <h3 className="mt-1 text-[0.8rem] font-semibold uppercase tracking-[0.26em]" style={{ color: maroon }}>{e.title || e.label}</h3>
            <p className="text-sm" style={{ color: ink }}>{formatEventDate(e.starts_at)}</p>
            {e.note && <p className="text-sm italic" style={{ color: muted }}>{e.note}</p>}
            {e.venue && <p className="text-[0.62rem] uppercase tracking-[0.26em]" style={{ color: gold }}>{e.venue}</p>}
          </article>
        ))}
        {first && (
          <a href={googleCalendarUrl(`${couple} – ${first.label}`, first.starts_at, first.venue)} target="_blank" rel="noopener"
            className={`${card} flex items-center gap-3 px-4 py-3 text-left`}>
            <EventIcon index={0} bg={gold} />
            <span className="min-w-0 flex-1"><span className="block font-serif text-lg" style={{ color: ink }}>Save the date</span><span className="text-xs" style={{ color: muted }}>Add the wedding to your calendar</span></span>
            <span aria-hidden="true" style={{ color: gold }}>›</span>
          </a>
        )}
      </section>
    ) : null,
    schedule: inv.schedule?.length ? (
      <section className="flex flex-col gap-6">
        <SectionTitle kicker="The wedding day" title="How the day unfolds" />
        <ol className="flex flex-col gap-3">
          {inv.schedule.map((s, i) => (
            <li key={i} className={`${card} grid grid-cols-[4.5rem_1fr] gap-3 px-4 py-3`}>
              <span className="font-serif text-lg italic" style={{ color: gold }}>{s.time}</span>
              <span><span className="block text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: maroon }}>{s.title}</span><span className="text-sm" style={{ color: muted }}>{s.text}</span></span>
            </li>
          ))}
        </ol>
      </section>
    ) : null,
    venue: venue ? (
      <section id="ec-venue" className="flex scroll-mt-6 flex-col items-center gap-4 text-center">
        <SectionTitle kicker="The setting" title="Wedding venue" />
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#c9ae78]" style={{ color: gold }} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
        </span>
        <p className="font-serif text-2xl" style={{ color: ink }}>{venue}</p>
        <VenueMap venue={venue} preview={preview} frame="rounded-2xl border-4 border-white shadow-lg" button={btn} />
      </section>
    ) : null,
    rsvp: guest && (token || preview) ? (
      <section id="ec-rsvp" className="scroll-mt-6">
        <div className="mb-5"><SectionTitle kicker="Kindly reply" title="Will you join us?" /></div>
        <RsvpSection slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone="ivory" showHeading={false}
          rsvpBy={inv.rsvp_by ? formatDay(inv.rsvp_by) : null} />
      </section>
    ) : (
      <p id="ec-rsvp" className="text-center text-sm" style={{ color: muted }}>{token ? "This invitation link isn't valid." : "Open your personal link from WhatsApp to reply."}</p>
    ),
  };

  const navItems = ["home", ...(sections.includes("events") && shown.length ? ["events"] : []), ...(sections.includes("gallery") && inv.gallery?.length ? ["gallery"] : []), ...(sections.includes("venue") && venue ? ["venue"] : []), "rsvp"];

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden text-[#3d2a1e]`}
      style={{ background: `${paperNoise}, radial-gradient(ellipse at 50% 0%, #fffdf7 0%, #fbf6ee 45%, #f4ead8 100%)` }}>
      {/* Cover */}
      {stage !== "open" && stage !== "intro" && (
        <div className={`${pos} inset-0 z-40 flex flex-col items-center justify-center gap-4 px-6 text-center transition-opacity duration-700 ${stage === "burst" ? "opacity-0" : ""}`}
          style={{ background: `${paperNoise}, radial-gradient(ellipse at 50% 0%, #fffdf7 0%, #fbf6ee 55%, #f1e3c6 100%)` }}>
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-80"><Mandala size={320} color="#c9ae78" className="anim-spin" /></div>
          <EmbossedSpray className="absolute -left-8 bottom-24 w-36 opacity-70" />
          <EmbossedSpray className="absolute -right-8 bottom-28 w-36 opacity-70" flip />
          <p className="anim-rise relative mt-28 text-[0.58rem] uppercase tracking-[0.38em]" style={{ color: gold }}>The wedding of</p>
          <p className="anim-rise relative font-serif text-[2.6rem] italic leading-tight" style={{ color: maroon, animationDelay: ".15s" }}>
            {inv.partner1 || "Partner"} <span className="font-script not-italic" style={{ color: gold }}>&amp;</span> {inv.partner2 || "Partner"}
          </p>
          {first && <p className="anim-rise text-xs italic" style={{ color: muted, animationDelay: ".3s" }}>{formatLongDate(first.starts_at).toLowerCase().replace(/(^|\s)\w/g, (c) => c.toUpperCase())}</p>}
          <button type="button" onClick={open} className={`anim-rise relative mt-3 bg-white/70 ${btn}`} style={{ animationDelay: ".45s" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            Open invitation
          </button>
          <div className="anim-rise relative mt-2" style={{ animationDelay: ".6s" }}>
            <p className="text-[0.55rem] uppercase tracking-[0.34em]" style={{ color: gold }}>Dear</p>
            <p className="font-serif text-lg uppercase tracking-[0.14em]" style={{ color: ink }}>{guest?.name ?? "Our dear guest"}</p>
          </div>
          <Procession />
          {stage === "burst" && <PetalBurst />}
        </div>
      )}
      {stage === "intro" && inv.intro_video && (
        <IntroVideo src={inv.intro_video} contained={preview} title={couple} subtitle={first ? formatLongDate(first.starts_at) : undefined}
          onDone={() => { setStage("open"); announceOpen(); }} />
      )}

      <MusicPlayer src={inv.music_url} preview={preview} tone="light" />
      <EmbossedSpray className="pointer-events-none absolute -left-10 top-[30%] w-40 opacity-50" />
      <EmbossedSpray className="pointer-events-none absolute -right-10 top-[60%] w-40 opacity-50" flip />

      <main className="relative z-[2] mx-auto flex max-w-md flex-col gap-16 px-6 pb-36 pt-10">
        {sections.filter((id) => blocks[id]).map((id, i) => (
          <Reveal key={id}>
            {i > 0 && <div className="mb-14 flex justify-center opacity-80"><Lotus color="#c9ae78" /></div>}
            {blocks[id]}
          </Reveal>
        ))}
        {/* Closing card */}
        <Reveal>
          <section className="flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center text-[#f6ecd9] shadow-2xl" style={{ background: "radial-gradient(ellipse at top, #4a1a20, #2a0d12)" }}>
            <p className="text-[0.58rem] uppercase tracking-[0.4em] text-[#d9b97a]">Save the date</p>
            {first && <p className="font-serif text-4xl tracking-[0.12em]">{new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(first.starts_at)).replace(/\//g, " . ")}</p>}
            <p className="max-w-[28ch] text-sm text-[#e6d5bc]">Thank you for being part of our special day</p>
            <p className="font-serif text-2xl italic">{couple}</p>
            {venue && <p className="text-[0.58rem] uppercase tracking-[0.34em] text-[#d9b97a]">{venue}</p>}
          </section>
        </Reveal>
        <footer className="-mt-8 text-center text-[0.55rem] uppercase tracking-[0.34em]" style={{ color: gold }}>Made with Eternal Chapter</footer>
      </main>

      {stage === "open" && <BottomNav items={navItems} preview={preview} look="border border-[#e3d3b4] bg-white/80 text-[#6b1d2a]" />}
    </div>
  );
}
