"use client";
/**
 * Ivory Seal – burgundy embossed envelope closed with a gold wax seal; inside, torn-edge ivory cards
 * on embossed burgundy paper (artwork in public/story/seal/*).
 */
import BottomNav from "@/components/invitation/BottomNav";
import IntroVideo from "@/components/invitation/IntroVideo";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import RsvpSection from "@/components/invitation/RsvpSection";
import type { EventItem } from "@/lib/types";
import { formatDay, visibleSections } from "@/lib/utils";
import type { DesignProps } from "../types";
import { Wreath } from "./art";
import EmbossEnvelope, { type EnvelopeShape } from "./Envelope";
import { Fade, Letters, Scene, StoryScenes, dateParts, storyNav, useOpening, type StoryLook } from "./Story";
import { useState } from "react";

const A = "/story/seal/";
const IMG = { envelope: A + "envelope.jpg", seal: A + "seal.webp", paper: A + "maroon.jpg", card: A + "card.webp", flowers: A + "flowers.webp", leafL: A + "leaves-left.webp", leafR: A + "leaves-right.webp", wreath: A + "wreath.jpg" };
const SHAPE: EnvelopeShape = {
  w: 941, h: 1672, centre: [470, 838],
  folds: {
    top: "0,0 941,0 941,325 472,835 468,835 0,342",
    bottom: "0,1672 0,1345 468,840 472,840 941,1335 941,1672",
    left: "0,342 468,835 468,840 0,1345",
    right: "941,325 472,835 472,840 941,1335",
  },
};
const INK = "#6b1d2a", ROSE = "#8e3b55", GREY = "#8a7d76", SOFT = "#a99a92", LINE = "#c9b5a8";

const look: StoryLook = {
  ink: INK, accent: ROSE, muted: GREY, line: LINE,
  caps: "font-serif uppercase tracking-[0.22em]", script: "font-script", body: "font-serif",
  tone: "ivory", frame: "border-[5px] border-white shadow-md", photo: "arch", names: "script",
  button: "inline-flex items-center gap-2 border border-[#6b1d2a]/40 px-5 py-2.5 font-serif text-[0.7rem] uppercase tracking-[0.22em] text-[#6b1d2a]",
};

/** A torn-edge ivory card that rises onto the burgundy paper. */
function Card({ children, flowers = false, leaves = false, tall = false }: { children: React.ReactNode; flowers?: boolean; leaves?: boolean; tall?: boolean }) {
  return (
    <div className={`st-card relative mx-auto my-[5vh] w-[84%] max-w-[380px]`} style={{ aspectRatio: tall ? undefined : "889 / 1342" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.card} alt="" className="absolute inset-0 h-full w-full select-none object-fill" style={{ filter: "drop-shadow(0 18px 22px rgba(25,0,6,.5))" }} />
      {leaves && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.leafL} alt="" className="st-anim pointer-events-none absolute -left-[6%] -top-[3%] w-[34%] -rotate-12" style={{ animation: "st-grow 1.6s cubic-bezier(.2,.7,.2,1) .4s both", transformOrigin: "60% 100%" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.leafR} alt="" className="st-anim pointer-events-none absolute -right-[6%] -top-[3%] w-[34%] rotate-12" style={{ animation: "st-grow 1.6s cubic-bezier(.2,.7,.2,1) .6s both", transformOrigin: "40% 100%" }} />
        </>
      )}
      <div className="relative flex h-full flex-col items-center justify-center px-[11%] py-[14%] text-center" style={{ color: INK }}>
        {flowers && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={IMG.flowers} alt="" className="st-fade mb-4 w-[70%]" style={{ animationDelay: ".2s" }} />
        )}
        {children}
      </div>
    </div>
  );
}

const Divider = ({ delay }: { delay: number }) => (
  <Fade delay={delay} className="my-3 flex items-center gap-2"><span className="h-px w-8" style={{ background: LINE }} /><span className="text-[0.5rem]" style={{ color: ROSE }}>✦</span><span className="h-px w-8" style={{ background: LINE }} /></Fade>
);

function DateRow({ e, delay }: { e: EventItem; delay: number }) {
  const p = dateParts(e.starts_at);
  if (!p.day) return null;
  return (
    <Fade delay={delay} className="flex flex-col items-center">
      <span className="font-serif text-[0.78rem] uppercase tracking-[0.32em]" style={{ color: INK }}>{p.month}</span>
      <span className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="border-y py-1 text-right font-serif text-[0.62rem] uppercase tracking-[0.2em]" style={{ borderColor: LINE, color: INK }}>{p.weekday}</span>
        <span className="font-serif text-[2.6rem] leading-none" style={{ color: INK }}>{p.day}</span>
        <span className="border-y py-1 text-left font-serif text-[0.62rem] uppercase tracking-[0.2em]" style={{ borderColor: LINE, color: INK }}>{p.time && p.time !== "12:00 AM" ? `at ${p.time}` : p.year}</span>
      </span>
      <span className="mt-1 font-serif text-[0.78rem] tracking-[0.32em]" style={{ color: INK }}>{p.year}</span>
    </Fade>
  );
}

export default function IvorySeal(p: DesignProps) {
  const { invitation: inv, guest, token, preview = false } = p;
  const o = useOpening(inv, 2700);
  const [wreathImg, setWreathImg] = useState(true);
  const sections = visibleSections(inv.sections);
  const shown = guest ? inv.events.filter((e) => guest.events.includes(e.key)) : inv.events;
  const first = shown[0] ?? inv.events[0];
  const d = dateParts(first?.starts_at);
  const photo = inv.cover_photo || inv.gallery?.[0];
  const lock = preview && o.stage !== "open" ? "h-[620px] overflow-hidden" : "";
  const S = (props: Omit<React.ComponentProps<typeof Scene>, "preview">) => <Scene preview={preview} {...props} />;

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-x-clip`} style={{ background: "#5a1420", color: INK }}>
      <div className={`pointer-events-none sticky top-0 z-0 overflow-hidden ${preview ? "-mb-[620px] h-[620px]" : "-mb-[100svh] h-[100svh]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.paper} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute -inset-[30%] opacity-[.05] blur-2xl" style={{ background: "linear-gradient(115deg,transparent 40%,#fff 50%,transparent 60%)", animation: "st-light 12s ease-in-out infinite" }} />
      </div>

      {o.stage !== "open" && o.stage !== "intro" && (
        <EmbossEnvelope opening={o.stage === "opening"} onOpen={o.open} preview={preview} guestName={guest?.name} image={IMG.envelope} shape={SHAPE} seal={IMG.seal} light="#f3dcc8" />
      )}
      {o.stage === "intro" && inv.intro_video && (
        <IntroVideo src={inv.intro_video} contained={preview} title={`${inv.partner1} & ${inv.partner2}`} subtitle={d.full || undefined} onDone={o.done} />
      )}
      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />

      <main className={`relative z-[2] ${o.stage === "cover" ? "st-hold" : ""}`}>
        {/* 1 · you're cordially invited */}
        {S({
          children: (
            <Card>
              <Letters text="YOU'RE" className="font-serif text-[0.95rem] tracking-[0.4em]" style={{ color: GREY }} delay={2.6} step={0.09} />
              <Letters text="CORDIALLY" className="my-1 font-serif text-[2rem] tracking-[0.1em]" style={{ color: INK }} delay={3.1} step={0.08} />
              <Letters text="INVITED" className="font-serif text-[0.95rem] tracking-[0.4em]" style={{ color: GREY }} delay={3.9} step={0.09} />
              <Fade delay={4.7} className="mt-7 font-serif italic"><span style={{ color: SOFT }}>dear {guest?.name ?? "friend"}</span></Fade>
            </Card>
          ),
        })}

        {/* 2 · we're getting married */}
        {sections.includes("hero") && S({
          id: "ec-home",
          children: (
            <Card>
              <Letters text="WE'RE GETTING" className="block font-serif text-[0.72rem] tracking-[0.3em]" style={{ color: GREY }} delay={0.3} step={0.06} />
              <Letters text="MARRIED" className="block font-serif text-[0.72rem] tracking-[0.3em]" style={{ color: GREY }} delay={1} step={0.06} />
              <div className="relative mt-6 w-full">
                <Letters text={inv.partner1 || "Partner"} className="block pl-[4%] text-left font-script text-[3.4rem] leading-none" style={{ color: ROSE }} delay={1.5} step={0.1} />
                <Fade delay={2.2} className="-my-5 text-center font-serif text-[4.4rem] font-light leading-none"><span style={{ color: "#e2d2c8" }}>&amp;</span></Fade>
                <Letters text={inv.partner2 || "Partner"} className="block pr-[2%] text-right font-script text-[3.4rem] leading-none" style={{ color: ROSE }} delay={2.5} step={0.1} />
              </div>
              {(inv.partner1_parents || inv.partner2_parents) && (
                <Fade delay={3.5} className="mt-7 font-serif text-[0.8rem] italic leading-relaxed">
                  <span style={{ color: GREY }}>{inv.partner1_parents}{inv.partner1_parents && inv.partner2_parents ? <br /> : null}{inv.partner2_parents}</span>
                </Fade>
              )}
            </Card>
          ),
        })}

        {/* 3 · photo in an arch with the date */}
        {first && S({
          id: "ec-events",
          children: (
            <Card>
              {photo && (
                <Fade delay={0.2} className="relative mx-auto mb-5 w-[78%]">
                  <span className="absolute -inset-2 rounded-t-full border" style={{ borderColor: LINE }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`${inv.partner1} & ${inv.partner2}`} className="relative aspect-[3/4] w-full rounded-t-full object-cover" />
                </Fade>
              )}
              <Letters text="IN THE CELEBRATION OF THEIR LOVE" className="mb-3 font-serif text-[0.55rem] tracking-[0.2em]" style={{ color: SOFT }} delay={0.8} step={0.02} />
              <DateRow e={first} delay={1.4} />
              {first.venue && <Fade delay={2} className="mt-3 font-serif text-[0.72rem] uppercase tracking-[0.2em]"><span style={{ color: GREY }}>{first.venue}</span></Fade>}
              {first.note && <Fade delay={2.3} className="mt-1 font-serif text-[0.85rem] italic"><span style={{ color: SOFT }}>{first.note}</span></Fade>}
            </Card>
          ),
        })}

        {/* 4 · each event: the details */}
        {sections.includes("events") && shown.map((e, i) => (
          <Scene key={e.key} preview={preview}>
            <Card flowers>
              <Letters text={i === 0 ? "the details" : "and"} className="font-script text-[2.6rem] leading-none" style={{ color: ROSE }} delay={0.4} step={0.08} />
              <Letters text={(e.title || e.label).toUpperCase()} className="mt-2 font-serif text-[0.9rem] tracking-[0.2em]" style={{ color: INK }} delay={1} step={0.04} />
              <Divider delay={1.6} />
              <DateRow e={e} delay={1.8} />
              {e.venue && <Fade delay={2.3} className="mt-4 font-serif text-[0.75rem] uppercase leading-relaxed tracking-[0.18em]"><span style={{ color: INK }}>{e.venue}</span></Fade>}
              {e.note && <Fade delay={2.5} className="mt-1 font-serif text-[0.85rem] italic"><span style={{ color: SOFT }}>{e.note}</span></Fade>}
              {e.venue && (
                <Fade delay={2.8} className="mt-4">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue)}`} target="_blank" rel="noopener" className={look.button}>Directions</a>
                </Fade>
              )}
            </Card>
          </Scene>
        ))}

        {/* 5 · calendar, story, timeline, day schedule, gallery, map */}
        <StoryScenes inv={inv} guest={guest} token={token} preview={preview} look={look}
          skip={["hero", "events", "rsvp"]}
          Frame={({ children, kind }) => <Card flowers={kind === "list"} tall={kind === "wide"}>{children}</Card>} />

        {/* 6 · kindly RSVP */}
        {sections.includes("rsvp") && S({
          id: "ec-rsvp",
          children: (
            <Card leaves tall>
              <div className="pt-6" />
              <Letters text="kindly" className="font-script text-[2.4rem] leading-none" style={{ color: ROSE }} delay={0.5} step={0.1} />
              <Letters text="RSVP" className="font-serif text-[3rem] font-light tracking-[0.08em]" style={{ color: INK }} delay={1} step={0.12} />
              {inv.rsvp_by && <Letters text={`By ${formatDay(inv.rsvp_by)}`} className="mt-2 font-serif text-[1rem] italic" style={{ color: GREY }} delay={1.6} step={0.04} />}
              <Fade delay={2.2} className="mt-6 w-full text-left">
                {guest && (token || preview) ? (
                  <RsvpSection slug={inv.slug} token={token ?? ""} guest={guest} events={inv.events} demo={preview} tone="ivory" showHeading={false} />
                ) : (
                  <p className="text-center font-serif italic" style={{ color: GREY }}>{token ? "This invitation link isn't valid." : "Open your personal link from WhatsApp to reply."}</p>
                )}
              </Fade>
            </Card>
          ),
        })}

        {/* 7 · gold wreath and names */}
        {S({
          className: "overflow-hidden",
          children: (
            <>
              {wreathImg ? (
                /* the wreath photo, whole ring visible, edges blended into the paper */
                <div className="st-fade relative w-full max-w-[480px]" style={{ aspectRatio: "941 / 1672", animationDuration: "1.6s" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMG.wreath} alt="" onError={() => setWreathImg(false)} className="absolute inset-0 h-full w-full object-cover"
                    style={{ WebkitMaskImage: "radial-gradient(ellipse 58% 52% at 50% 48%, #000 78%, transparent 100%)", maskImage: "radial-gradient(ellipse 58% 52% at 50% 48%, #000 78%, transparent 100%)" }} />
                  <div className="absolute inset-x-0 flex flex-col items-center text-center" style={{ top: "48.4%", transform: "translateY(-50%)" }}>
                    <Letters text={inv.partner1 || "Partner"} className="font-script text-[2.9rem] leading-none" style={{ color: "#f3e4d0" }} delay={1} step={0.08} />
                    <Fade delay={1.6} className="font-serif text-4xl font-light leading-none"><span style={{ color: "#e2c08a" }}>&amp;</span></Fade>
                    <Letters text={inv.partner2 || "Partner"} className="font-script text-[2.9rem] leading-none" style={{ color: "#f3e4d0" }} delay={1.9} step={0.08} />
                    {d.full && <Fade delay={2.6} className="mt-3 font-serif text-[0.6rem] uppercase tracking-[0.3em]"><span style={{ color: "#e2c08a" }}>{d.full}</span></Fade>}
                  </div>
                </div>
              ) : (
                <div className="relative flex w-[72%] max-w-[320px] items-center justify-center">
                  <Wreath className="w-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Letters text={inv.partner1 || "Partner"} className="font-script text-[2.8rem] leading-none" style={{ color: "#f3e4d0" }} delay={1} step={0.08} />
                    <Fade delay={1.6} className="font-serif text-4xl font-light leading-none"><span style={{ color: "#e2c08a" }}>&amp;</span></Fade>
                    <Letters text={inv.partner2 || "Partner"} className="font-script text-[2.8rem] leading-none" style={{ color: "#f3e4d0" }} delay={1.9} step={0.08} />
                    {d.full && <Fade delay={2.6} className="mt-3 font-serif text-[0.6rem] uppercase tracking-[0.3em]"><span style={{ color: "#e2c08a" }}>{d.full}</span></Fade>}
                  </div>
                </div>
              )}
              <Fade delay={3} className="absolute inset-x-0 bottom-[10%] text-center font-serif text-[0.5rem] uppercase tracking-[0.34em]"><span style={{ color: "#e2c08a" }}>Made with Eternal Chapter</span></Fade>
            </>
          ),
        })}
      </main>

      {o.stage === "open" && <BottomNav items={storyNav(inv, guest)} preview={preview} look="bg-[#f4ece0]/95 text-[#7d2434] shadow-[0_8px_30px_rgba(0,0,0,.35)]" />}
    </div>
  );
}
