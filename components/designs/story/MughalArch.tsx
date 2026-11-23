"use client";
import type { DesignProps } from "../types";
import { ArchTop, CRIMSON, FloralCluster, HangingStrands } from "./art";
import { useEffect, useRef, useState } from "react";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import IntroVideo from "@/components/invitation/IntroVideo";
import BottomNav from "@/components/invitation/BottomNav";
import { Fade, Letters, SceneSize, StoryScenes, StoryShell, dateParts, initialsOf, storyNav, useOpening, type StoryLook } from "./Story";

const MAROON = "#4d0d18", GOLD = "#d4ae62";

const look: StoryLook = {
  ink: "#f6e7c6", accent: "#e8c77c", muted: "#dcc4a4", line: "#c9a25a",
  caps: "font-caps uppercase tracking-[0.08em]", script: "font-script", body: "font-serif",
  tone: "maroon", frame: "border border-[#d4ae62]/60 p-1", photo: "arch",
  button: "inline-flex items-center gap-2 border border-[#d4ae62]/70 px-5 py-2.5 font-caps text-[0.62rem] uppercase tracking-[0.2em] text-[#f0d9a8]",
};

/** The palace behind the arch: uploaded artwork, or a drawn ivory-and-gold hall full of roses. */
function Palace({ src }: { src?: string | null }) {
  if (src) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ animation: "ec-kenburns 24s ease-out both" }} />
        <span className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_45%,transparent,rgba(30,10,4,.45))]" />
      </>
    );
  }
  const pillar = "linear-gradient(90deg,#8a6a3a,#f3e2bb 18%,#fff6e0 30%,#d9bd82 46%,#f6e8c6 62%,#c8a465 82%,#5e4220)";
  return (
    <div className="absolute inset-0" style={{ background: "radial-gradient(70% 45% at 50% 38%, #fff4da 0%, #ecd3a0 30%, #b88b4c 62%, #3b2210 100%)" }}>
      {/* carved outer arch */}
      <svg viewBox="0 0 300 500" preserveAspectRatio="none" className="absolute inset-x-[-6%] top-[2%] h-[96%] w-[112%]" aria-hidden="true">
        <path d="M22 500V200C22 120 90 110 120 90 140 76 146 48 150 20 154 48 160 76 180 90 210 110 278 120 278 200V500" fill="none" stroke="#fff3d4" strokeWidth="9" opacity=".7" />
        <path d="M22 500V200C22 120 90 110 120 90 140 76 146 48 150 20 154 48 160 76 180 90 210 110 278 120 278 200V500" fill="none" stroke="#b08640" strokeWidth="1.2" strokeDasharray="2 4" />
      </svg>
      {/* gold pillars */}
      <span className="absolute inset-y-0 left-0 w-[11%]" style={{ background: pillar }} />
      <span className="absolute inset-y-0 right-0 w-[11%]" style={{ background: pillar }} />
      {/* chandelier glow + candles */}
      <span className="absolute left-1/2 top-[3%] h-24 w-40 -translate-x-1/2 rounded-full bg-[#fff3c8] blur-2xl" style={{ animation: "ec-glow 5s ease-in-out infinite" }} />
      {[8, 20, 32, 68, 80, 92].map((x, i) => (
        <span key={x} className="absolute bottom-[3%] h-5 w-5 -translate-x-1/2 rounded-full bg-[#ffd98a] blur-[5px]" style={{ left: `${x}%`, animation: `st-flicker ${1.8 + (i % 3) * 0.5}s ease-in-out infinite` }} />
      ))}
      <HangingStrands w={300} h={300} count={18} className="absolute inset-x-0 top-0 h-[48%] w-full" />
      <FloralCluster w={220} h={160} seed={11} palette={CRIMSON} className="absolute -left-[16%] -top-[3%] w-[62%]" />
      <FloralCluster w={220} h={160} seed={17} palette={CRIMSON} className="absolute -right-[16%] -top-[3%] w-[62%]" />
      <FloralCluster w={200} h={260} seed={23} palette={CRIMSON} density={1.3} className="absolute -left-[20%] bottom-[-4%] w-[58%]" />
      <FloralCluster w={200} h={260} seed={29} palette={CRIMSON} density={1.3} className="absolute -right-[20%] bottom-[-4%] w-[58%]" />
      <FloralCluster w={300} h={90} seed={31} palette={CRIMSON} className="absolute inset-x-0 bottom-[-2%] w-full" />
    </div>
  );
}

function Arch({ children }: { children: React.ReactNode }) {
  return (
    <div className="st-card relative mx-auto my-[7vh] w-[84%] max-w-[370px]" style={{ filter: "drop-shadow(0 22px 28px rgba(35,8,2,.5))" }}>
      <ArchTop fill={MAROON} line={GOLD} className="block h-auto w-full" />
      <div className="relative -mt-px px-6 pb-12 pt-1" style={{ background: MAROON, boxShadow: `inset 1.4px 0 0 ${GOLD}, inset -1.4px 0 0 ${GOLD}, inset 0 -1.4px 0 ${GOLD}` }}>
        <span className="pointer-events-none absolute inset-x-[3.3%] bottom-[10px] top-0 border-x border-b opacity-60" style={{ borderColor: GOLD }} />
        <div className="relative" style={{ color: look.ink }}>{children}</div>
      </div>
    </div>
  );
}

function DrawnMughal(p: DesignProps) {
  const { invitation: inv, guest, preview = false } = p;
  const o = useOpening(inv, 1500);
  const ini = initialsOf(inv);
  const photo = inv.cover_photo || inv.backdrop;
  const d = dateParts(inv.events[0]?.starts_at);

  const cover = (
    <button type="button" onClick={o.open} aria-label="Open the invitation"
      className={`${preview ? "absolute" : "fixed"} inset-0 z-40 block overflow-hidden text-center`}
      style={o.stage === "opening" ? { animation: "st-zoom 1.5s cubic-bezier(.5,0,.3,1) both" } : undefined}>
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ animation: "ec-kenburns 14s ease-out both" }} />
          <span className="absolute inset-0 bg-gradient-to-b from-[#fff6e6]/30 via-transparent to-[#2a0a06]/75" />
        </>
      ) : <Palace />}
      <span className="absolute inset-x-0 top-[9%] flex flex-col items-center">
        <span className="relative font-script text-[6.5rem] leading-none text-[#7a0f1f]" style={{ WebkitTextStroke: "1px #d4ae62", textShadow: "0 3px 12px rgba(255,240,210,.6)" }}>
          <span className="anim-rise inline-block">{ini[0]}</span>
          <span className="anim-rise mx-1 inline-block text-[3.2rem] text-[#b08640]" style={{ animationDelay: ".25s" }}>&amp;</span>
          <span className="anim-rise inline-block" style={{ animationDelay: ".45s" }}>{ini[1]}</span>
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-[9%] flex flex-col items-center gap-2 px-6 text-[#fff4dc]">
        <span className="anim-rise font-caps text-[1.05rem] uppercase tracking-[0.14em]" style={{ animationDelay: ".6s" }}>{inv.partner1} &amp; {inv.partner2}</span>
        {d.full && <span className="anim-rise font-caps text-[0.62rem] uppercase tracking-[0.3em] text-[#f0d9a8]" style={{ animationDelay: ".75s" }}>{d.full}</span>}
        <span className="relative mt-3 grid h-12 w-12 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-[#f0d9a8]" style={{ animation: "ec-ring 1.8s ease-out infinite" }} />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f0d9a8]" />
        </span>
        <span className="font-caps text-[0.6rem] uppercase tracking-[0.3em]">Tap to open{guest ? ` · ${guest.name}` : ""}</span>
      </span>
    </button>
  );

  const closing = (
    <Arch>
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Letters text="Awaiting to welcome" className="font-script text-[2.6rem] leading-tight text-[#e8c77c]" step={0.06} />
        <Letters text={(guest ? `${guest.name}` : "You & your family").toUpperCase()} className="font-caps text-[1rem] uppercase tracking-[0.08em]" delay={1.3} />
        <span className="my-1 block h-px w-10 bg-[#c9a25a]" />
        <Fade delay={2} className="font-serif text-lg italic text-[#dcc4a4]">with love,</Fade>
        <Letters text={`${inv.partner1} & ${inv.partner2}`} className="font-script text-4xl text-[#f6e7c6]" delay={2.3} step={0.06} />
        <Fade delay={3.4} className="mt-4 font-caps text-[0.5rem] uppercase tracking-[0.34em] text-[#c9a25a]">Made with Eternal Chapter</Fade>
      </div>
    </Arch>
  );

  return (
    <StoryShell p={p} o={o} bg="#2a1208" color={look.ink} backdrop={<Palace src={inv.backdrop} />} cover={cover} look={look}
      Frame={({ children }) => <Arch>{children}</Arch>} closing={closing} musicTone="dark"
      navLook="bg-[#4d0d18]/90 text-[#f0d9a8] border border-[#d4ae62]/40 shadow-[0_8px_30px_rgba(0,0,0,.4)]" />
  );
}

/* ================= framed palace: the invitation plays inside the arch ================= */

/** Palace photo with a see-through arch (made with scripts/arch_frame.py) and the arch box in fractions of the image. */
const FRAME = { src: "/story/mughal-frame.png", w: 720, h: 1280, box: { x0: 0.1458, y0: 0.2266, x1: 0.8694, y1: 0.995 } };

/** Size of the photo when it covers the container (like object-fit: cover). */
function useCover(ref: React.RefObject<HTMLDivElement | null>, aw: number, ah: number) {
  const [r, setR] = useState({ w: 0, h: 0, l: 0, t: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight, k = Math.max(W / aw, H / ah);
      setR({ w: aw * k, h: ah * k, l: (W - aw * k) / 2, t: (H - ah * k) / 2 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, aw, ah]);
  return r;
}

function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <span key={i} className="absolute h-[3px] w-[3px] rounded-full bg-[#ffe3a3]"
          style={{ left: `${(i * 37) % 100}%`, top: `${20 + ((i * 53) % 75)}%`, boxShadow: "0 0 6px 2px rgba(255,214,140,.55)", ["--fx" as string]: `${(i % 5) * 8 - 16}px`, animation: `ec-float ${6 + (i % 5)}s ease-in-out ${(i * 0.7) % 6}s infinite` }} />
      ))}
    </div>
  );
}

export default function MughalArch(p: DesignProps) {
  const { invitation: inv, guest, token, preview = false } = p;
  const [ok, setOk] = useState(true);
  const o = useOpening(inv, 1700);
  const root = useRef<HTMLDivElement>(null);
  const c = useCover(root, FRAME.w, FRAME.h);
  const ini = initialsOf(inv);
  const d = dateParts(inv.events[0]?.starts_at);
  if (!ok) return <DrawnMughal {...p} />;

  const B = FRAME.box;
  const win = { left: c.l + B.x0 * c.w, top: c.t + B.y0 * c.h, width: (B.x1 - B.x0) * c.w, height: (Math.min(B.y1, 0.97) - B.y0) * c.h };
  const opening = o.stage === "opening";
  const photo = inv.cover_photo || inv.gallery?.[0];
  const windowLook: StoryLook = { ...look, frame: "border border-[#d4ae62]/50 p-0.5" };

  const closing = (
    <div className="flex w-full flex-col items-center gap-3 px-4 py-8 text-center" style={{ color: look.ink }}>
      <Letters text="Awaiting to welcome" className="font-script text-[2.4rem] leading-tight text-[#e8c77c]" step={0.06} />
      <Letters text={(guest ? guest.name : "You & your family").toUpperCase()} className="font-caps text-[0.95rem] tracking-[0.08em]" delay={1.3} />
      <span className="my-1 block h-px w-10 bg-[#c9a25a]" />
      <Fade delay={2} className="font-serif text-lg italic text-[#dcc4a4]">with love,</Fade>
      <Letters text={`${inv.partner1} & ${inv.partner2}`} className="font-script text-[2.2rem] text-[#f6e7c6]" delay={2.3} step={0.06} />
      <Fade delay={3.4} className="mt-4 font-caps text-[0.48rem] uppercase tracking-[0.34em] text-[#c9a25a]">Made with Eternal Chapter</Fade>
    </div>
  );

  return (
    <div ref={root} className={`relative overflow-hidden ${preview ? "h-[620px]" : "h-[100svh]"}`} style={{ background: "#1d0a06" }}>
      {/* palace + the invitation inside its arch; slowly settles into place after the opening */}
      <div className="absolute inset-0 transition-transform duration-[1800ms] ease-out" style={{ transform: o.stage === "cover" ? "scale(1.18)" : "none" }}>
        <div className="absolute overflow-hidden" style={{ ...win, background: "radial-gradient(90% 60% at 50% 35%, #5e1220, #3f0912 70%, #2e060d)" }}>
          <Sparkles />
          <div className="absolute inset-0 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SceneSize.Provider value="min-h-full snap-start">
              <main className={o.stage === "cover" ? "st-hold" : ""} style={{ height: win.height }}>
                <StoryScenes inv={inv} guest={guest} token={token} preview={preview} look={windowLook}
                  Frame={({ children }) => <div className="w-full px-4 pb-10" style={{ color: look.ink, paddingTop: win.height * 0.14 }}>{children}</div>} closing={<div className="w-full" style={{ paddingTop: win.height * 0.1 }}>{closing}</div>} />
              </main>
            </SceneSize.Provider>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FRAME.src} alt="" onError={() => setOk(false)} className="pointer-events-none absolute max-w-none select-none"
          style={{ left: c.l, top: c.t, width: c.w, height: c.h }} />
      </div>

      {/* opening: couple photo with the monogram */}
      {o.stage !== "open" && o.stage !== "intro" && (
        <button type="button" onClick={o.open} aria-label="Open the invitation"
          className={`absolute inset-0 z-40 block overflow-hidden text-center transition-opacity duration-[1200ms] ${opening ? "pointer-events-none opacity-0" : ""}`}
          style={{ background: "#2a0e08" }}>
          {photo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1700ms]" style={{ animation: "ec-kenburns 14s ease-out both", transform: opening ? "scale(1.25)" : undefined }} />
              <span className="absolute inset-0 bg-gradient-to-b from-[#fff6e6]/25 via-transparent to-[#2a0a06]/80" />
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={FRAME.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          )}
          <span className="absolute inset-x-0 top-[8%] flex flex-col items-center">
            <span className="relative font-script text-[6rem] leading-none text-[#7a0f1f]" style={{ WebkitTextStroke: "1px #d4ae62", textShadow: "0 3px 14px rgba(255,240,210,.7)" }}>
              <span className="anim-rise inline-block">{ini[0]}</span>
              <span className="anim-rise mx-1 inline-block text-[3rem] text-[#b08640]" style={{ animationDelay: ".25s" }}>&amp;</span>
              <span className="anim-rise inline-block" style={{ animationDelay: ".45s" }}>{ini[1]}</span>
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-[8%] flex flex-col items-center gap-2 px-6 text-[#fff4dc]">
            <span className="anim-rise font-caps text-[1rem] uppercase tracking-[0.14em]" style={{ animationDelay: ".6s" }}>{inv.partner1} &amp; {inv.partner2}</span>
            {d.full && <span className="anim-rise font-caps text-[0.6rem] uppercase tracking-[0.3em] text-[#f0d9a8]" style={{ animationDelay: ".75s" }}>{d.full}</span>}
            <span className="relative mt-3 grid h-12 w-12 place-items-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border border-[#f0d9a8]" style={{ animation: "ec-ring 1.8s ease-out infinite" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f0d9a8]" />
            </span>
            <span className="font-caps text-[0.58rem] uppercase tracking-[0.3em]">Tap to open{guest ? ` · ${guest.name}` : ""}</span>
          </span>
        </button>
      )}
      {o.stage === "intro" && inv.intro_video && (
        <IntroVideo src={inv.intro_video} contained title={`${inv.partner1} & ${inv.partner2}`} subtitle={d.full || undefined} onDone={o.done} />
      )}
      <MusicPlayer src={inv.music_url} preview={preview} tone="dark" />
      {o.stage === "open" && (
        <div className={preview ? "absolute inset-x-0 bottom-0 z-40 flex justify-center" : ""}>
          <BottomNav items={storyNav(inv, guest)} preview={preview}
            look="bg-[#4d0d18]/90 text-[#f0d9a8] border border-[#d4ae62]/40 shadow-[0_8px_30px_rgba(0,0,0,.4)]" />
        </div>
      )}
    </div>
  );
}
