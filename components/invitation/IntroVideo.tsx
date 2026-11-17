"use client";
import { useEffect, useRef, useState } from "react";
import PetalBurst from "./PetalBurst";

type Props = {
  src: string;
  /** Names shown over the petal burst at the end. */
  title: string;
  subtitle?: string;
  onDone: () => void;
  contained?: boolean; // editor phone preview
};

/**
 * Full-screen cinematic intro: the couple's clip plays with sound (started by the guest's tap),
 * then petals burst and the names fade in before the invitation appears. Guests can skip.
 */
export default function IntroVideo({ src, title, subtitle, onDone, contained = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<"playing" | "burst" | "out">("playing");

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.play().catch(() => { v.muted = true; v.play().catch(() => setStage("burst")); });
  }, []);

  useEffect(() => {
    if (stage === "burst") { const t = setTimeout(() => setStage("out"), 2600); return () => clearTimeout(t); }
    if (stage === "out") { const t = setTimeout(onDone, 700); return () => clearTimeout(t); }
  }, [stage, onDone]);

  return (
    <div className={`${contained ? "absolute" : "fixed"} inset-0 z-50 overflow-hidden bg-black transition-opacity duration-700 ${stage === "out" ? "opacity-0" : ""}`}>
      <video ref={video} src={src} playsInline preload="auto" onEnded={() => setStage("burst")}
        className={`h-full w-full object-cover transition-[filter,transform] duration-[1500ms] ${stage !== "playing" ? "scale-105 blur-[2px] brightness-75" : ""}`} />
      {stage !== "playing" && (
        <>
          <PetalBurst />
          <div className="absolute inset-0 z-[6] flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
            <p className="anim-rise text-[0.62rem] uppercase tracking-[0.4em] text-white/85">The wedding of</p>
            <p className="anim-rise font-serif text-5xl italic [text-shadow:0_2px_20px_rgba(0,0,0,.5)]" style={{ animationDelay: ".3s" }}>{title}</p>
            {subtitle && <p className="anim-rise text-[0.62rem] uppercase tracking-[0.34em] text-white/85" style={{ animationDelay: ".6s" }}>{subtitle}</p>}
          </div>
        </>
      )}
      {stage === "playing" && (
        <button type="button" onClick={() => { video.current?.pause(); setStage("burst"); }}
          style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
          className="absolute right-5 z-10 rounded-full border border-white/50 bg-black/30 px-5 py-2 text-[0.62rem] uppercase tracking-[0.3em] text-white backdrop-blur">
          Skip
        </button>
      )}
    </div>
  );
}
