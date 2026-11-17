"use client";
/** Building blocks shared by the premium templates. */

export function SectionTitle({ kicker, title, color = "#6b1d2a", kickerColor = "#a8874a", script = false }: { kicker?: string; title: string; color?: string; kickerColor?: string; script?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      {kicker && <p className="text-[0.6rem] uppercase tracking-[0.36em]" style={{ color: kickerColor }}>{kicker}</p>}
      <h2 className={script ? "font-script text-4xl" : "font-serif text-[1.9rem] italic"} style={{ color }}>{title}</h2>
      <svg viewBox="0 0 80 10" width="80" height="10" aria-hidden="true"><path d="M0 5H32M48 5H80" stroke={kickerColor} strokeWidth=".7" /><circle cx="40" cy="5" r="2.2" fill={kickerColor} /></svg>
    </div>
  );
}

/** "DECEMBER | 12 | 2026" block with the weekday underneath. */
export function DateBlock({ iso, color = "#6b1d2a", line = "#c9ae78" }: { iso?: string; color?: string; line?: string }) {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return null;
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", ...o }).format(d);
  return (
    <div className="flex flex-col items-center gap-2" style={{ color }}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span className="border-y py-1.5 text-right text-[0.7rem] uppercase tracking-[0.3em]" style={{ borderColor: line }}>{f({ month: "long" })}</span>
        <span className="font-serif text-5xl leading-none">{f({ day: "numeric" })}</span>
        <span className="border-y py-1.5 text-left text-[0.7rem] uppercase tracking-[0.3em]" style={{ borderColor: line }}>{f({ year: "numeric" })}</span>
      </div>
      <p className="font-serif text-lg italic">{f({ weekday: "long" })}{f({ hour: "numeric", minute: "2-digit", hour12: true }) !== "12:00 am" ? ` · ${f({ hour: "numeric", minute: "2-digit", hour12: true })}` : ""}</p>
    </div>
  );
}

export function Polaroid({ src, caption, tilt = 0, className = "" }: { src?: string; caption: string; tilt?: number; className?: string }) {
  if (!src) return null;
  return (
    <figure className={`bg-white p-2 pb-1 shadow-[0_10px_25px_rgba(80,60,40,.18)] ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} className="aspect-[4/5] w-full object-cover" />
      <figcaption className="py-1.5 text-center font-script text-lg text-[#7a6a5a]">{caption}</figcaption>
    </figure>
  );
}

const EVENT_ICONS = [
  <path key="a" d="M12 3 4 8v2h16V8zM6 10v8M10 10v8M14 10v8M18 10v8M3 20h18" />,
  <><circle key="b1" cx="9" cy="14" r="5" /><circle key="b2" cx="15" cy="14" r="5" /><path key="b3" d="m9 6 3-3 3 3" /></>,
  <path key="c" d="M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v6M8 21h8" />,
];

export function EventIcon({ index, bg = "#7a1f2b" }: { index: number; bg?: string }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-full text-white shadow-md" style={{ background: bg }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{EVENT_ICONS[index % EVENT_ICONS.length]}</svg>
    </span>
  );
}

/** Soft paper texture (inline SVG noise) layered over a colour. */
export const paperNoise =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .3  0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
