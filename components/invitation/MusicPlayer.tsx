"use client";
import { useEffect, useRef, useState } from "react";

/** Event the designs fire when a guest opens the invitation – a tap, so the browser allows sound. */
export const OPEN_EVENT = "ec:open";
export function announceOpen() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Floating play/pause button for the couple's background music. Starts when the invitation is opened. */
export default function MusicPlayer({ src, preview = false, tone = "light" }: { src?: string | null; preview?: boolean; tone?: "light" | "dark" }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!src) return;
    const start = () => { audio.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); };
    window.addEventListener(OPEN_EVENT, start);
    return () => window.removeEventListener(OPEN_EVENT, start);
  }, [src]);

  useEffect(() => () => audio.current?.pause(), []);

  if (!src) return null;

  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { a.pause(); setPlaying(false); }
  }

  const look = tone === "light"
    ? "border-[#b08a3e]/60 bg-white/80 text-[#6b1d2a]"
    : "border-white/30 bg-black/40 text-white";

  return (
    <>
      <audio ref={audio} src={src} loop preload="none" />
      <button type="button" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}
        className={`${preview ? "absolute" : "fixed"} right-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-full border shadow-lg backdrop-blur ${look}`}>
        {playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-[3px] rounded-sm bg-current" style={{ height: "100%", animation: `ec-eq .9s ease-in-out ${i * 0.15}s infinite alternate` }} />
            ))}
          </span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        )}
      </button>
    </>
  );
}
