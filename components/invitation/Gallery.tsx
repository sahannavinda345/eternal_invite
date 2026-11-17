"use client";
import { useEffect, useState } from "react";

/**
 * Photo grid with a full-screen viewer (swipe/arrow keys). The first photo is shown large.
 * In the editor preview the viewer is off, so taps don't cover the editor.
 */
export default function Gallery({ photos, frame, preview = false }: { photos: string[]; frame: string; preview?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  if (!photos.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((src, i) => (
          <button key={src} type="button" onClick={() => !preview && setOpen(i)}
            className={`overflow-hidden ${frame} ${i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"}`} aria-label={`View photo ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-label="Photo viewer"
          onClick={() => setOpen(null)}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) { e.stopPropagation(); setOpen((i) => (i === null ? i : (i + (dx < 0 ? 1 : -1) + photos.length) % photos.length)); }
            setTouchX(null);
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[open]} alt="" className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-6 left-0 right-0 text-center text-xs tracking-[0.2em] text-white/70">{open + 1} / {photos.length}</p>
          <button type="button" className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/10 text-xl text-white" aria-label="Close">×</button>
        </div>
      )}
    </>
  );
}
