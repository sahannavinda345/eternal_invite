"use client";
import { useState } from "react";
import { formatLongDate } from "@/lib/utils";
import type { DesignProps } from "../types";
import ThemedSections, { type SectionTheme } from "./ThemedSections";
import MusicPlayer, { announceOpen } from "@/components/invitation/MusicPlayer";
import { EmbossedSpray } from "./ornaments";

const theme: SectionTheme = {
  tone: "ivory",
  label: "text-[0.62rem] uppercase tracking-[0.32em] text-[#9b8a6f]",
  heading: "text-center font-serif text-3xl italic text-[#5a4a3a]",
  names: "font-serif uppercase tracking-[0.08em] text-[#5a4a3a] leading-[1.1]",
  amp: <span className="font-script text-4xl normal-case text-[#b39463]">&amp;</span>,
  text: "text-[#4a3e33]",
  muted: "text-[#7a6d5f]",
  card: "flex flex-col items-center gap-2 rounded-sm border border-[#d9cfbd] bg-[#fbf8f2] p-6 text-center shadow-[0_1px_0_#fff_inset,0_10px_30px_rgba(90,74,58,.08)]",
  eventTitle: "font-serif text-2xl italic text-[#5a4a3a]",
  eventDate: "text-sm tracking-wide text-[#4a3e33]",
  btn: "rounded-full border border-[#b39463]/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#5a4a3a] hover:bg-[#b39463]/10",
  divider: <span className="block h-2 w-2 rotate-45 border border-[#b39463]" aria-hidden="true" />,
  photoFrame: "rounded-sm border-[6px] border-white shadow-[0_10px_30px_rgba(90,74,58,.15)]",
};

/** Wax seal with the couple's initials. Splits in two when broken. */
function Seal({ initials }: { initials: string }) {
  const disc = (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="ec-wax" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fbf3e6" /><stop offset=".55" stopColor="#e6d4b8" /><stop offset="1" stopColor="#c9b18c" />
        </radialGradient>
      </defs>
      <path d="M60 4C70 6 74 2 82 8C90 14 98 12 104 20C110 28 116 32 114 42C112 52 118 58 114 68C110 78 114 86 106 94C98 102 96 110 84 112C72 114 68 120 58 116C48 112 40 118 30 112C20 106 14 104 10 94C6 84 2 78 6 66C10 54 2 48 8 38C14 28 14 20 24 14C34 8 50 2 60 4Z" fill="url(#ec-wax)" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="#c4ab84" strokeWidth="2" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="#fff8ec" strokeWidth="1" opacity=".7" />
    </svg>
  );
  return (
    <div className="relative h-32 w-32 drop-shadow-[0_8px_14px_rgba(90,74,58,.35)]">
      <div className="seal-half seal-left absolute inset-0" style={{ clipPath: "polygon(0 0, 52% 0, 46% 40%, 54% 62%, 48% 100%, 0 100%)" }}>{disc}</div>
      <div className="seal-half seal-right absolute inset-0" style={{ clipPath: "polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 54% 62%, 46% 40%)" }}>{disc}</div>
      <span className="pointer-events-none absolute inset-0 grid place-items-center font-serif text-2xl italic text-[#9b7f55] [text-shadow:0_1px_0_#fff8ec] transition-opacity duration-300 [.seal-broken_&]:opacity-0">{initials}</span>
    </div>
  );
}

export default function WaxSeal(props: DesignProps) {
  const { invitation: inv, guest, preview = false } = props;
  const [broken, setBroken] = useState(false);
  const [open, setOpen] = useState(false);
  const first = inv.events[0];
  const pos = preview ? "absolute" : "fixed";
  const lock = preview && !open ? "h-[600px] overflow-hidden" : "";
  const initials = `${(inv.partner1 || "P")[0]}${(inv.partner2 || "P")[0]}`.toUpperCase();

  function breakSeal() {
    if (broken) return;
    setBroken(true);
    announceOpen();
    setTimeout(() => setOpen(true), 1900);
  }

  return (
    <div className={`relative ${preview ? "min-h-full" : "min-h-screen"} ${lock} overflow-hidden bg-[#f4efe6] pb-20 text-[#4a3e33]`}
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, #fdfbf6 0%, #f4efe6 60%, #ebe3d4 100%)" }}>
      {/* Envelope */}
      <div className={`${pos} inset-0 z-30 overflow-hidden bg-[#f1ebe0] transition-opacity duration-700 ${broken ? "seal-broken" : ""} ${open ? "pointer-events-none opacity-0" : ""}`}>
        <EmbossedSpray className="absolute -left-6 top-24 w-40 opacity-80" />
        <EmbossedSpray className="absolute -right-6 bottom-10 w-44 opacity-80" flip />
        {/* envelope folds */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 100L50 58L100 100" fill="none" stroke="#ddd3c2" strokeWidth=".3" />
          <path d="M0 0L50 58L100 0" fill="none" stroke="#e2d9c9" strokeWidth=".2" />
        </svg>
        {/* top flap */}
        <div className="flap absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#f7f2e9] to-[#ece4d5] shadow-[0_6px_14px_rgba(90,74,58,.12)]"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        <div className={`absolute inset-x-0 top-8 flex flex-col items-center gap-1 px-6 text-center transition-opacity duration-500 ${broken ? "opacity-0" : ""}`}>
          <p className="anim-rise text-[0.58rem] uppercase tracking-[0.3em] text-[#9b8a6f]">You are invited to the wedding of</p>
          <p className="anim-rise font-serif text-3xl uppercase tracking-[0.1em] text-[#5a4a3a]" style={{ animationDelay: ".15s" }}>{inv.partner1 || "Partner"}</p>
          <p className="anim-rise font-script text-3xl text-[#b39463]" style={{ animationDelay: ".25s" }}>&amp;</p>
          <p className="anim-rise font-serif text-3xl uppercase tracking-[0.1em] text-[#5a4a3a]" style={{ animationDelay: ".35s" }}>{inv.partner2 || "Partner"}</p>
          {first && <p className="anim-rise mt-1 text-xs tracking-[0.3em] text-[#7a6d5f]" style={{ animationDelay: ".45s" }}>{formatLongDate(first.starts_at)}</p>}
        </div>
        <button type="button" onClick={breakSeal} aria-label="Break the seal and open the invitation"
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105">
          <Seal initials={initials} />
        </button>
        <div className={`absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 px-6 text-center transition-opacity duration-500 ${broken ? "opacity-0" : ""}`}>
          <p className="font-script text-3xl text-[#b39463]">Dear {guest?.name ?? "guest"}</p>
          <button type="button" onClick={breakSeal}
            className="rounded-full bg-[#5a4a3a] px-7 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#fbf8f2] shadow-lg hover:bg-[#6b5948]">
            Open invitation
          </button>
          <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#9b8a6f]">Tap to break the seal</p>
        </div>
      </div>

      <MusicPlayer src={inv.music_url} preview={preview} tone="light" />
      <EmbossedSpray className="pointer-events-none absolute -left-8 top-10 w-40 opacity-60" />
      <EmbossedSpray className="pointer-events-none absolute -right-8 top-[40%] w-40 opacity-60" flip />

      <main className="relative z-[2] mx-auto flex max-w-xl flex-col gap-14 px-5 pt-16">
        <ThemedSections {...props} theme={theme} />
        <footer className="text-center text-[0.6rem] uppercase tracking-[0.3em] text-[#9b8a6f]">Made with Eternal Chapter</footer>
      </main>
    </div>
  );
}
