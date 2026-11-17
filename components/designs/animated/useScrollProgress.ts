"use client";
import { useEffect, useState, type RefObject } from "react";

/** 0 → 1 as the reader scrolls through the page (or through the editor's phone frame). */
export default function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Find the nearest scrolling parent; fall back to the window
    let parent: HTMLElement | null = el.parentElement;
    while (parent && !/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) parent = parent.parentElement;
    const target: HTMLElement | Window = parent ?? window;
    let frame = 0;
    const read = () => {
      frame = 0;
      const top = parent ? parent.scrollTop : window.scrollY;
      const max = parent ? parent.scrollHeight - parent.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, top / max)) : 0);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { target.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(frame); };
  }, [ref]);
  return progress;
}
