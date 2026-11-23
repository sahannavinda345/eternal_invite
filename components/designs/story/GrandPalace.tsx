"use client";
import type { DesignProps } from "../types";
import { CRIMSON, FloralCluster, paperGrain } from "./art";
import { Fade, Letters, Scene, StoryShell, dateParts, useOpening, type StoryLook } from "./Story";

const IVORY = "#f7efe2", CRIM = "#9b1424";

const look: StoryLook = {
  ink: "#3f1a16", accent: CRIM, muted: "#7c5a4a", line: "#c9a25a",
  caps: "font-caps uppercase tracking-[0.06em]", script: "font-script", body: "font-serif",
  tone: "ivory", frame: "rounded-sm border-[5px] border-white shadow-[0_10px_24px_rgba(90,40,20,.18)]", photo: "full",
  button: "inline-flex items-center gap-2 rounded-full bg-[#9b1424] px-5 py-2.5 font-caps text-[0.62rem] uppercase tracking-[0.2em] text-[#fbf1e1] shadow-lg shadow-[#9b1424]/25",
};

const drape = "linear-gradient(90deg,#5c0610,#a3172a 25%,#7a0a18 45%,#b01d30 65%,#6a0812)";

/** Ivory hall between rose-wrapped columns, red velvet drapes and glowing lanterns. */
function Hall({ src }: { src?: string | null }) {
  return (
    <div className="absolute inset-0" style={{ background: `${paperGrain}, radial-gradient(60% 50% at 50% 40%, #fffaf0, ${IVORY} 55%, #e6d5b8)` }}>
      {src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ animation: "ec-kenburns 24s ease-out both" }} />
          <span className="absolute inset-0 bg-[#f7efe2]/20" />
        </>
      )}
      {!src && [0, 1].map((side) => (
        <div key={side} className={`absolute inset-y-0 w-[15%] ${side ? "right-0" : "left-0"}`}>
          {/* drape */}
          <span className="absolute inset-y-0 w-[46%]" style={{ [side ? "right" : "left"]: 0, background: drape, boxShadow: "0 0 18px rgba(60,0,8,.4)" }} />
          {/* fluted ivory column */}
          <span className="absolute inset-y-0 w-[62%]" style={{ [side ? "right" : "left"]: "34%", background: "repeating-linear-gradient(90deg,#efe0c2 0 5px,#fff8e8 5px 9px,#d9c49a 9px 10px)", boxShadow: "inset 0 0 12px rgba(150,110,50,.35)" }} />
          {/* lanterns */}
          {[14, 46, 78].map((t, i) => (
            <span key={t} className="absolute h-6 w-6 rounded-full bg-[#ffd98a] blur-[6px]" style={{ top: `${t}%`, [side ? "left" : "right"]: "-30%", animation: `st-flicker ${2 + i * 0.4}s ease-in-out infinite` }} />
          ))}
          {/* roses climbing the column */}
          {[0, 1, 2, 3].map((k) => (
            <FloralCluster key={k} w={120} h={150} seed={40 + side * 10 + k} palette={CRIMSON} density={0.9}
              className="absolute w-[150%]" style={{ top: `${k * 26 - 6}%`, [side ? "right" : "left"]: "-12%" }} />
          ))}
        </div>
      ))}
      {/* swagged drape across the top */}
      {!src && (
        <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[9%] w-full" aria-hidden="true">
          <defs><linearGradient id="gp-dr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a0812" /><stop offset="1" stopColor="#b01d30" /></linearGradient></defs>
          <path d="M0 0H300V18C260 58 200 58 150 26 100 58 40 58 0 18Z" fill="url(#gp-dr)" />
          <path d="M0 18C40 58 100 58 150 26 200 58 260 58 300 18" fill="none" stroke="#d9b46a" strokeWidth="1.2" />
        </svg>
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="st-card relative mx-auto my-[6vh] w-[76%] max-w-[360px] rounded-t-[999px] px-5 pb-10 pt-16 text-center"
      style={{ background: "rgba(250,244,233,.9)", boxShadow: "0 0 0 1px rgba(201,162,90,.55), 0 0 0 6px rgba(250,244,233,.55), 0 20px 40px rgba(90,40,20,.12)" }}>
      {children}
    </div>
  );
}

function Door({ side, opening }: { side: 0 | 1; opening: boolean }) {
  return (
    <span className="absolute inset-y-[6%] w-[39%] border border-[#c9a25a]/70 transition-transform duration-[1500ms] ease-[cubic-bezier(.6,0,.3,1)]"
      style={{
        [side ? "right" : "left"]: "11%", transformOrigin: side ? "right center" : "left center",
        transform: opening ? `perspective(1200px) rotateY(${side ? -105 : 105}deg)` : "none",
        background: "linear-gradient(90deg,#efe2c6,#fff9ec 45%,#eadbbb)", boxShadow: "inset 0 0 30px rgba(150,110,50,.35)",
        borderRadius: side ? "0 999px 0 0" : "999px 0 0 0",
      }}>
      <span className="absolute inset-x-[14%] bottom-[56%] top-[12%] border-2 border-[#c9a25a]/70" style={{ borderRadius: side ? "0 999px 0 0" : "999px 0 0 0" }} />
      <span className="absolute inset-x-[14%] bottom-[10%] top-[48%] border-2 border-[#c9a25a]/70" />
      <span className="absolute top-1/2 h-10 w-2 rounded-full bg-gradient-to-b from-[#f6dc95] to-[#9a6c24]" style={{ [side ? "left" : "right"]: "8%" }} />
    </span>
  );
}

export default function GrandPalace(p: DesignProps) {
  const { invitation: inv, guest, preview = false } = p;
  const o = useOpening(inv, 1700);
  const photo = inv.cover_photo || inv.gallery?.[0];
  const d = dateParts(inv.events[0]?.starts_at);
  const title = inv.events[0]?.title || inv.events[0]?.label || "Wedding Ceremony";

  const cover = (
    <button type="button" onClick={o.open} aria-label="Open the doors"
      className={`${preview ? "absolute" : "fixed"} inset-0 z-40 block overflow-hidden transition-opacity duration-500 ${o.stage === "opening" ? "delay-[1200ms] opacity-0" : ""}`}>
      <span className="absolute inset-0 transition-transform duration-[1700ms] ease-in" style={{ transform: o.stage === "opening" ? "scale(1.5)" : "none" }}>
        {/* the hall behind the doors */}
        <span className="absolute inset-0" style={{ background: "radial-gradient(50% 60% at 50% 50%, #fff6dc, #e9cf9a 60%, #8a5a2a)" }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          )}
        </span>
        <Door side={0} opening={o.stage === "opening"} />
        <Door side={1} opening={o.stage === "opening"} />
        {/* rose arch around the doorway */}
        <FloralCluster w={240} h={140} seed={51} palette={CRIMSON} density={2.6} scale={0.55} className="absolute -left-[14%] -top-[4%] w-[64%]" />
        <FloralCluster w={240} h={140} seed={57} palette={CRIMSON} density={2.6} scale={0.55} className="absolute -right-[14%] -top-[4%] w-[64%]" />
        <FloralCluster w={140} h={420} seed={61} palette={CRIMSON} density={3.2} scale={0.55} className="absolute -left-[10%] top-[12%] w-[32%]" />
        <FloralCluster w={140} h={420} seed={67} palette={CRIMSON} density={3.2} scale={0.55} className="absolute -right-[10%] top-[12%] w-[32%]" />
      </span>
      <span className={`absolute inset-x-0 bottom-[8%] flex flex-col items-center gap-2 px-6 text-center transition-opacity duration-300 ${o.stage === "opening" ? "opacity-0" : ""}`}>
        <span className="anim-rise rounded-full bg-[#fbf3e4]/90 px-5 py-3 shadow-lg">
          <span className="block font-script text-3xl text-[#9b1424]">{inv.partner1} &amp; {inv.partner2}</span>
          <span className="block font-caps text-[0.58rem] uppercase tracking-[0.3em] text-[#7c5a4a]">Tap to open the doors{guest ? ` · ${guest.name}` : ""}</span>
        </span>
      </span>
    </button>
  );

  const lead = photo ? (
    <Scene preview={preview} className="overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={`${inv.partner1} & ${inv.partner2}`} className="st-anim absolute inset-0 h-full w-full object-cover" style={{ animation: "ec-kenburns 9s ease-out both" }} />
      <span className="absolute inset-0 bg-gradient-to-b from-[#fff8ec]/75 via-transparent to-[#2a0a06]/40" />
      <div className="absolute inset-x-0 top-[9%] flex flex-col items-center px-6 text-center">
        <Letters text={title} className="font-script text-[3rem] leading-tight text-[#9b1424]" style={{ textShadow: "0 2px 10px rgba(255,248,236,.9)" }} step={0.06} delay={0.3} />
      </div>
      {d.full && <Fade delay={1.6} className="absolute inset-x-0 bottom-[12%] text-center font-caps text-[0.7rem] uppercase tracking-[0.3em] text-[#fff4dc]">{d.full}</Fade>}
    </Scene>
  ) : null;

  const closing = (
    <Panel>
      <div className="flex flex-col items-center gap-3">
        <Letters text="With love" className="font-script text-[2.6rem] leading-tight text-[#9b1424]" step={0.07} />
        <Letters text={`${inv.partner1} & ${inv.partner2}`.toUpperCase()} className="font-caps text-[1rem] uppercase tracking-[0.06em]" delay={1} />
        {inv.families && <Fade delay={1.8} className="mt-2 max-w-[26ch] font-serif text-[0.95rem] italic text-[#7c5a4a]">{inv.families}</Fade>}
        <Fade delay={2.4} className="mt-5 font-caps text-[0.5rem] uppercase tracking-[0.34em] text-[#b08640]">Made with Eternal Chapter</Fade>
      </div>
    </Panel>
  );

  return (
    <StoryShell p={p} o={o} bg={IVORY} color={look.ink} backdrop={<Hall src={inv.backdrop} />} cover={cover} lead={lead} look={look}
      Frame={({ children }) => <Panel>{children}</Panel>} closing={closing}
      navLook="bg-[#fbf3e4]/90 text-[#9b1424] border border-[#c9a25a]/40 shadow-[0_8px_30px_rgba(90,40,20,.2)]" />
  );
}
