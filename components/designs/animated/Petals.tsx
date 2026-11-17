"use client";

/** Gently falling petals. Positions are fixed per index so server and browser match. */
export default function Petals({ count = 14, color = "#c98a8a", contained = false }: { count?: number; color?: string; contained?: boolean }) {
  return (
    <div className={`pointer-events-none ${contained ? "absolute" : "fixed"} inset-0 z-[1] overflow-hidden`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 37) % 100;
        const dur = 9 + ((i * 7) % 8);
        const delay = -((i * 5) % dur);
        const size = 8 + ((i * 3) % 7);
        return (
          <span key={i} className="absolute top-0"
            style={{ left: `${left}%`, animation: `ec-fall ${dur}s linear ${delay}s infinite`, ["--drift" as string]: `${(i % 2 ? 1 : -1) * (30 + (i % 5) * 12)}px` }}>
            <svg width={size} height={size * 1.3} viewBox="0 0 10 13">
              <path d="M5 0C8 3 10 7 5 13C0 7 2 3 5 0Z" fill={color} opacity=".75" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
