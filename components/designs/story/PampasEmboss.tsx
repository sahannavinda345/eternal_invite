"use client";
/**
 * Pampas Emboss – built from real paper artwork (public/story/pampas/*) to match the reference film:
 * embossed envelope → "you're cordially invited" → embossed pampas grows in → names → save the date
 * → RSVP → maroon card with an ornate frame and the couple's monogram.
 */
import { useState } from "react";
import BottomNav from "@/components/invitation/BottomNav";
import IntroVideo from "@/components/invitation/IntroVideo";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import RsvpSection from "@/components/invitation/RsvpSection";
import type { EventItem } from "@/lib/types";
import { formatDay, visibleSections } from "@/lib/utils";
import type { DesignProps } from "../types";
import EmbossEnvelope from "./Envelope";
import { Fade, Letters, Scene, StoryScenes, dateParts, initialsOf, storyNav, useOpening, type StoryLook } from "./Story";

const IMG = { paper: "/story/pampas/paper.jpg", pampas: "/story/pampas/pampas.jpg", ending: "/story/pampas/ending.jpg", envelope: "/story/pampas-envelope.jpg" };
const INK = "#7a2433", ROSE = "#8e4a55", GREY = "#7d716c", SOFT = "#a3938d";

const look: StoryLook = {
  ink: INK, accent: INK, muted: SOFT, line: "#cdb9ab",
  caps: "font-serif uppercase tracking-[0.24em]", script: "font-script", body: "font-serif",
  tone: "ivory", frame: "border-[5px] border-[#f7f1e8] shadow-[0_10px_24px_rgba(90,50,40,.18)]", photo: "arch", names: "script",
  button: "inline-flex items-center gap-2 border border-[#7a2433]/40 px-5 py-2.5 font-serif text-[0.7rem] uppercase tracking-[0.24em] text-[#7a2433]",
};

/** The paper: plain, then the embossed pampas grows up from the bottom; soft window light drifts across. */
function Paper({ grown, close }: { grown: boolean; close: boolean }) {
  return (
    <div className="absolute inset-0 transition-transform duration-[2600ms] ease-out" style={{ transformOrigin: "15% 95%", transform: close ? "scale(1.12)" : "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.paper} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.pampas} alt="" className={`absolute inset-0 h-full w-full object-cover ${grown ? "st-grow-up" : "opacity-0"}`} />
      <span className="absolute -inset-[25%] opacity-[0.15] blur-[26px]"
        style={{ background: "repeating-linear-gradient(115deg, transparent 0 90px, #4a3428 90px 140px, transparent 140px 175px, #4a3428 175px 186px, transparent 186px 360px)", animation: "st-wave 11s ease-in-out infinite" }} />
      <svg viewBox="0 0 200 200" className="absolute -right-[10%] -top-[6%] w-[70%] opacity-[0.12] blur-[6px]" style={{ animation: "st-leaves 7s ease-in-out infinite", transformOrigin: "80% 0%" }} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d="M0 0Q30-14 60 0Q30 14 0 0Z" fill="#3a281e" transform={`translate(${60 + i * 18} ${30 + i * 22}) rotate(${110 + i * 12})`} />)}
      </svg>
    </div>
  );
}

/** Time, venue and address, small and right-aligned at the bottom like the printed card. */
function Details({ e, delay }: { e: EventItem; delay: number }) {
  const p = dateParts(e.starts_at);
  const lines = [p.time && p.time !== "12:00 AM" ? p.time : "", ...(e.venue ? e.venue.split(/,\s*/) : [])].filter(Boolean);
  return (
    <Fade delay={delay} className="absolute bottom-[12%] right-[8%] max-w-[70%] text-right font-serif text-[0.8rem] uppercase leading-[1.75] tracking-[0.06em]">
      {lines.map((l, i) => <span key={i} className="block" style={{ color: INK }}>{l}</span>)}
      {e.venue && (
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue)}`} target="_blank" rel="noopener"
          className="mt-2 inline-block border-b border-[#7a2433]/40 text-[0.62rem] tracking-[0.24em]" style={{ color: ROSE }}>Directions →</a>
      )}
    </Fade>
  );
}

export default function PampasEmboss(p: DesignProps) {
  const { invitation: inv, guest, token, preview = false } = p;
  const o = useOpening(inv, 2600);
  const [grown, setGrown] = useState(false);
  const [close, setClose] = useState(false);
  const opening = o.stage === "opening";
  const sections = visibleSections(inv.sections);
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const first = shown[0] ?? inv.events[0];
  const d = dateParts(first?.starts_at);
  const ini = initialsOf(inv);
  const lock = preview && o.stage !== "open" ? "h-[620px] overflow-hidden" : "";
  const S = (props: Omit<React.ComponentProps<typeof Scene>, "preview">) => <Scene preview={preview} {...props} />;

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-x-clip`} style={{ background: "#efe7dc", color: INK }}>
      <div className={`pointer-events-none sticky top-0 z-0 overflow-hidden ${preview ? "-mb-[620px] h-[620px]" : "-mb-[100svh] h-[100svh]"}`}>
        <Paper grown={grown} close={close} />
      </div>

      {o.stage !== "open" && o.stage !== "intro" && (
        <EmbossEnvelope opening={opening} onOpen={o.open} preview={preview} guestName={guest?.name} image={IMG.envelope} />
      )}
      {o.stage === "intro" && inv.intro_video && (
        <IntroVideo src={inv.intro_video} contained={preview} title={`${inv.partner1} & ${inv.partner2}`} subtitle={d.full || undefined} onDone={o.done} />
      )}
      <MusicPlayer src={inv.music_url} preview={preview} tone="light" />

      <main className={`relative z-[2] ${o.stage === "cover" ? "st-hold" : ""}`}>
        {/* 1 · you're cordially invited */}
        {S({
          children: (
            <div className="flex flex-col items-center text-center">
              <Letters text="YOU'RE" className="font-serif text-[1rem] tracking-[0.3em]" style={{ color: ROSE }} delay={2.4} step={0.1} />
              <Letters text="cordially" className="-my-1 font-script text-[3.4rem] leading-tight" style={{ color: GREY }} delay={2.8} step={0.1} />
              <Letters text="INVITED" className="font-serif text-[1rem] tracking-[0.3em]" style={{ color: ROSE }} delay={3.7} step={0.1} />
              <Fade delay={4.6} className="mt-6 font-serif italic"><span style={{ color: SOFT }}>dear {guest?.name ?? "friend"}</span></Fade>
            </div>
          ),
        })}

        {/* 2 · we're getting married – the pampas grows in */}
        {sections.includes("hero") && S({
          id: "ec-home", onIn: () => setGrown(true),
          children: (
            <>
              <div className="absolute inset-x-0 top-[12%] text-center">
                <Letters text="WE'RE GETTING" className="block font-serif text-[0.82rem] tracking-[0.3em]" style={{ color: ROSE }} delay={1.2} step={0.07} />
                <Letters text="MARRIED" className="block font-serif text-[0.82rem] tracking-[0.3em]" style={{ color: ROSE }} delay={2} step={0.07} />
              </div>
              <div className="relative w-full px-8" style={{ marginTop: "-6%" }}>
                <Letters text={inv.partner1 || "Partner"} className="block text-left font-script text-[3.6rem] leading-none" style={{ color: INK, paddingLeft: "6%" }} delay={2.6} step={0.11} />
                <Fade delay={3.4} className="-my-4 text-center font-script text-[3.4rem] leading-none"><span style={{ color: "#d9c4bf" }}>&amp;</span></Fade>
                <Letters text={inv.partner2 || "Partner"} className="block text-right font-script text-[3.6rem] leading-none" style={{ color: INK, paddingRight: "4%" }} delay={3.7} step={0.11} />
              </div>
              {(inv.partner1_parents || inv.partner2_parents || inv.families) && (
                <Fade delay={4.8} className="absolute bottom-[12%] right-[8%] max-w-[62%] text-right font-serif text-[0.78rem] italic leading-relaxed">
                  <span style={{ color: GREY }}>
                    {inv.partner1_parents && <span className="block">{inv.partner1_parents}</span>}
                    {inv.partner2_parents && <span className="block">{inv.partner2_parents}</span>}
                    {!inv.partner1_parents && !inv.partner2_parents && inv.families}
                  </span>
                </Fade>
              )}
            </>
          ),
        })}

        {/* 3 · save the date (first event) */}
        {first && (sections.includes("countdown") || sections.includes("events")) && S({
          id: "ec-events", onIn: () => { setGrown(true); setClose(true); },
          children: (
            <>
              <div className="absolute inset-x-0 top-[13%] flex flex-col items-center text-center">
                <Letters text="Save" className="font-script text-[3.6rem] leading-[1]" style={{ color: INK }} delay={0.5} step={0.14} />
                <Letters text="the" className="font-script text-[3.2rem] leading-[1]" style={{ color: INK }} delay={1.1} step={0.14} />
                <Letters text="Date" className="font-script text-[3.6rem] leading-[1]" style={{ color: INK }} delay={1.5} step={0.14} />
                {d.full && <Letters text={d.full.toUpperCase()} className="mt-5 font-serif text-[1.35rem] tracking-[0.06em]" style={{ color: GREY }} delay={2.3} step={0.05} />}
                {d.weekday && <Fade delay={3} className="mt-1 font-serif text-[0.7rem] uppercase tracking-[0.3em]"><span style={{ color: SOFT }}>{d.weekday}{first.title ? ` · ${first.title}` : ""}</span></Fade>}
              </div>
              <Details e={first} delay={3.3} />
            </>
          ),
        })}

        {/* 4 · other events */}
        {sections.includes("events") && shown.slice(1).map((e) => {
          const pe = dateParts(e.starts_at);
          return (
            <Scene key={e.key} preview={preview}>
              <div className="absolute inset-x-0 top-[16%] flex flex-col items-center text-center">
                <Letters text="and" className="font-script text-[2.6rem] leading-none" style={{ color: GREY }} delay={0.4} step={0.12} />
                <Letters text={e.title || e.label} className="mt-2 max-w-[85%] font-script text-[3rem] leading-[1.05]" style={{ color: INK }} delay={0.9} step={0.07} />
                {pe.full && <Letters text={pe.full.toUpperCase()} className="mt-5 font-serif text-[1.25rem] tracking-[0.06em]" style={{ color: GREY }} delay={2} step={0.05} />}
              </div>
              <Details e={e} delay={2.8} />
            </Scene>
          );
        })}

        {/* 5 · story, timeline, schedule, gallery, map – shared scenes in this paper style */}
        <StoryScenes inv={inv} guest={guest} token={token} preview={preview} look={look}
          skip={["hero", "countdown", "events", "rsvp"]}
          Frame={({ children }) => <div className="w-full max-w-[340px] px-8 py-16" style={{ color: INK }}>{children}</div>} />

        {/* 6 · kindly RSVP */}
        {sections.includes("rsvp") && S({
          id: "ec-rsvp", className: "justify-start",
          children: (
            <div className="flex w-full max-w-[360px] flex-col items-center px-7 pb-24 pt-[14vh] text-center">
              <Letters text="kindly" className="font-script text-[2.4rem] leading-none" style={{ color: ROSE }} delay={0.3} step={0.12} />
              <Letters text="RSVP" className="mt-1 font-serif text-[2.4rem] tracking-[0.3em]" style={{ color: INK }} delay={0.9} step={0.16} />
              {inv.rsvp_by && <Letters text={`BY ${formatDay(inv.rsvp_by).toUpperCase()}`} className="mt-3 font-serif text-[0.8rem] tracking-[0.2em]" style={{ color: GREY }} delay={1.6} step={0.04} />}
              <Fade delay={2.2} className="mt-8 w-full text-left">
                {guest && (token || preview) ? (
                  <RsvpSection slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone="ivory" showHeading={false} />
                ) : (
                  <p className="text-center font-serif italic" style={{ color: GREY }}>{token ? "This invitation link isn't valid." : "Open your personal link from WhatsApp to reply."}</p>
                )}
              </Fade>
            </div>
          ),
        })}

        {/* 7 · maroon card, ornate frame, monogram */}
        {S({
          className: "overflow-hidden",
          children: (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.ending} alt="" className="st-fade absolute inset-0 h-full w-full object-cover" style={{ animationDuration: "1.6s" }} />
              <div className="relative w-[40%] max-w-[190px]" style={{ aspectRatio: "3 / 4", marginTop: "-4%" }}>
                <Fade delay={1.2} className="absolute left-[12%] top-[16%] font-script text-[4rem] leading-none"><span style={{ color: "#f1d9d6" }}>{ini[0]}</span></Fade>
                <Fade delay={1.8} className="absolute bottom-[14%] right-[10%] font-script text-[4rem] leading-none"><span style={{ color: "#f1d9d6" }}>{ini[1]}</span></Fade>
              </div>
              <div className="absolute inset-x-0 bottom-[9%] flex flex-col items-center gap-2 text-center">
                <Letters text={`${inv.partner1} & ${inv.partner2}`} className="font-script text-[2rem]" style={{ color: "#f1d9d6" }} delay={2.6} step={0.06} />
                {d.full && <Fade delay={3.4} className="font-serif text-[0.62rem] uppercase tracking-[0.34em]"><span style={{ color: "#d9b3b3" }}>{d.full}</span></Fade>}
                <Fade delay={3.8} className="mt-3 font-serif text-[0.5rem] uppercase tracking-[0.34em]"><span style={{ color: "#c79a9a" }}>Made with Eternal Chapter</span></Fade>
              </div>
            </>
          ),
        })}
      </main>

      {o.stage === "open" && <BottomNav items={storyNav(inv, guest)} preview={preview} look="bg-[#f7f1e8]/90 text-[#7a2433] shadow-[0_8px_30px_rgba(90,50,40,.18)]" />}
    </div>
  );
}
