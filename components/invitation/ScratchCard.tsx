"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Gold foil the guest scratches away with a finger to reveal the wedding date.
 * Falls back to a "Reveal" button for anyone who can't scratch.
 */
export default function ScratchCard({ children, hint = "Scratch here to reveal our big day", button = "Reveal the wedding date", className = "" }: {
  children: React.ReactNode; hint?: string; button?: string; className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvas.current, w = wrap.current;
    if (!c || !w) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = w.clientWidth * dpr; c.height = w.clientHeight * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, w.clientWidth, w.clientHeight);
    g.addColorStop(0, "#c99a3c"); g.addColorStop(0.35, "#f1d38a"); g.addColorStop(0.55, "#d6aa4f"); g.addColorStop(1, "#b98a2e");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w.clientWidth, w.clientHeight);
    // fine foil grain
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w.clientWidth, Math.random() * w.clientHeight, 1, 1);
    }
    ctx.globalCompositeOperation = "destination-out";
  }, []);

  function scratch(e: React.PointerEvent) {
    if (!drawing.current || done) return;
    const c = canvas.current!, r = c.getBoundingClientRect(), ctx = c.getContext("2d")!;
    ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2); ctx.fill();
  }

  function measure() {
    const c = canvas.current!; const ctx = c.getContext("2d")!;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
    const p = Math.round((clear / (data.length / 64)) * 100);
    setPct(p);
    if (p > 45) setDone(true);
  }

  return (
    <div className={className}>
      <p className="mb-2 text-center font-script text-xl opacity-80">{hint}</p>
      <div ref={wrap} className="relative overflow-hidden rounded-lg">
        <div className="relative">{children}</div>
        <canvas ref={canvas} aria-hidden="true"
          className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${done ? "pointer-events-none opacity-0" : "cursor-pointer"}`}
          onPointerDown={(e) => { drawing.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); scratch(e); }}
          onPointerMove={scratch}
          onPointerUp={() => { drawing.current = false; measure(); }} />
      </div>
      {!done && (
        <div className="mt-3 flex flex-col items-center gap-1">
          {pct > 0 && <span className="text-[0.6rem] uppercase tracking-[0.25em] opacity-60">Keep scratching… {pct}%</span>}
          <button type="button" onClick={() => setDone(true)} className="rounded-full border border-black/20 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] opacity-80">{button}</button>
        </div>
      )}
    </div>
  );
}
