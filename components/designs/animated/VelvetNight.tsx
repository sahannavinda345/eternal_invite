"use client";
import { useState } from "react";
import { formatLongDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";

const theme: SectionTheme = {
  tone: "velvet",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#e3b48b]/80",
  heading: "text-center font-serif text-3xl italic text-[#f3d3b4]",
  names: "font-serif italic font-medium leading-[1.05] bg-gradient-to-r from-[#e3b48b] via-[#fff1e0] to-[#e3b48b] bg-clip-text text-transparent anim-shine",
  amp: <span className="font-script text-4xl not-italic text-[#e3b48b]">&amp;</span>,
  text: "text-[#f5e9ef]",
  muted: "text-[#d9c3cf]",
  card: "flex flex-col items-center gap-2 rounded-3xl border border-[#e3b48b]/25 bg-white/[0.05] p-6 text-center shadow-[0_0_40px_rgba(227,180,139,.08)] backdrop-blur-md",
  eventTitle: "font-serif text-2xl italic text-[#f3d3b4]",
  eventDate: "text-sm tracking-wide text-[#f5e9ef]",
  btn: "rounded-full border border-[#e3b48b]/50 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f3d3b4] hover:bg-[#e3b48b]/10",
  divider: <span className="block h-px w-24 bg-gradient-to-r from-transparent via-[#e3b48b]/70 to-transparent" aria-hidden="true" />,
  photoFrame: "rounded-2xl border border-[#e3b48b]/40 shadow-[0_0_40px_rgba(227,180,139,.15)]",
};

/** Strings of warm fairy lights draped across the top. */
function FairyLights({ bright }: { bright: boolean }) {
  const strings = [
    { d: "M-10 30 Q 100 110 210 30", n: 9 },
    { d: "M190 20 Q 300 100 410 20", n: 9 },
    { d: "M-10 70 Q 200 170 410 70", n: 14 },
  ];
  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-44 w-full" aria-hidden="true">
      <defs>
        <radialGradient id="ec-bulb"><stop offset="0" stopColor="#fff4d6" /><stop offset=".4" stopColor="#ffd48a" /><stop offset="1" stopColor="#ffd48a" stopOpacity="0" /></radialGradient>
      </defs>
      {strings.map((s, si) => (
        <g key={si}>
          <path d={s.d} stroke="#5a3d4a" strokeWidth="1" fill="none" />
          {Array.from({ length: s.n }, (_, i) => {
            // point on the quadratic curve
            const nums = s.d.match(/-?\d+/g)!.map(Number);
            const [x0, y0, cx, cy, x1, y1] = nums;
            const t = (i + 1) / (s.n + 1);
            const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1;
            const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1;
            return (
              <circle key={i} cx={x} cy={y + 4} r={bright ? 7 : 5} fill="url(#ec-bulb)" className="anim-twinkle"
                style={{ animationDelay: `${((i * 3 + si) % 7) * 0.35}s`, transformOrigin: `${x}px ${y + 4}px`, transition: "r .8s" }} />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function Fireflies({ count = 18 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[#ffd9a0] shadow-[0_0_10px_3px_rgba(255,200,120,.6)]"
          style={{
            left: `${(i * 41) % 98}%`, top: `${25 + ((i * 67) % 70)}%`,
            animation: `ec-float ${7 + (i % 5)}s ease-in-out ${-(i % 7)}s infinite`,
            ["--fx" as string]: `${(i % 2 ? 1 : -1) * (15 + (i % 4) * 10)}px`,
          }} />
      ))}
    </div>
  );
}

export default function VelvetNight(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [open, setOpen] = useState(false);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  // In the editor's phone frame the cover fills one phone screen (600px) until it is opened
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden pb-20 text-[#f5e9ef]`}
      style={{ background: "radial-gradient(ellipse at 50% 0%, #4a2140 0%, #2a1430 45%, #12081a 100%)" }}>
      {/* Cover: a glowing arch */}
      <div className={`${pos} inset-0 z-30 flex items-center justify-center px-6 transition-all duration-1000 ${open ? "pointer-events-none scale-110 opacity-0" : ""}`}
        style={{ background: "radial-gradient(ellipse at 50% 30%, #4a2140 0%, #2a1430 50%, #12081a 100%)" }}>
        <FairyLights bright={false} />
        <Fireflies count={10} />
        <div className="relative isolate flex w-full max-w-sm flex-col items-center gap-4 rounded-t-[999px] border border-[#e3b48b]/40 px-6 pb-10 pt-20 text-center shadow-[0_0_60px_rgba(227,180,139,.15),inset_0_0_60px_rgba(227,180,139,.08)]">
          {inv.cover_photo && (
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-t-[999px]" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inv.cover_photo} alt="" className="h-full w-full scale-105 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#2a1430]/30 via-[#2a1430]/55 to-[#12081a]/90" />
            </div>
          )}
          <span className="anim-glow absolute inset-0 rounded-t-[999px] border border-[#e3b48b]/30 blur-[2px]" aria-hidden="true" />
          <p className="anim-rise text-[0.6rem] uppercase tracking-[0.34em] text-[#e3b48b]/80">Our homecoming</p>
          <p className="anim-rise font-serif text-5xl italic leading-tight text-[#f3d3b4]" style={{ animationDelay: ".2s" }}>
            {inv.partner1 || "Partner"}<br /><span className="font-script text-3xl not-italic text-[#e3b48b]">&amp;</span><br />{inv.partner2 || "Partner"}
          </p>
          {first && <p className="anim-rise text-xs tracking-[0.2em] text-[#d9c3cf]" style={{ animationDelay: ".35s" }}>{formatLongDate(first.starts_at)}</p>}
          <button type="button" onClick={() => { setOpen(true); announceOpen(); }} style={{ animationDelay: ".5s" }}
            className="anim-rise mt-2 rounded-full bg-gradient-to-r from-[#e3b48b] to-[#f3d3b4] px-7 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#2a1430] shadow-lg shadow-[#e3b48b]/25">
            Step inside
          </button>
          <p className="anim-rise text-sm text-[#d9c3cf]" style={{ animationDelay: ".65s" }}>
            for <span className="font-serif text-lg italic text-[#f3d3b4]">{guest?.name ?? "our dear guest"}</span>
          </p>
        </div>
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />
      <FairyLights bright={open} />
      <Fireflies count={preview ? 10 : 18} />

      <main className="relative z-[2] mx-auto flex max-w-xl flex-col gap-14 px-5 pt-40">
        <ThemedSections {...props} theme={theme} />
        <footer className="text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#e3b48b]/60">Made with Eternal Chapter</footer>
      </main>
    </div>
  );
}
