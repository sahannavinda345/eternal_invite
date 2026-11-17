"use client";
import { useRef, useState } from "react";
import { formatLongDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import useScrollProgress from "./useScrollProgress";
import { PalmTop, WeddingCar } from "./ornaments";

const theme: SectionTheme = {
  tone: "palm",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#f2c46d]",
  heading: "text-center font-serif text-3xl italic text-[#fbf4e6] [text-shadow:0_2px_12px_rgba(0,0,0,.6)]",
  names: "font-serif uppercase tracking-[0.08em] text-[#fbf4e6] leading-[1.1] [text-shadow:0_2px_16px_rgba(0,0,0,.6)]",
  amp: <span className="font-script text-4xl normal-case text-[#f2c46d]">&amp;</span>,
  text: "text-[#fbf4e6]",
  muted: "text-[#e9e2d2]",
  card: "flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-black/50 p-6 text-center backdrop-blur-md",
  eventTitle: "font-serif text-2xl italic text-[#fbf4e6]",
  eventDate: "text-sm tracking-wide text-[#fbf4e6]",
  btn: "rounded-full border border-[#f2c46d]/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f2c46d] hover:bg-white/10",
  divider: <span className="block h-6 w-px bg-gradient-to-b from-transparent via-[#f2c46d] to-transparent" aria-hidden="true" />,
  photoFrame: "rounded-2xl border-4 border-[#fbf4e6] shadow-[0_14px_30px_rgba(0,0,0,.4)]",
};

/**
 * Scroll-driven road trip: the road and palms roll by as the guest scrolls,
 * and the wedding car drives towards the venue.
 */
function Road({ progress, preview }: { progress: number; preview: boolean }) {
  const travel = progress * 2400; // px of road passed
  const palms = [0, 1, 2, 3, 4, 5];
  return (
    <div className={`${preview ? "sticky top-0 -mb-[600px] h-[600px]" : "fixed inset-0"} z-0 overflow-hidden`} aria-hidden="true">
      {/* verges */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #3f6b35 0%, #5e8a46 18%, #d9c79c 26%, #d9c79c 74%, #5e8a46 82%, #3f6b35 100%)" }} />
      {/* road */}
      <div className="absolute inset-y-0 left-[28%] right-[28%] bg-[#4a4a48] shadow-[inset_8px_0_0_#e8e2d0,inset_-8px_0_0_#e8e2d0]">
        <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2"
          style={{ backgroundImage: "linear-gradient(#f2e6b8 0 50%, transparent 50% 100%)", backgroundSize: "6px 60px", backgroundPositionY: `${travel}px` }} />
      </div>
      {/* palms on both sides, rolling down */}
      {palms.map((i) => {
        const y = ((i * 260 + travel * 1.0) % 1560) - 200;
        return (
          <div key={i} className="absolute" style={{ top: y, left: i % 2 ? "auto" : "-30px", right: i % 2 ? "-30px" : "auto", transform: `rotate(${i * 35}deg)` }}>
            <PalmTop size={150 + (i % 3) * 20} color={i % 3 ? "#2f5a2b" : "#3a6a2f"} />
          </div>
        );
      })}
      {/* palm shadows across the road */}
      {palms.map((i) => (
        <div key={`s${i}`} className="absolute left-[24%] right-[24%] h-24 rounded-[50%] bg-black/15 blur-md"
          style={{ top: ((i * 330 + travel * 1.0) % 1650) - 150 }} />
      ))}
      {/* the car: drives up the screen as the guest scrolls */}
      <div className="absolute left-1/2 -translate-x-1/2 transition-[bottom] duration-200" style={{ bottom: `${8 + progress * 55}%` }}>
        <div style={{ transform: `rotate(${Math.sin(progress * 18) * 3}deg)` }}><WeddingCar width={preview ? 50 : 64} /></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/40" />
    </div>
  );
}

export default function CoastalDrive(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(root);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";

  return (
    <div ref={root} className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden bg-[#3f6b35] pb-28 text-[#fbf4e6]`}>
      <Road progress={progress} preview={preview} />

      {/* Cover: save the date */}
      <div className={`${pos} inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6 text-center transition-all duration-1000 ${open ? "pointer-events-none translate-y-[-30%] opacity-0" : ""}`}
        style={{ background: "linear-gradient(180deg, rgba(20,35,18,.55), rgba(20,35,18,.35) 50%, rgba(20,35,18,.7))" }}>
        <p className="anim-rise font-script text-5xl text-[#fbf4e6] [text-shadow:0_2px_12px_rgba(0,0,0,.5)]">Save the date</p>
        <p className="anim-rise text-[0.6rem] uppercase tracking-[0.34em] text-[#f2c46d]" style={{ animationDelay: ".15s" }}>Together with our families</p>
        <p className="anim-rise font-serif text-4xl uppercase tracking-[0.1em] [text-shadow:0_2px_12px_rgba(0,0,0,.5)]" style={{ animationDelay: ".25s" }}>
          {inv.partner1 || "Partner"}<br /><span className="font-script text-3xl normal-case text-[#f2c46d]">&amp;</span><br />{inv.partner2 || "Partner"}
        </p>
        {first && (
          <div className="anim-rise rounded-2xl border border-white/20 bg-black/40 px-6 py-3 backdrop-blur" style={{ animationDelay: ".4s" }}>
            <p className="font-serif text-xl">{formatLongDate(first.starts_at)}</p>
            {first.venue && <p className="text-sm italic text-[#e9e2d2]">{first.venue}</p>}
          </div>
        )}
        <p className="anim-rise text-sm text-[#e9e2d2]" style={{ animationDelay: ".5s" }}>Especially for <span className="font-serif text-lg italic text-[#fbf4e6]">{guest?.name ?? "you"}</span></p>
        <button type="button" onClick={() => { setOpen(true); announceOpen(); }} style={{ animationDelay: ".6s" }}
          className="anim-rise rounded-full bg-[#f2c46d] px-7 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#1f2a1c] shadow-lg">
          Start the drive ↓
        </button>
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />

      <main className={`relative z-[2] mx-auto flex max-w-md flex-col gap-24 px-5 pt-24 transition-opacity duration-1000 ${open ? "opacity-100" : "opacity-0"}`}>
        <ThemedSections {...props} theme={theme} />
        <footer className="rounded-full bg-black/40 py-2 text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#f2c46d] backdrop-blur">You have arrived · Made with Eternal Chapter</footer>
      </main>
    </div>
  );
}
