"use client";
import type { DesignProps } from "../types";
import { OrnateFrame, Pampas, embossMaroon, paperGrain } from "./art";
import EmbossEnvelope from "./Envelope";
import { Fade, Letters, Scene, StoryShell, dateParts, initialsOf, useOpening, type StoryLook } from "./Story";

const PAPER = "#efe7dc";

const look: StoryLook = {
  ink: "#6e2a35", accent: "#7a2f3c", muted: "#9a7f78", line: "#cdb9ab",
  caps: "font-serif uppercase tracking-[0.26em]", script: "font-script", body: "font-serif",
  tone: "ivory", frame: "border-[5px] border-[#f7f1e8] shadow-[0_10px_24px_rgba(90,50,40,.18)]", photo: "arch", names: "script",
  button: "inline-flex items-center gap-2 border border-[#7a2f3c]/40 px-5 py-2.5 font-serif text-[0.7rem] uppercase tracking-[0.24em] text-[#6e2a35]",
};

/** Paper with soft window light and leaf shadows drifting across it. */
function Light() {
  return (
    <div className="absolute inset-0" style={{ background: `${paperGrain}, linear-gradient(170deg,#f4eee6,${PAPER} 55%,#e5dace)` }}>
      <span className="absolute -inset-[25%] opacity-[0.15] blur-[26px]"
        style={{ background: "repeating-linear-gradient(115deg, transparent 0 90px, #4a3428 90px 140px, transparent 140px 175px, #4a3428 175px 186px, transparent 186px 360px)", animation: "st-wave 11s ease-in-out infinite" }} />
      <svg viewBox="0 0 200 200" className="absolute -right-[10%] -top-[6%] w-[70%] opacity-[0.14] blur-[6px]" style={{ animation: "st-leaves 7s ease-in-out infinite", transformOrigin: "80% 0%" }} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d="M0 0Q30-14 60 0Q30 14 0 0Z" fill="#3a281e" transform={`translate(${60 + i * 18} ${30 + i * 22}) rotate(${110 + i * 12})`} />)}
      </svg>
    </div>
  );
}

function Paper({ children, kind, plain = false }: { children: React.ReactNode; kind?: string; plain?: boolean }) {
  const seed = { invite: 5, photo: 8, calendar: 12, event: 15, list: 19, rsvp: 22, wide: 25, text: 28 }[kind ?? ""] ?? 31;
  const right = seed % 2 === 0;
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center self-stretch px-8 py-16" style={{ color: look.ink }}>
      {!plain && <Pampas seed={seed} paper={PAPER} className={`pointer-events-none absolute bottom-0 h-[50%] w-auto opacity-90 ${right ? "-right-[6%] -scale-x-100" : "-left-[6%]"}`} />}
      <div className="relative w-full max-w-[340px]">{children}</div>
    </div>
  );
}

export default function PampasEmboss(p: DesignProps) {
  const { invitation: inv, guest, preview = false } = p;
  const o = useOpening(inv, 2600);
  const d = dateParts(inv.events[0]?.starts_at);
  const opening = o.stage === "opening";
  const cover = <EmbossEnvelope opening={opening} onOpen={o.open} preview={preview} guestName={guest?.name} image="/story/pampas-envelope.jpg" />;

  const lead = (
    <Scene preview={preview}>
      <Paper kind="lead" plain>
        <div className="flex flex-col items-center gap-1 text-center">
          <Letters text="YOU'RE" className="font-serif text-[1rem] tracking-[0.3em] text-[#8e4a55]" delay={2.4} step={0.1} />
          <Letters text="cordially" className="-my-1 font-script text-[3.4rem] leading-tight text-[#7d716c]" delay={2.8} step={0.1} />
          <Letters text="INVITED" className="font-serif text-[1rem] tracking-[0.3em] text-[#8e4a55]" delay={3.7} step={0.1} />
          <Fade delay={4.6} className="mt-6 font-serif italic text-[#9a7f78]">dear {guest?.name ?? "friend"}</Fade>
        </div>
      </Paper>
    </Scene>
  );

  const closing = (
    <div className="relative -my-px flex w-full flex-1 flex-col items-center justify-center self-stretch px-8 py-16" style={{ background: embossMaroon("#3f0a14") }}>
      <div className="relative w-[70%] max-w-[300px]">
        <OrnateFrame className="w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#f0dcd0]">
          <Letters text={initialsOf(inv).split("").join(" ")} className="font-script text-[3.4rem]" delay={2} step={0.2} />
        </div>
      </div>
      <Letters text={`${inv.partner1} & ${inv.partner2}`} className="mt-6 font-script text-4xl text-[#f0dcd0]" delay={2.6} step={0.06} />
      {d.full && <Fade delay={3.4} className="mt-2 font-serif text-[0.62rem] uppercase tracking-[0.34em] text-[#e8c7c7]">{d.full}</Fade>}
      <Fade delay={3.8} className="mt-8 font-serif text-[0.5rem] uppercase tracking-[0.34em] text-[#e8c7c7]/70">Made with Eternal Chapter</Fade>
    </div>
  );

  return (
    <StoryShell p={p} o={o} bg={PAPER} color={look.ink} backdrop={<Light />} cover={cover} lead={lead} look={look}
      Frame={({ children, kind }) => <Paper kind={kind}>{children}</Paper>} closing={closing} flushEnd
      navLook="bg-[#f7f1e8]/90 text-[#7a2f3c] shadow-[0_8px_30px_rgba(90,50,40,.18)]" />
  );
}
