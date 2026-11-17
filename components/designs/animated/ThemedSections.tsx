"use client";
import type { ReactNode } from "react";
import { formatDay, formatEventDate, formatLongDate, googleCalendarUrl, mapsUrl, visibleSections } from "@/lib/utils";
import Countdown from "@/components/invitation/Countdown";
import RsvpSection from "@/components/invitation/RsvpSection";
import type { Tone } from "@/components/invitation/tones";
import type { DesignProps } from "../types";
import Gallery from "@/components/invitation/Gallery";
import Reveal from "./Reveal";

export type SectionTheme = {
  tone: Tone;
  label: string; // small caps labels
  heading: string; // section headings
  names: string; // couple names
  amp: ReactNode; // between the names
  text: string; // body text
  muted: string; // secondary text
  card: string; // event card
  eventTitle: string;
  eventDate: string;
  btn: string;
  divider: ReactNode; // ornament between sections
  heroTop?: ReactNode; // ornament above the names
  photoFrame: string; // border/shadow around photos
};

/** The invitation's sections (in the couple's chosen order), styled by a theme and revealed on scroll. */
export default function ThemedSections({ invitation: inv, guest, token, preview = false, theme: t }: DesignProps & { theme: SectionTheme }) {
  const couple = `${inv.partner1} & ${inv.partner2}`;
  const first = inv.events[0];
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const dear = guest?.name ?? "Our dear guest";

  const blocks: Record<string, ReactNode> = {
    hero: (
      <section className="flex flex-col items-center gap-4 text-center">
        {t.heroTop}
        {inv.cover_photo && (
          <div className={`mb-2 aspect-[3/4] w-44 overflow-hidden rounded-t-[999px] ${t.photoFrame}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inv.cover_photo} alt={`${couple}`} className="h-full w-full object-cover" />
          </div>
        )}
        <p className={t.label}>Together with their families</p>
        <h1 className={`${t.names} ${preview ? "text-5xl" : "text-6xl sm:text-7xl"}`}>
          <span className="block">{inv.partner1 || "Partner"}</span>
          <span className="block">{t.amp}</span>
          <span className="block">{inv.partner2 || "Partner"}</span>
        </h1>
        {first && <p className={`${t.label} !tracking-[0.25em]`}>{formatLongDate(first.starts_at)}</p>}
        {inv.families && <p className={`max-w-[38ch] text-[0.95rem] leading-relaxed ${t.muted}`}>{inv.families}</p>}
        <p className={`text-[0.95rem] ${t.muted}`}>Invitation for <b className={`font-medium ${t.text}`}>{dear}</b></p>
      </section>
    ),
    countdown: first ? (
      <section className="flex flex-col gap-4">
        <p className={`text-center ${t.label}`}>Counting down to the day</p>
        <Countdown to={first.starts_at} tone={t.tone} />
      </section>
    ) : null,
    story: inv.story ? (
      <section className="flex flex-col items-center gap-4 text-center">
        <h2 className={t.heading}>Our story</h2>
        <p className={`max-w-[42ch] whitespace-pre-line leading-relaxed ${t.muted}`}>{inv.story}</p>
      </section>
    ) : null,
    gallery: inv.gallery?.length ? (
      <section className="flex flex-col gap-5">
        <h2 className={t.heading}>Moments</h2>
        <Gallery photos={inv.gallery} frame={t.photoFrame} preview={preview} />
      </section>
    ) : null,
    events: shown.length ? (
      <section className="flex flex-col gap-5">
        <h2 className={t.heading}>Celebrations</h2>
        {shown.map((e) => (
          <article key={e.key} className={t.card}>
            <p className={t.label}>{e.label}</p>
            <h3 className={t.eventTitle}>{e.title}</h3>
            <p className={t.eventDate}>{formatEventDate(e.starts_at)}</p>
            {e.note && <p className={`text-sm ${t.muted}`}>{e.note}</p>}
            {e.venue && <p className={t.text}>{e.venue}</p>}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <a href={mapsUrl(e.venue)} target="_blank" rel="noopener" className={t.btn}>Directions</a>
              <a href={googleCalendarUrl(`${couple} – ${e.label}`, e.starts_at, e.venue)} target="_blank" rel="noopener" className={t.btn}>Add to calendar</a>
            </div>
          </article>
        ))}
      </section>
    ) : null,
    rsvp: guest && (token || preview) ? (
      <RsvpSection slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone={t.tone}
        rsvpBy={inv.rsvp_by ? formatDay(inv.rsvp_by) : null} />
    ) : (
      <p className={`text-center text-sm ${t.muted}`}>
        {token ? "This invitation link isn't valid. Please check the link the couple sent you." : "Open your personal link from WhatsApp to reply."}
      </p>
    ),
  };

  const ids = visibleSections(inv.sections).filter((id) => blocks[id]);
  return (
    <>
      {ids.map((id, i) => (
        <Reveal key={id}>
          {i > 0 && <div className="mb-14 flex justify-center">{t.divider}</div>}
          {blocks[id]}
        </Reveal>
      ))}
    </>
  );
}
