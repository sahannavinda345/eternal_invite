"use client";
import { useState } from "react";
import { formatLongDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import Petals from "./Petals";
import { Elephant, Lotus, Mandala } from "./ornaments";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";


const theme: SectionTheme = {
  tone: "ivory",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#9a7a3c]",
  heading: "text-center font-serif text-3xl italic text-[#6b1d2a]",
  names: "font-serif italic font-medium leading-[1.05] text-[#6b1d2a]",
  amp: <span className="font-script text-4xl not-italic text-[#b08a3e]">&amp;</span>,
  text: "text-[#3d2a1e]",
  muted: "text-[#6b5a4a]",
  card: "flex flex-col items-center gap-2 rounded-2xl border border-[#b08a3e]/40 bg-white/55 p-6 text-center shadow-[0_10px_30px_rgba(120,90,40,.08)]",
  eventTitle: "font-serif text-2xl italic text-[#6b1d2a]",
  eventDate: "text-sm tracking-wide text-[#3d2a1e]",
  btn: "rounded-full border border-[#b08a3e]/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#6b1d2a] hover:bg-[#b08a3e]/10",
  divider: <Lotus />,
  photoFrame: "rounded-xl border-[3px] border-white shadow-[0_0_0_1px_#b08a3e,0_14px_30px_rgba(107,29,42,.15)]",
};

/** A perahera of elephants walking along the bottom edge. */
function Procession({ contained }: { contained: boolean }) {
  const row = (
    <div className="flex shrink-0 items-end gap-10 px-5">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="anim-bob" style={{ animationDelay: `${i * 0.2}s` }}>
          <Elephant size={i % 3 === 1 ? 70 : 58} cloth={i % 2 ? "#7a1f2b" : "#8a5a1f"} />
        </div>
      ))}
    </div>
  );
  return (
    <div className={`pointer-events-none ${contained ? "absolute" : "fixed"} inset-x-0 bottom-0 z-[2] h-16 overflow-hidden`} aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#ead9b8] to-transparent" />
      <div className="anim-walk flex w-max">{row}{row}</div>
    </div>
  );
}

export default function KandyanHeritage(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [open, setOpen] = useState(false);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  // In the editor's phone frame the cover fills one phone screen (600px) until it is opened
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden bg-[#f6efe1] pb-28 text-[#3d2a1e]`}
      style={{ backgroundImage: "radial-gradient(ellipse at top, #fffaf0 0%, #f6efe1 55%, #efe2c8 100%)" }}>
      {/* Envelope cover */}
      <div className={`${pos} inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-[#f6efe1] px-6 text-center transition-all duration-1000 ${open ? "pointer-events-none -translate-y-full opacity-0" : ""}`}
        style={{ backgroundImage: "radial-gradient(ellipse at top, #fffaf0 0%, #f6efe1 60%, #efe2c8 100%)" }}>
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 opacity-70"><Mandala size={300} className="anim-spin" /></div>
        {inv.cover_photo ? (
          <div className="anim-bloom relative mt-16 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-[0_0_0_1px_#b08a3e,0_10px_30px_rgba(107,29,42,.2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inv.cover_photo} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <p className={`anim-rise relative ${inv.cover_photo ? "" : "mt-24"} text-[0.62rem] uppercase tracking-[0.34em] text-[#9a7a3c]`}>The wedding of</p>
        <p className="anim-rise relative font-serif text-5xl italic text-[#6b1d2a]" style={{ animationDelay: ".2s" }}>
          {inv.partner1 || "Partner"} <span className="font-script text-4xl not-italic text-[#b08a3e]">&amp;</span> {inv.partner2 || "Partner"}
        </p>
        {first && <p className="anim-rise text-xs tracking-[0.2em] text-[#6b5a4a]" style={{ animationDelay: ".35s" }}>{formatLongDate(first.starts_at)}</p>}
        <button type="button" onClick={() => { setOpen(true); announceOpen(); }} style={{ animationDelay: ".5s" }}
          className="anim-rise mt-2 rounded-full border border-[#b08a3e] bg-white/60 px-7 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-[#6b1d2a] shadow-lg shadow-[#b08a3e]/10 hover:bg-white">
          Open invitation
        </button>
        <div className="anim-rise" style={{ animationDelay: ".65s" }}>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#9a7a3c]">Dear</p>
          <p className="font-serif text-lg uppercase tracking-[0.12em] text-[#3d2a1e]">{guest?.name ?? "Our dear guest"}</p>
        </div>
        <Procession contained />
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="light" />

      {/* Background ornaments */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 opacity-40" aria-hidden="true">
        <Mandala size={340} className={open ? "anim-bloom" : ""} />
      </div>
      {open && <Petals contained={preview} color="#c4704a" count={preview ? 8 : 14} />}

      <main className="relative z-[3] mx-auto flex max-w-xl flex-col gap-14 px-5 pt-56">
        <ThemedSections {...props} theme={theme} />
        <footer className="text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#9a7a3c]">Made with Eternal Chapter</footer>
      </main>

      <Procession contained />
    </div>
  );
}

