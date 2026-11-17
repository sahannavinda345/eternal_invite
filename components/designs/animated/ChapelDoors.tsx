"use client";
import { useState } from "react";
import { formatLongDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import { Sparkle } from "./ornaments";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";

const theme: SectionTheme = {
  tone: "ivory",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#a8874a]",
  heading: "text-center font-serif text-3xl italic text-[#4a3f35]",
  names: "font-serif italic font-medium leading-[1.05] text-[#4a3f35]",
  amp: <span className="font-serif text-3xl italic text-[#a8874a]">&amp;</span>,
  text: "text-[#3a3530]",
  muted: "text-[#76695c]",
  card: "flex flex-col items-center gap-2 rounded-t-[999px] border border-[#a8874a]/40 bg-white/60 px-6 pb-7 pt-12 text-center shadow-[0_12px_40px_rgba(110,90,50,.08)]",
  eventTitle: "font-serif text-2xl italic text-[#4a3f35]",
  eventDate: "text-sm tracking-wide text-[#3a3530]",
  btn: "rounded-full border border-[#a8874a]/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#4a3f35] hover:bg-[#a8874a]/10",
  divider: (
    <svg viewBox="0 0 120 20" width="120" height="20" aria-hidden="true">
      <path d="M0 10H48M72 10H120" stroke="#a8874a" strokeWidth=".8" />
      <path d="M60 2C55 2 52 6 52 10C52 14 55 18 60 18C65 18 68 14 68 10C68 6 65 2 60 2Z" fill="none" stroke="#a8874a" strokeWidth=".8" />
      <path d="M60 5V15M56 9H64" stroke="#a8874a" strokeWidth=".8" />
    </svg>
  ),
  photoFrame: "rounded-lg border-[3px] border-white shadow-[0_0_0_1px_#a8874a,0_14px_30px_rgba(74,63,53,.12)]",
};

/** One leaf of the chapel door: carved panels and a ring handle. */
function DoorLeaf({ side }: { side: "left" | "right" }) {
  const handleX = side === "left" ? "right-3" : "left-3";
  return (
    <div className={`door door-${side} absolute inset-y-0 ${side === "left" ? "left-0 origin-left" : "right-0 origin-right"} w-1/2 border-[#c9b48a] bg-gradient-to-b from-[#fbf7ef] to-[#efe5d2] ${side === "left" ? "border-r" : "border-l"}`}>
      <div className="absolute inset-x-4 top-[18%] h-[34%] rounded-t-[999px] border border-[#c9b48a] shadow-[inset_0_0_0_4px_rgba(255,255,255,.6)]" />
      <div className="absolute inset-x-4 bottom-[8%] h-[30%] border border-[#c9b48a] shadow-[inset_0_0_0_4px_rgba(255,255,255,.6)]">
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#c9b48a]" />
      </div>
      <div className={`absolute top-[70%] ${handleX} h-8 w-8 rounded-full border-[3px] border-[#a8874a] shadow-md`} />
    </div>
  );
}

export default function ChapelDoors(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [opening, setOpening] = useState(false);
  const [open, setOpen] = useState(false);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  // In the editor's phone frame the cover fills one phone screen (600px) until it is opened
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";

  function openDoors() {
    setOpening(true);
    announceOpen();
    setTimeout(() => setOpen(true), 1500);
  }

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden bg-[#f7f2e9] pb-20 text-[#3a3530]`}
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, #ffffff 0%, #f7f2e9 50%, #ece2cf 100%)" }}>
      {/* Doors cover */}
      <div className={`${pos} inset-0 z-30 bg-[#e9dfcb] transition-opacity duration-700 ${open ? "pointer-events-none opacity-0" : ""}`}>
        {/* behind the doors: the couple's photo, or warm light */}
        {inv.cover_photo && (
          <div className="absolute inset-x-3 bottom-0 top-6 overflow-hidden rounded-t-[999px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inv.cover_photo} alt="" className={`h-full w-full object-cover transition-transform duration-[2500ms] ${opening ? "scale-100" : "scale-110"}`} />
          </div>
        )}
        <div className={`absolute inset-0 grid place-items-center ${inv.cover_photo ? "mix-blend-screen" : ""}`}>
          <div className={`h-[70%] w-[80%] rounded-t-[999px] bg-[radial-gradient(ellipse_at_center,#fffef8_0%,#fff6dc_40%,transparent_75%)] transition-opacity duration-1000 ${opening ? "opacity-100" : "opacity-0"}`} />
        </div>
        {/* arch frame with doors */}
        <div className={`absolute inset-x-3 bottom-0 top-6 overflow-hidden rounded-t-[999px] border-[6px] border-[#d8c7a2] ${opening ? "doors-open" : ""}`}
          style={{ boxShadow: "inset 0 0 0 2px #fff8e8" }}>
          <DoorLeaf side="left" />
          <DoorLeaf side="right" />
          <div className={`absolute inset-x-5 top-[20%] flex flex-col items-center gap-4 rounded-3xl bg-[#fbf7ef]/80 px-3 py-5 text-center shadow-[0_0_40px_20px_rgba(251,247,239,.8)] transition-opacity duration-500 ${opening ? "opacity-0" : "opacity-100"}`}>
            <p className="anim-rise text-[0.6rem] uppercase tracking-[0.34em] text-[#a8874a]">Celebrating the marriage of</p>
            <p className="anim-rise font-serif text-3xl sm:text-4xl italic leading-tight text-[#4a3f35]" style={{ animationDelay: ".2s" }}>
              {inv.partner1 || "Partner"} <span className="text-[#a8874a]">&amp;</span> {inv.partner2 || "Partner"}
            </p>
            {first && <p className="anim-rise text-xs tracking-[0.18em] text-[#76695c]" style={{ animationDelay: ".35s" }}>{formatLongDate(first.starts_at)}</p>}
            <button type="button" onClick={openDoors} disabled={opening} style={{ animationDelay: ".5s" }}
              className="anim-rise rounded-full border border-[#a8874a] bg-white/80 px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.28em] text-[#4a3f35] shadow-md hover:bg-white">
              Open the doors
            </button>
            <div className="anim-rise" style={{ animationDelay: ".65s" }}>
              <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#a8874a]">Dear</p>
              <p className="font-serif text-lg uppercase tracking-[0.1em] text-[#3a3530]">{guest?.name ?? "Our dear guest"}</p>
            </div>
          </div>
        </div>
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="light" />

      {/* floating sparkles of light */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="anim-twinkle absolute" style={{ left: `${(i * 29) % 96}%`, top: `${(i * 53) % 96}%`, animationDelay: `${(i % 6) * 0.4}s` }}>
            <Sparkle size={6 + (i % 3) * 3} color="#c9a14f" />
          </span>
        ))}
      </div>

      <main className="relative z-[2] mx-auto flex max-w-xl flex-col gap-14 px-5 pt-16">
        <ThemedSections {...props} theme={theme} />
        <footer className="text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#a8874a]">Made with Eternal Chapter</footer>
      </main>
    </div>
  );
}
