"use client";
import { useState } from "react";
import { formatDay, formatEventDate, formatLongDate, googleCalendarUrl, mapsUrl, visibleSections } from "@/lib/utils";
import Countdown from "@/components/invitation/Countdown";
import RsvpSection from "@/components/invitation/RsvpSection";
import Gallery from "@/components/invitation/Gallery";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import type { DesignProps } from "./types";

/** Eternal Noir – the house style: black ground, white Georgia capitals, hairlines, wide-tracked labels. */
export default function EternalNoir({ invitation: inv, guest, token, preview = false }: DesignProps) {
  const [open, setOpen] = useState(false);
  const couple = `${inv.partner1} & ${inv.partner2}`;
  const first = inv.events[0];
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const dear = guest?.name ?? "Our dear guest";
  const label = "text-[0.6rem] uppercase tracking-[0.34em] text-white/50";
  const heading = "font-display font-light uppercase tracking-[0.06em] text-white";
  const btn = "border border-white/40 px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.28em] text-white/85 hover:border-white hover:text-white";

  const blocks: Record<string, React.ReactNode> = {
    hero: (
      <section key="hero" className="flex flex-col items-center gap-5 pt-10 text-center">
        {inv.cover_photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inv.cover_photo} alt="" className="mb-2 aspect-[3/4] w-44 object-cover grayscale-[30%]" />
        )}
        <p className={label}>Together with their families</p>
        <h1 className={`${heading} leading-[1.05] ${preview ? "text-4xl" : "text-5xl sm:text-6xl"}`}>
          {inv.partner1 || "Partner"}
          <span className="my-3 block font-display text-lg italic normal-case text-white/50">and</span>
          {inv.partner2 || "Partner"}
        </h1>
        <span className="h-10 w-px bg-white/30" aria-hidden="true" />
        {first && <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/80">{formatLongDate(first.starts_at)}</p>}
        {inv.families && <p className="max-w-[38ch] text-sm leading-relaxed text-white/55">{inv.families}</p>}
        <p className="text-sm text-white/55">Invitation for <span className="text-white">{dear}</span></p>
      </section>
    ),
    countdown: first ? (
      <section key="countdown" className="flex flex-col gap-4">
        <p className={`text-center ${label}`}>Until our chapter begins</p>
        <Countdown to={first.starts_at} tone="mono" />
      </section>
    ) : null,
    story: inv.story ? (
      <section key="story" className="flex flex-col items-center gap-4 text-center">
        <p className={label}>Our story</p>
        <p className="max-w-[42ch] whitespace-pre-line font-display text-lg italic leading-relaxed text-white/80">{inv.story}</p>
      </section>
    ) : null,
    gallery: inv.gallery?.length ? (
      <section key="gallery" className="flex flex-col gap-5">
        <p className="text-center text-[0.6rem] uppercase tracking-[0.34em] text-white/50">Moments</p>
        <Gallery photos={inv.gallery} frame="border border-white/15" preview={preview} />
      </section>
    ) : null,
    events: shown.length ? (
      <section key="events" className="flex flex-col gap-4">
        <p className={`text-center ${label}`}>The celebrations</p>
        {shown.map((e) => (
          <article key={e.key} className="flex flex-col gap-2 border-t border-white/15 pt-6">
            <p className={label}>{e.label}</p>
            <h3 className={`${heading} text-xl`}>{e.title}</h3>
            <p className="text-sm text-white/80">{formatEventDate(e.starts_at)}</p>
            {e.note && <p className="text-sm text-white/55">{e.note}</p>}
            {e.venue && <p className="text-sm text-white/80">{e.venue}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={mapsUrl(e.venue)} target="_blank" rel="noopener" className={btn}>Directions →</a>
              <a href={googleCalendarUrl(`${couple} – ${e.label}`, e.starts_at, e.venue)} target="_blank" rel="noopener" className={btn}>Add to calendar</a>
            </div>
          </article>
        ))}
      </section>
    ) : null,
    rsvp: guest && (token || preview) ? (
      <RsvpSection key={`rsvp-${preview}`} slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone="mono"
        rsvpBy={inv.rsvp_by ? formatDay(inv.rsvp_by) : null} />
    ) : (
      <p key="rsvp" className="text-center text-sm text-white/55">
        {token ? "This invitation link isn't valid. Please check the link the couple sent you." : "Open your personal link from WhatsApp to reply."}
      </p>
    ),
  };

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} bg-[#0a0a0a] px-5 pb-16 pt-8 text-white`}>
      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />
      {!preview && (
        <div className={`fixed inset-0 z-20 grid place-items-center bg-[#0a0a0a] px-6 transition-all duration-700 ${open ? "invisible opacity-0" : "opacity-100"}`}
          role="dialog" aria-label="Invitation envelope">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className={label}>An invitation for</p>
            <p className={`${heading} text-3xl`}>{dear}</p>
            <span className="h-10 w-px bg-white/30" aria-hidden="true" />
            <p className="font-display text-sm italic text-white/60">{couple}</p>
            <button type="button" onClick={() => { setOpen(true); announceOpen(); }} className={btn}>Open your invitation →</button>
          </div>
        </div>
      )}
      <main className="mx-auto flex max-w-lg flex-col gap-16">
        {visibleSections(inv.sections).map((id) => blocks[id])}
        <footer className="border-t border-white/10 pt-8 text-center text-[0.55rem] uppercase tracking-[0.34em] text-white/35">
          Your story, beautifully told · Eternal Chapter
        </footer>
      </main>
    </div>
  );
}
