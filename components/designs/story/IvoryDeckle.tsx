"use client";
import type { DesignProps } from "../types";
import { BLUSH, DeckleFilter, FloralCluster, GoldSeal, Wreath, embossMaroon, paperGrain } from "./art";
import { Fade, Letters, Scene, StoryShell, dateParts, initialsOf, useOpening, type StoryLook } from "./Story";

const bg = embossMaroon("#5a1220");

const look: StoryLook = {
  ink: "#5a1a26", accent: "#7d2434", muted: "#8a6f68", line: "#bfa293",
  caps: "font-serif uppercase tracking-[0.22em]", script: "font-script", body: "font-serif",
  tone: "ivory", frame: "border-[5px] border-white shadow-md", photo: "arch", names: "script",
  button: "inline-flex items-center gap-2 border border-[#7d2434]/50 px-5 py-2.5 font-serif text-[0.7rem] uppercase tracking-[0.22em] text-[#5a1a26]",
};

/** Ivory card with torn, deckled edges. */
function Card({ children, kind }: { children: React.ReactNode; kind?: string }) {
  return (
    <div className="st-card relative mx-auto my-[5vh] w-[86%] max-w-[380px]">
      <div className="absolute inset-0" style={{ background: `${paperGrain}, linear-gradient(170deg,#f6efe4,#ece2d4)`, filter: "url(#st-deckle) drop-shadow(0 16px 22px rgba(30,0,6,.45))" }} />
      {(kind === "invite" || kind === "list") && (
        <FloralCluster w={200} h={70} seed={kind === "list" ? 73 : 71} palette={BLUSH} density={0.7} className="relative mx-auto -mb-6 mt-6 w-40" />
      )}
      <div className={`relative flex flex-col items-center justify-center px-7 py-14 ${kind === "rsvp" || kind === "wide" ? "" : "min-h-[480px]"}`} style={{ color: look.ink }}>
        {children}
      </div>
    </div>
  );
}

export default function IvoryDeckle(p: DesignProps) {
  const { invitation: inv, guest, preview = false } = p;
  const o = useOpening(inv, 1700);
  const d = dateParts(inv.events[0]?.starts_at);
  const opening = o.stage === "opening";

  const cover = (
    <button type="button" onClick={o.open} aria-label="Break the seal and open"
      className={`${preview ? "absolute" : "fixed"} inset-0 z-40 block overflow-hidden transition-opacity duration-700 ${opening ? "delay-1000 opacity-0" : ""}`}
      style={{ background: bg, perspective: "1400px" }}>
      {/* envelope pocket: side and bottom flaps */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M0 100L50 60L100 100Z" fill="rgba(0,0,0,.16)" />
        <path d="M0 0L50 60L0 100Z" fill="rgba(255,255,255,.025)" />
        <path d="M100 0L50 60L100 100Z" fill="rgba(0,0,0,.07)" />
      </svg>
      {/* top flap folds back */}
      <span className="absolute inset-x-0 top-0 h-[60%] transition-transform duration-[1100ms] ease-[cubic-bezier(.6,0,.3,1)]"
        style={{ transformOrigin: "top center", transform: opening ? "rotateX(178deg)" : "none", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.45))" }}>
        <span className="absolute inset-0" style={{ background: embossMaroon("#641626"), clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
      </span>
      <span className="absolute left-1/2 top-[60%] w-[30%] max-w-[130px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
        style={{ transform: `translate(-50%,-50%) scale(${opening ? 1.25 : 1})`, opacity: opening ? 0 : 1, filter: "drop-shadow(0 6px 8px rgba(0,0,0,.4))" }}>
        <GoldSeal initials={initialsOf(inv)} className="w-full" />
      </span>
      <span className={`absolute inset-x-0 bottom-[10%] flex flex-col items-center gap-2 px-6 text-center text-[#f3e4d0] transition-opacity ${opening ? "opacity-0" : ""}`}>
        <span className="anim-rise font-script text-4xl">{inv.partner1} &amp; {inv.partner2}</span>
        <span className="anim-rise font-serif text-[0.62rem] uppercase tracking-[0.34em] text-[#e2c08a]" style={{ animationDelay: ".2s" }}>Tap the seal to open{guest ? ` · ${guest.name}` : ""}</span>
      </span>
    </button>
  );

  const lead = (
    <Scene preview={preview}>
      <Card>
        <div className="flex flex-col items-center gap-1 text-center">
          <Letters text="YOU'RE" className="font-serif text-[0.85rem] tracking-[0.4em] text-[#8a6f68]" delay={0.3} step={0.08} />
          <Letters text="CORDIALLY" className="font-serif text-[2rem] tracking-[0.1em]" delay={0.7} step={0.08} />
          <Letters text="INVITED" className="font-serif text-[0.85rem] tracking-[0.4em] text-[#8a6f68]" delay={1.5} step={0.08} />
          <Fade delay={2.3} className="mt-6 font-serif text-[0.95rem] italic text-[#8a6f68]">dear {guest?.name ?? "friend"}</Fade>
        </div>
      </Card>
    </Scene>
  );

  const closing = (
    <div className="relative mx-auto w-[78%] max-w-[330px]">
      <Wreath className="w-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#f3e4d0]">
        <Letters text={inv.partner1 || "Partner"} className="font-script text-[2.8rem] leading-none" delay={1} step={0.08} />
        <Fade delay={1.6} className="font-serif text-4xl font-light leading-none text-[#e2c08a]">&amp;</Fade>
        <Letters text={inv.partner2 || "Partner"} className="font-script text-[2.8rem] leading-none" delay={1.9} step={0.08} />
        {d.full && <Fade delay={2.6} className="mt-3 font-serif text-[0.6rem] uppercase tracking-[0.3em] text-[#e2c08a]">{d.full}</Fade>}
      </div>
      <Fade delay={3} className="mt-6 text-center font-serif text-[0.5rem] uppercase tracking-[0.34em] text-[#e2c08a]/80">Made with Eternal Chapter</Fade>
    </div>
  );

  return (
    <>
      <DeckleFilter />
      <StoryShell p={p} o={o} bg={bg} color={look.ink} cover={cover} lead={lead} look={look}
        Frame={({ children, kind }) => <Card kind={kind}>{children}</Card>} closing={closing}
        navLook="bg-[#f4ece0]/95 text-[#7d2434] shadow-[0_8px_30px_rgba(0,0,0,.35)]" />
    </>
  );
}
