"use client";
import { useState } from "react";
import { formatDay, formatEventDate, formatLongDate, visibleSections } from "@/lib/utils";
import Countdown from "@/components/invitation/Countdown";
import RsvpSection from "@/components/invitation/RsvpSection";
import Gallery from "@/components/invitation/Gallery";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import IntroVideo from "@/components/invitation/IntroVideo";
import PetalBurst from "@/components/invitation/PetalBurst";
import ScratchCard from "@/components/invitation/ScratchCard";
import VenueMap from "@/components/invitation/VenueMap";
import BottomNav from "@/components/invitation/BottomNav";
import Reveal from "../animated/Reveal";
import type { DesignProps } from "../types";
import { EventIcon, Polaroid, SectionTitle, paperNoise } from "./parts";

const rose = "#8e3b55", plum = "#5a3646", soft = "#8a7480", petal = "#d98c9f";

const watercolor = `${paperNoise},
  radial-gradient(40% 30% at 15% 10%, rgba(255,196,180,.55), transparent 70%),
  radial-gradient(35% 25% at 90% 25%, rgba(190,215,240,.5), transparent 70%),
  radial-gradient(45% 30% at 20% 60%, rgba(250,220,170,.45), transparent 70%),
  radial-gradient(40% 30% at 85% 80%, rgba(240,185,205,.45), transparent 70%),
  #fff9f5`;

export default function WatercolorStory(props: DesignProps) {
  const { invitation: inv, guest, token, preview = false } = props;
  const [stage, setStage] = useState<"cover" | "intro" | "burst" | "open">("cover");
  const first = inv.events[0];
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const couple = `${inv.partner1 || "Partner"} & ${inv.partner2 || "Partner"}`;
  const pos = preview ? "absolute" : "fixed";
  const lock = preview && stage !== "open" ? "h-[600px] overflow-hidden" : "";
  const sections = visibleSections(inv.sections);
  const venue = first?.venue ?? "";
  const coverArt = inv.illustration || inv.cover_photo;
  const tz = (o: Intl.DateTimeFormatOptions) => (first?.starts_at && !Number.isNaN(new Date(first.starts_at).getTime()) ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", ...o }).format(new Date(first.starts_at)) : "");

  function open() {
    if (inv.intro_video) { setStage("intro"); return; }
    setStage("burst");
    announceOpen();
    setTimeout(() => setStage("open"), 1600);
  }

  const card = "rounded-2xl bg-white/70 shadow-[0_10px_30px_rgba(140,90,110,.08)] backdrop-blur-sm";
  const btn = "inline-flex items-center gap-2 rounded-full bg-[#8e3b55] px-6 py-3 text-[0.62rem] uppercase tracking-[0.24em] text-white shadow-lg shadow-[#8e3b55]/20";
  const T = (kicker: string, title: string) => <SectionTitle kicker={kicker} title={title} color={plum} kickerColor={petal} />;

  const blocks: Record<string, React.ReactNode> = {
    hero: (
      <section id="ec-home" className="flex scroll-mt-6 flex-col items-center gap-5 text-center">
        {inv.polaroids?.p1_then && inv.polaroids?.p2_then ? (
          <div className="grid w-full grid-cols-2 gap-4 px-3">
            <Polaroid src={inv.polaroids.p1_then} caption={`little ${inv.partner1}`} tilt={-5} />
            <Polaroid src={inv.polaroids.p2_then} caption={`little ${inv.partner2}`} tilt={4} />
          </div>
        ) : coverArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverArt} alt={couple} className="aspect-[4/5] w-60 rounded-[2rem] border-8 border-white object-cover shadow-xl" />
        ) : null}
        <p className="font-script text-3xl" style={{ color: petal }}>{inv.polaroids?.p1_then ? "These kids are getting married!" : "We're getting married!"}</p>
        <h1 className={`font-serif leading-[1.05] ${preview ? "text-[2.5rem]" : "text-5xl"}`} style={{ color: plum }}>
          {inv.partner1 || "Partner"} <span className="font-script text-4xl" style={{ color: petal }}>&amp;</span> {inv.partner2 || "Partner"}
        </h1>
        {(inv.partner1_parents || inv.partner2_parents) && (
          <div className="flex flex-col gap-0.5 text-sm leading-relaxed" style={{ color: soft }}>
            {inv.partner1_parents && <p>{inv.partner1} · {inv.partner1_parents}</p>}
            {inv.partner2_parents && <p>{inv.partner2} · {inv.partner2_parents}</p>}
          </div>
        )}
        {inv.families && <p className="max-w-[36ch] font-serif text-[1.05rem] italic leading-relaxed" style={{ color: plum }}>{inv.families}</p>}
        <p className="text-sm" style={{ color: soft }}>With love, for <b className="font-medium" style={{ color: plum }}>{guest?.name ?? "you"}</b></p>
      </section>
    ),
    kids: inv.polaroids?.p1_now || inv.polaroids?.p2_now ? (
      <section className="flex flex-col items-center gap-6">
        <div className="grid w-full grid-cols-2 gap-4 px-3">
          <Polaroid src={inv.polaroids.p1_now} caption={`${inv.partner1}, today`} tilt={3} />
          <Polaroid src={inv.polaroids.p2_now} caption={`${inv.partner2}, today`} tilt={-4} />
        </div>
        <p className="font-serif text-2xl italic" style={{ color: plum }}>And now, forever begins.</p>
      </section>
    ) : null,
    countdown: first ? (
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {T("Mark the day", "Save our date")}
          <div className={`${card} p-4`} style={{ color: plum }}>
            <ScratchCard>
              <div className="flex aspect-[16/9] flex-col items-center justify-center gap-1 bg-[#fffaf6] text-center">
                <p className="font-script text-2xl" style={{ color: petal }}>{tz({ weekday: "long" })}</p>
                <p className="font-serif text-3xl">{tz({ day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="text-sm tracking-[0.2em]" style={{ color: soft }}>{tz({ hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}</p>
              </div>
            </ScratchCard>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-center font-script text-2xl" style={{ color: petal }}>counting every little moment</p>
          <Countdown to={first.starts_at} tone="ivory" />
          <p className="text-center font-serif italic" style={{ color: soft }}>until these two begin their forever</p>
        </div>
      </section>
    ) : null,
    story: inv.story ? (
      <section className="flex flex-col items-center gap-5 text-center">
        {T("Our story", "Once upon a time")}
        <p className="max-w-[38ch] whitespace-pre-line font-serif text-[1.08rem] leading-relaxed" style={{ color: plum }}>{inv.story}</p>
      </section>
    ) : null,
    timeline: inv.timeline?.length ? (
      <section className="flex flex-col gap-6">
        {T("Chapter by chapter", "Our little archive")}
        <ol className="flex flex-col gap-3">
          {inv.timeline.map((t, i) => (
            <li key={i} className={`${card} px-5 py-4`}>
              <p className="font-script text-2xl" style={{ color: petal }}>{t.year}</p>
              <p className="font-serif text-xl" style={{ color: plum }}>{t.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: soft }}>{t.text}</p>
            </li>
          ))}
        </ol>
      </section>
    ) : null,
    events: shown.length ? (
      <section id="ec-events" className="flex scroll-mt-6 flex-col gap-5">
        {T("You're invited to", "Our celebrations")}
        {shown.map((e, i) => (
          <article key={e.key} className={`${card} flex flex-col items-center gap-2 px-5 py-6 text-center`}>
            <EventIcon index={i} bg={rose} />
            <h3 className="font-serif text-2xl" style={{ color: plum }}>{e.title || e.label}</h3>
            <p className="text-sm" style={{ color: plum }}>{formatEventDate(e.starts_at)}</p>
            {e.note && <p className="text-sm italic" style={{ color: soft }}>{e.note}</p>}
            {e.venue && <p className="text-[0.62rem] uppercase tracking-[0.24em]" style={{ color: petal }}>{e.venue}</p>}
          </article>
        ))}
      </section>
    ) : null,
    schedule: inv.schedule?.length ? (
      <section className="flex flex-col gap-6">
        {T("The wedding day", "How the day unfolds")}
        <ol className="relative flex flex-col gap-3 pl-7 before:absolute before:bottom-2 before:left-2 before:top-2 before:border-l-2 before:border-dashed before:border-[#e7b8c4]">
          {inv.schedule.map((s, i) => (
            <li key={i} className={`${card} relative px-4 py-3`}>
              <span className="absolute -left-[1.6rem] top-4 h-3 w-3 rounded-full border-2 border-white" style={{ background: petal }} />
              <p className="text-xs tracking-[0.2em]" style={{ color: petal }}>{s.time}</p>
              <p className="font-serif text-xl" style={{ color: plum }}>{s.title}</p>
              {s.text && <p className="text-sm" style={{ color: soft }}>{s.text}</p>}
            </li>
          ))}
        </ol>
      </section>
    ) : null,
    gallery: inv.gallery?.length ? (
      <section id="ec-gallery" className="flex scroll-mt-6 flex-col gap-5">
        {T("From little moments", "to a lifetime")}
        <Gallery photos={inv.gallery} preview={preview} frame="rounded-sm border-[6px] border-white shadow-[0_10px_25px_rgba(140,90,110,.15)]" />
      </section>
    ) : null,
    venue: venue ? (
      <section id="ec-venue" className="flex scroll-mt-6 flex-col items-center gap-4 text-center">
        {T("The venue", "Where forever begins")}
        <p className="font-serif text-2xl" style={{ color: plum }}>{venue}</p>
        {first && <p className="text-sm" style={{ color: soft }}>{formatEventDate(first.starts_at)}</p>}
        <VenueMap venue={venue} preview={preview} frame="rounded-2xl border-[6px] border-white shadow-lg" button={btn} />
      </section>
    ) : null,
    rsvp: guest && (token || preview) ? (
      <section id="ec-rsvp" className="scroll-mt-6">
        <div className="mb-5">{T("Kindly reply", "Will you join our story?")}</div>
        <RsvpSection slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone="ivory" showHeading={false}
          rsvpBy={inv.rsvp_by ? formatDay(inv.rsvp_by) : null} />
      </section>
    ) : (
      <p id="ec-rsvp" className="text-center text-sm" style={{ color: soft }}>{token ? "This invitation link isn't valid." : "Open your personal link from WhatsApp to reply."}</p>
    ),
  };

  const navItems = ["home", ...(sections.includes("events") && shown.length ? ["events"] : []), ...(sections.includes("gallery") && inv.gallery?.length ? ["gallery"] : []), ...(sections.includes("venue") && venue ? ["venue"] : []), "rsvp"];

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden`} style={{ background: watercolor, color: plum }}>
      {stage !== "open" && stage !== "intro" && (
        <button type="button" onClick={open} aria-label="Open the invitation"
          className={`${pos} inset-0 z-40 block overflow-hidden text-left transition-opacity duration-700 ${stage === "burst" ? "opacity-0" : ""}`}
          style={{ background: watercolor }}>
          {coverArt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverArt} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ animation: "ec-kenburns 12s ease-out both" }} />
          )}
          <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#fff3ee]/90" />
          <span className="absolute inset-x-0 bottom-[12%] flex flex-col items-center gap-2 px-6 text-center">
            <span className="anim-rise font-script text-3xl" style={{ color: rose }}>Tap to begin our story</span>
            <span className="anim-rise font-serif text-4xl" style={{ color: plum, animationDelay: ".2s" }}>{couple}</span>
            {first && <span className="anim-rise text-[0.62rem] uppercase tracking-[0.3em]" style={{ color: soft, animationDelay: ".35s" }}>{formatLongDate(first.starts_at)}</span>}
            <span className="relative mt-4 grid h-12 w-12 place-items-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border-2" style={{ borderColor: rose, animation: "ec-ring 1.8s ease-out infinite" }} />
              <span className="h-3 w-3 rounded-full" style={{ background: rose }} />
            </span>
            <span className="text-sm" style={{ color: soft }}>for {guest?.name ?? "you"}</span>
          </span>
          {stage === "burst" && <PetalBurst colors={["#f9d3dc", "#fde7c9", "#d9e8f6", "#ffffff"]} />}
        </button>
      )}
      {stage === "intro" && inv.intro_video && (
        <IntroVideo src={inv.intro_video} contained={preview} title={couple} subtitle={first ? formatLongDate(first.starts_at) : undefined}
          onDone={() => { setStage("open"); announceOpen(); }} />
      )}

      <MusicPlayer src={inv.music_url} preview={preview} tone="light" />

      <main className="relative z-[2] mx-auto flex max-w-md flex-col gap-16 px-6 pb-36 pt-10">
        {sections.filter((id) => blocks[id]).map((id) => <Reveal key={id}>{blocks[id]}</Reveal>)}
        <Reveal>
          <section className="flex flex-col items-center gap-4 text-center">
            {(inv.polaroids?.p1_then || inv.polaroids?.p1_now || inv.gallery?.[0]) && (
              <div className="flex items-end justify-center gap-2">
                <Polaroid src={inv.polaroids?.p1_then || inv.gallery?.[1]} caption="" tilt={-8} className="w-24" />
                <Polaroid src={inv.polaroids?.p1_now || inv.gallery?.[0]} caption="" tilt={2} className="w-28" />
                <Polaroid src={inv.polaroids?.p2_then || inv.gallery?.[2]} caption="" tilt={7} className="w-24" />
              </div>
            )}
            <p className="font-serif text-2xl italic" style={{ color: plum }}>Two little stories.<br />One beautiful forever.</p>
            <p className="font-script text-3xl" style={{ color: petal }}>{couple}</p>
          </section>
        </Reveal>
        <footer className="-mt-8 text-center text-[0.55rem] uppercase tracking-[0.34em]" style={{ color: petal }}>Made with Eternal Chapter</footer>
      </main>

      {stage === "open" && <BottomNav items={navItems} preview={preview} look="bg-white/80 text-[#8e3b55] shadow-[0_8px_30px_rgba(140,90,110,.2)]" />}
    </div>
  );
}
