"use client";
import { useState } from "react";
import { formatLongDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import { Garland } from "./ornaments";

const theme: SectionTheme = {
  tone: "gold",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#e8c27a]",
  heading: "text-center font-serif text-3xl italic text-[#f3d28c]",
  names: "font-serif italic font-medium leading-[1.05] text-[#f3d28c]",
  amp: <span className="font-script text-4xl not-italic text-[#e8c27a]">&amp;</span>,
  text: "text-[#fbeee0]",
  muted: "text-[#e6c9b5]",
  card: "flex flex-col items-center gap-2 rounded-2xl border border-[#e8c27a]/40 bg-[#3b0a10]/70 p-6 text-center shadow-[inset_0_0_0_4px_rgba(232,194,122,.08)]",
  eventTitle: "font-serif text-2xl italic text-[#f3d28c]",
  eventDate: "text-sm tracking-wide text-[#fbeee0]",
  btn: "rounded-full border border-[#e8c27a]/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f3d28c] hover:bg-[#e8c27a]/10",
  divider: (
    <svg viewBox="0 0 120 16" width="120" height="16" aria-hidden="true">
      <path d="M0 8H44M76 8H120" stroke="#e8c27a" strokeWidth=".8" />
      <circle cx="60" cy="8" r="5" fill="#ef8a1f" stroke="#c25e0e" /><circle cx="48" cy="8" r="3" fill="#f6c33b" /><circle cx="72" cy="8" r="3" fill="#f6c33b" />
    </svg>
  ),
  photoFrame: "rounded-lg border-2 border-[#e8c27a] shadow-[0_0_0_6px_rgba(232,194,122,.12)]",
};

const velvet = "repeating-linear-gradient(90deg, #6e0b16 0px, #8f1220 18px, #a5182a 30px, #7a0d19 46px, #5a0912 60px)";

function Curtain({ side }: { side: "left" | "right" }) {
  return (
    <div className={`curtain curtain-${side} absolute inset-y-0 ${side === "left" ? "left-0 origin-left" : "right-0 origin-right"} w-1/2`}
      style={{ background: velvet, boxShadow: side === "left" ? "inset -20px 0 30px rgba(0,0,0,.35)" : "inset 20px 0 30px rgba(0,0,0,.35)" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      {/* tassel */}
      <div className={`absolute top-[72%] ${side === "left" ? "right-3" : "left-3"} flex flex-col items-center`} aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-[#e8c27a]" />
        <span className="h-8 w-2 rounded-b-full bg-gradient-to-b from-[#e8c27a] to-[#a8833f]" />
      </div>
    </div>
  );
}

export default function CrimsonCurtain(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [parting, setParting] = useState(false);
  const [open, setOpen] = useState(false);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";

  function part() {
    if (parting) return;
    setParting(true);
    announceOpen();
    setTimeout(() => setOpen(true), 2000);
  }

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden pb-20 text-[#fbeee0]`}
      style={{ background: "radial-gradient(ellipse at 50% 20%, #7a1420 0%, #4a0910 55%, #2a0408 100%)" }}>
      {/* Curtains */}
      <div className={`${pos} inset-0 z-30 ${parting ? "curtains-open" : ""} ${open ? "pointer-events-none" : ""}`}>
        <Curtain side="left" />
        <Curtain side="right" />
        {/* valance */}
        <div className="absolute inset-x-0 top-0 h-10" style={{ background: velvet, transform: "scaleX(1.02)" }} aria-hidden="true">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute -bottom-2 h-3 w-full">
            <path d={`M0 0${Array.from({ length: 10 }, (_, i) => ` Q${i * 10 + 5} 10 ${(i + 1) * 10} 0`).join("")}`} fill="#e8c27a" />
          </svg>
        </div>
        <button type="button" onClick={part}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center transition-opacity duration-500 ${parting ? "opacity-0" : ""}`}>
          <span className="relative grid h-16 w-16 place-items-center" aria-hidden="true">
            <span className="absolute inset-0 rounded-full border-2 border-[#f3d28c]" style={{ animation: "ec-ring 1.8s ease-out infinite" }} />
            <span className="absolute inset-0 rounded-full border-2 border-[#f3d28c]" style={{ animation: "ec-ring 1.8s ease-out .9s infinite" }} />
            <span className="h-4 w-4 rounded-full bg-[#f3d28c]" />
          </span>
          <span className="font-serif text-3xl italic text-[#fbeee0]">Dear {guest?.name ?? "guest"},</span>
          <span className="text-[0.62rem] uppercase tracking-[0.34em] text-[#f3d28c]">Tap to open</span>
        </button>
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />

      {/* Marigold garlands */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1]" aria-hidden="true">
        <div className="anim-sway"><Garland drop={44} /></div>
        <div className="absolute inset-x-0 top-0 opacity-90" style={{ animation: "ec-sway 5s ease-in-out .7s infinite", transformOrigin: "top" }}><Garland drop={70} /></div>
      </div>

      <main className="relative z-[2] mx-auto flex max-w-xl flex-col gap-14 px-5 pt-32">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[#e8c27a]">Shubh Vivah · A celebration of love</p>
          {first && <p className="text-xs tracking-[0.2em] text-[#e6c9b5]">{formatLongDate(first.starts_at)}</p>}
        </div>
        <ThemedSections {...props} theme={theme} />
        <footer className="text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#e8c27a]/70">Made with Eternal Chapter</footer>
      </main>
    </div>
  );
}
