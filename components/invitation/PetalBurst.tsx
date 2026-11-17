"use client";

/** A burst of petals flying out from the centre and drifting down – used as the transition after the intro. */
export default function PetalBurst({ colors = ["#fbe3e1", "#f6c9c6", "#fff4ec", "#f3d6a8"], count = 46 }: { colors?: string[]; count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.3;
        const dist = 160 + ((i * 37) % 260);
        const size = 16 + ((i * 7) % 22);
        return (
          <span key={i} className="absolute left-1/2 top-1/2"
            style={{
              ["--bx" as string]: `${Math.cos(angle) * dist}px`,
              ["--by" as string]: `${Math.sin(angle) * dist}px`,
              animation: `ec-burst ${1.8 + (i % 5) * 0.25}s cubic-bezier(.15,.7,.3,1) ${(i % 6) * 0.05}s both`,
            }}>
            <svg width={size} height={size * 1.25} viewBox="0 0 20 25" style={{ transform: `rotate(${i * 47}deg)` }}>
              <path d="M10 0C17 6 20 14 10 25C0 14 3 6 10 0Z" fill={colors[i % colors.length]} opacity=".95" />
              <path d="M10 3V22" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
