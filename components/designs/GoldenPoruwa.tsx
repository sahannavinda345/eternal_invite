"use client";
import { useState } from "react";
import { formatDay, formatEventDate, formatLongDate, googleCalendarUrl, mapsUrl, visibleSections } from "@/lib/utils";
import Countdown from "@/components/invitation/Countdown";
import RsvpSection from "@/components/invitation/RsvpSection";
import Gallery from "@/components/invitation/Gallery";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import type { DesignProps } from "./types";

function Ornament() {
  return (
    <svg viewBox="0 0 180 24" className="mx-auto h-6 w-44" aria-hidden="true">
      <path d="M0 12H62M118 12H180" stroke="#d6b36a" strokeWidth="1" fill="none" />
      <path d="M90 2C84 8 78 10 70 12C78 14 84 16 90 22C96 16 102 14 110 12C102 10 96 8 90 2Z" fill="none" stroke="#d6b36a" strokeWidth="1.2" />
      <circle cx="90" cy="12" r="2.6" fill="#d6b36a" />
      <circle cx="66" cy="12" r="1.6" fill="#d6b36a" />
      <circle cx="114" cy="12" r="1.6" fill="#d6b36a" />
    </svg>
  );
}

const frame = "border border-gold/35 outline outline-1 outline-offset-[6px] outline-gold/35";

export default function GoldenPoruwa({ invitation: inv, guest, token, preview = false }: DesignProps) {
  const [open, setOpen] = useState(false);
  const couple = `${inv.partner1} & ${inv.partner2}`;
  const first = inv.events[0];
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const dear = guest?.name ?? "Our dear guest";
  const big = preview ? "text-5xl" : "text-6xl sm:text-7xl";

  const blocks: Record<string, React.ReactNode> = {
    hero: (
      <section key="hero" className={`flex flex-col gap-3 px-6 py-10 text-center ${frame}`}>
        {inv.cover_photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inv.cover_photo} alt="" className="mx-auto mb-2 aspect-[3/4] w-40 rounded-t-full border-2 border-gold/60 object-cover" />
        )}
        <Ornament />
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gold-soft">Together with their families</p>
        <h1 className={`font-script font-normal leading-none text-gold ${big}`}>
          {inv.partner1 || "Partner"}
          <span className="my-2 block font-display text-2xl text-ivory-dim">&amp;</span>
          {inv.partner2 || "Partner"}
        </h1>
        {first && <p className="font-display tracking-[0.12em]">{formatLongDate(first.starts_at)}</p>}
        {inv.families && <p className="mx-auto max-w-[40ch] text-[0.95rem] text-ivory-dim">{inv.families}</p>}
        <p className="text-[0.95rem] text-ivory-dim">Invitation for <b className="font-medium text-ivory">{dear}</b></p>
        <Ornament />
      </section>
    ),
    countdown: first ? (
      <section key="countdown">
        <p className="mb-3 text-center text-[0.7rem] uppercase tracking-[0.24em] text-gold-soft">Counting down to the day</p>
        <Countdown to={first.starts_at} />
      </section>
    ) : null,
    story: inv.story ? (
      <section key="story" className="text-center">
        <h2 className="font-display text-2xl text-gold">Our story</h2>
        <p className="mx-auto mt-4 max-w-[44ch] whitespace-pre-line text-ivory-dim">{inv.story}</p>
      </section>
    ) : null,
    gallery: inv.gallery?.length ? (
      <section key="gallery" className="flex flex-col gap-5">
        <h2 className="text-center font-display text-2xl text-gold">Moments</h2>
        <Gallery photos={inv.gallery} frame="rounded border border-gold/50" preview={preview} />
      </section>
    ) : null,
    events: shown.length ? (
      <section key="events" className="flex flex-col gap-5">
        <h2 className="text-center font-display text-2xl text-gold">Celebrations</h2>
        {shown.map((e) => (
          <article key={e.key} className="flex flex-col gap-2.5 rounded border border-gold/35 bg-lacquer-2 p-6">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gold-soft">{e.label}</p>
            <h3 className="font-display text-xl text-ivory">{e.title}</h3>
            <p className="font-display tracking-wide text-gold">{formatEventDate(e.starts_at)}</p>
            {e.note && <p className="border-l-2 border-gold pl-2.5 text-sm text-ivory-dim">{e.note}</p>}
            {e.venue && <p>{e.venue}</p>}
            <div className="mt-1 flex flex-wrap gap-2.5">
              <a href={mapsUrl(e.venue)} target="_blank" rel="noopener"
                className="rounded-full border border-gold px-4 py-2 text-[0.7rem] font-medium uppercase tracking-widest text-gold hover:bg-gold/10">
                Directions
              </a>
              <a href={googleCalendarUrl(`${couple} – ${e.label}`, e.starts_at, e.venue)} target="_blank" rel="noopener"
                className="rounded-full border border-gold px-4 py-2 text-[0.7rem] font-medium uppercase tracking-widest text-gold hover:bg-gold/10">
                Add to calendar
              </a>
            </div>
          </article>
        ))}
      </section>
    ) : null,
    rsvp: guest && (token || preview) ? (
      <RsvpSection key={`rsvp-${preview}`} slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview}
        rsvpBy={inv.rsvp_by ? formatDay(inv.rsvp_by) : null} />
    ) : (
      <p key="rsvp" className="text-center text-sm text-ivory-dim">
        {token ? "This invitation link isn't valid. Please check the link the couple sent you." : "Open your personal link from WhatsApp to reply."}
      </p>
    ),
  };

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} bg-lacquer px-4 pb-16 pt-8 font-light text-ivory`}>
      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />
      {!preview && (
        <div className={`fixed inset-0 z-20 grid place-items-center bg-lacquer px-4 transition-all duration-700 ${open ? "invisible opacity-0" : "opacity-100"}`}
          role="dialog" aria-label="Invitation envelope">
          <div className={`flex w-full max-w-md flex-col gap-4 p-10 text-center ${frame}`}>
            <Ornament />
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gold-soft">A wedding invitation for</p>
            <p className="font-script text-5xl leading-tight text-gold">{dear}</p>
            <p className="text-ivory-dim">සුබ මංගල්‍යයක් සඳහා ආරාධනයි</p>
            <div>
              <button type="button" onClick={() => { setOpen(true); announceOpen(); }}
                className="rounded-full bg-gold px-7 py-3 text-xs font-medium uppercase tracking-widest text-lacquer hover:bg-ivory">
                Open invitation
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto flex max-w-xl flex-col gap-14">
        {visibleSections(inv.sections).map((id) => blocks[id])}
        <footer className="text-center text-xs uppercase tracking-[0.14em] text-gold-soft">
          <Ornament />
          <p className="mt-3">Made with Eternal Chapter</p>
        </footer>
      </main>
    </div>
  );
}
