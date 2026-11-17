"use client";
import { useEffect, useRef, useState } from "react";
import { formatShortDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import useScrollProgress from "./useScrollProgress";
import { Plane } from "./ornaments";

const gold = "#d9b36c";

const theme: SectionTheme = {
  tone: "navy",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#d9b36c]",
  heading: "text-center font-serif text-3xl text-[#f4ead8]",
  names: "font-serif font-medium leading-[1.05] text-[#f4ead8]",
  amp: <span className="font-script text-4xl text-[#d9b36c]">&amp;</span>,
  text: "text-[#f4ead8]",
  muted: "text-[#b9c2d6]",
  card: "flex flex-col items-center gap-2 rounded-2xl border border-[#d9b36c]/25 bg-white/[0.04] p-6 text-center backdrop-blur-md",
  eventTitle: "font-serif text-2xl text-[#f4ead8]",
  eventDate: "text-sm tracking-wide text-[#f4ead8]",
  btn: "rounded-full border border-[#d9b36c]/60 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#d9b36c] hover:bg-white/5",
  divider: (
    <span className="flex items-center gap-2" aria-hidden="true">
      <span className="h-px w-10 border-t border-dashed border-[#d9b36c]/60" /><Plane size={14} /><span className="h-px w-10 border-t border-dashed border-[#d9b36c]/60" />
    </span>
  ),
  photoFrame: "rounded-2xl border border-[#d9b36c]/40 shadow-[0_0_40px_rgba(217,179,108,.12)]",
};

function Sky() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <span key={i} className="anim-twinkle absolute rounded-full bg-white"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, width: i % 5 ? 2 : 3, height: i % 5 ? 2 : 3, animationDelay: `${(i % 8) * 0.3}s` }} />
      ))}
      {[0, 1, 2].map((i) => (
        <span key={`c${i}`} className="absolute h-16 w-64 rounded-full bg-white/[0.05] blur-2xl"
          style={{ top: `${20 + i * 28}%`, animation: `ec-drift ${40 + i * 15}s linear ${-i * 12}s infinite` }} />
      ))}
    </div>
  );
}

export default function BoardingPass(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [loaded, setLoaded] = useState(false);
  const [boarding, setBoarding] = useState(false);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(root);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";
  const flightNo = first?.starts_at ? `EC ${first.starts_at.slice(8, 10)}${first.starts_at.slice(5, 7)}` : "EC 0001";
  const time = first?.starts_at ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" }).format(new Date(first.starts_at)) : "--:--";

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 2300); return () => clearTimeout(t); }, []);

  function board() {
    if (boarding) return;
    setBoarding(true);
    announceOpen();
    setTimeout(() => setOpen(true), 1800);
  }

  return (
    <div ref={root} className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden pb-20 text-[#f4ead8]`}
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1d2f5c 0%, #0f1c3d 50%, #070d1f 100%)" }}>
      <Sky />

      {/* Cover: preloader, then the boarding pass */}
      <div className={`${pos} inset-0 z-30 flex items-center justify-center px-5 transition-opacity duration-700 ${open ? "pointer-events-none opacity-0" : ""}`}
        style={{ background: "radial-gradient(ellipse at 50% 30%, #1d2f5c 0%, #0f1c3d 55%, #070d1f 100%)" }}>
        <Sky />
        {!loaded ? (
          <div className="relative flex w-full max-w-xs flex-col items-center gap-4 text-center">
            <p className="text-[0.58rem] uppercase tracking-[0.34em] text-[#b9c2d6]">Flight to forever</p>
            <p className="font-serif text-4xl">{inv.partner1 || "Partner"}<br /><span className="font-script text-2xl text-[#d9b36c]">&amp;</span><br />{inv.partner2 || "Partner"}</p>
            <div className="relative mt-4 h-px w-full bg-[#d9b36c]/30">
              <div className="absolute inset-y-0 left-0 bg-[#d9b36c]" style={{ animation: "ec-load 2.2s ease-in-out forwards" }} />
            </div>
            <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#b9c2d6]">Preparing your journey…</p>
          </div>
        ) : (
          <div className="anim-rise relative w-full max-w-xs">
            {/* main ticket */}
            <div className="rounded-t-2xl bg-[#f6efe2] p-5 text-[#0f1c3d] shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#8a6a2c]">Boarding pass</span>
                <Plane size={18} color="#8a6a2c" />
              </div>
              <p className="mt-3 font-serif text-3xl leading-tight">{inv.partner1 || "Partner"} <span className="font-script text-2xl text-[#b08a3e]">&amp;</span> {inv.partner2 || "Partner"}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                {[["Passenger", guest?.name ?? "Our dear guest"], ["Flight", flightNo], ["Date", formatShortDate(first?.starts_at)], ["Boarding", time], ["From", "Our story"], ["To", "Forever"]].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[0.5rem] uppercase tracking-[0.25em] text-[#8a7a5a]">{k}</p>
                    <p className="truncate text-sm font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* perforation */}
            <div className="relative h-0 border-t-2 border-dashed border-[#c9bda6] bg-[#f6efe2]">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#0f1c3d]" /><span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#0f1c3d]" />
            </div>
            {/* stub: tears off when boarding */}
            <div className="rounded-b-2xl bg-[#f6efe2] p-4 text-center text-[#0f1c3d] shadow-2xl" style={boarding ? { animation: "ec-tear 1s ease-in forwards" } : undefined}>
              <div className="mx-auto mb-3 h-8 w-48" style={{ backgroundImage: "repeating-linear-gradient(90deg,#0f1c3d 0 2px,transparent 2px 4px,#0f1c3d 4px 5px,transparent 5px 8px)" }} aria-hidden="true" />
              <button type="button" onClick={board} className="rounded-full bg-[#0f1c3d] px-7 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#f6efe2] shadow-lg">
                Board now
              </button>
            </div>
          </div>
        )}
        {boarding && <div className="pointer-events-none absolute left-0 top-1/2" style={{ animation: "ec-fly 1.8s ease-in forwards" }}><Plane size={56} color={gold} /></div>}
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />

      {/* flight path: the plane moves along as the guest scrolls */}
      <div className={`${preview ? "sticky top-0 -mb-[600px] h-[600px]" : "fixed inset-y-0 right-0"} pointer-events-none z-[1] flex w-full justify-end`} aria-hidden="true">
        <div className="relative mr-3 h-full w-6">
          <span className="absolute inset-y-16 left-1/2 border-l border-dashed border-[#d9b36c]/30" />
          <span className="absolute left-0 transition-[top] duration-200" style={{ top: `calc(4rem + ${progress} * (100% - 8rem))` }}>
            <span className="block rotate-90"><Plane size={22} /></span>
          </span>
        </div>
      </div>

      <main className="relative z-[2] mx-auto flex max-w-xl flex-col gap-14 px-7 pt-20">
        <p className="text-center text-[0.6rem] uppercase tracking-[0.34em] text-[#b9c2d6]">Flight to forever · {flightNo}</p>
        <ThemedSections {...props} theme={theme} />
        <footer className="text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#d9b36c]/70">Welcome to forever · Made with Eternal Chapter</footer>
      </main>
    </div>
  );
}
