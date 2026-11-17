/** Hand-drawn SVG ornaments used by the animated designs (original artwork). */

export function Mandala({ size = 220, color = "#b08a3e", className = "" }: { size?: number; color?: string; className?: string }) {
  const rings = [
    { n: 8, r: 14, w: 5, h: 12 },
    { n: 12, r: 30, w: 7, h: 16 },
    { n: 16, r: 52, w: 8, h: 18 },
    { n: 24, r: 76, w: 7, h: 16 },
    { n: 32, r: 96, w: 5, h: 10 },
  ];
  return (
    <svg viewBox="-110 -110 220 220" width={size} height={size} className={className} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="0.8">
        {[22, 42, 64, 88, 104].map((r) => <circle key={r} r={r} opacity=".55" />)}
        {rings.map((ring, ri) =>
          Array.from({ length: ring.n }, (_, i) => (
            <path key={`${ri}-${i}`} transform={`rotate(${(360 / ring.n) * i + (ri % 2 ? 180 / ring.n : 0)}) translate(0 ${-ring.r})`}
              d={`M0 ${ring.h / 2} C ${ring.w} ${ring.h / 4} ${ring.w} ${-ring.h / 4} 0 ${-ring.h / 2} C ${-ring.w} ${-ring.h / 4} ${-ring.w} ${ring.h / 4} 0 ${ring.h / 2} Z`} />
          ))
        )}
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={`d${i}`} r="1.1" fill={color} stroke="none" transform={`rotate(${7.5 * i}) translate(0 -108)`} />
        ))}
      </g>
      <circle r="5" fill={color} />
    </svg>
  );
}

export function Lotus({ color = "#b08a3e", size = 44 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 60 30" width={size} height={size / 2} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1">
        <path d="M30 28C24 20 24 10 30 2C36 10 36 20 30 28Z" />
        <path d="M30 28C20 24 14 16 14 8C22 10 28 18 30 28Z" />
        <path d="M30 28C40 24 46 16 46 8C38 10 32 18 30 28Z" />
        <path d="M30 28C18 28 8 24 2 18C12 16 24 20 30 28Z" />
        <path d="M30 28C42 28 52 24 58 18C48 16 36 20 30 28Z" />
      </g>
    </svg>
  );
}

/** A caparisoned elephant facing left, as in a perahera procession. */
export function Elephant({ size = 64, body = "#6d5848", cloth = "#7a1f2b", trim = "#c9a14f" }: { size?: number; body?: string; cloth?: string; trim?: string }) {
  return (
    <svg viewBox="0 0 80 60" width={size} height={size * 0.75} aria-hidden="true" style={{ transform: "scaleX(-1)" }}>
      <path d="M17 27Q11 33 13 41" stroke={body} strokeWidth="1.6" fill="none" />
      <rect x="24" y="36" width="6" height="18" rx="2" fill={body} />
      <rect x="47" y="36" width="6" height="18" rx="2" fill={body} />
      <ellipse cx="40" cy="31" rx="23" ry="15" fill={body} />
      <rect x="31" y="38" width="6" height="16" rx="2" fill={body} />
      <rect x="54" y="38" width="6" height="16" rx="2" fill={body} />
      <circle cx="62" cy="24" r="11" fill={body} />
      <path d="M70 25Q79 36 75 49Q73 53 70 49Q72 38 66 30Z" fill={body} />
      <path d="M67 33Q73 38 77 35" stroke="#f6efe1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="57" cy="27" rx="7" ry="9" fill={body} stroke={trim} strokeWidth=".6" opacity=".95" />
      <path d="M26 17Q40 9 54 17L52 34Q40 39 28 34Z" fill={cloth} stroke={trim} strokeWidth="1" />
      <path d="M28 34Q40 39 52 34" stroke={trim} strokeWidth="1.4" strokeDasharray="1.5 2" fill="none" />
      <path d="M55 15Q62 9 69 15L66 18Q62 14 58 18Z" fill={cloth} stroke={trim} strokeWidth=".8" />
      <circle cx="66" cy="22" r="1.2" fill="#2b2018" />
      <path d="M38 9L40 3L42 9" fill={trim} />
    </svg>
  );
}

export function Sparkle({ color = "#c9a14f", size = 10 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} aria-hidden="true">
      <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" fill={color} />
    </svg>
  );
}

/** Embossed flower spray for the ivory envelope (light lines on light paper). */
export function EmbossedSpray({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 160 220" className={className} aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <g fill="none" stroke="#ffffff" strokeWidth="1.4" opacity=".9">
        <path d="M150 210C110 170 90 120 96 60C100 30 112 14 126 4" />
        {[[100, 150, -40], [96, 110, -50], [104, 80, -30], [112, 40, -20], [120, 180, -60]].map(([x, y, r], i) => (
          <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0C-14 -6 -30 -4 -40 6C-28 12 -12 10 0 0Z" />
        ))}
        {[[118, 120, 30], [116, 70, 40], [130, 150, 20]].map(([x, y, r], i) => (
          <path key={`r${i}`} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0C14 -6 30 -4 40 6C28 12 12 10 0 0Z" />
        ))}
        <g transform="translate(60 40)">
          {Array.from({ length: 8 }, (_, i) => <ellipse key={i} rx="9" ry="18" transform={`rotate(${i * 45}) translate(0 -14)`} />)}
          <circle r="6" />
        </g>
      </g>
      <g fill="none" stroke="#d9cfbd" strokeWidth=".8" opacity=".9" transform="translate(1.2 1.2)">
        <path d="M150 210C110 170 90 120 96 60C100 30 112 14 126 4" />
        <g transform="translate(60 40)">
          {Array.from({ length: 8 }, (_, i) => <ellipse key={i} rx="9" ry="18" transform={`rotate(${i * 45}) translate(0 -14)`} />)}
        </g>
      </g>
    </svg>
  );
}

/** Marigold garland: a swag of orange and yellow flowers. */
export function Garland({ width = 400, drop = 50 }: { width?: number; drop?: number }) {
  const n = 22;
  return (
    <svg viewBox={`0 0 ${width} ${drop + 20}`} width="100%" height={drop + 20} preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const x = t * width;
        const y = 8 + 4 * drop * t * (1 - t);
        return <circle key={i} cx={x} cy={y} r={7.5} fill={i % 3 === 1 ? "#f6c33b" : "#ef8a1f"} stroke="#c25e0e" strokeWidth=".8" />;
      })}
    </svg>
  );
}

/** Palm crown seen from above. */
export function PalmTop({ size = 140, color = "#2f5a2b" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="-70 -70 140 140" width={size} height={size} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} transform={`rotate(${i * 40})`} d="M0 0C10 -18 12 -44 2 -66C-2 -44 -10 -24 0 0Z" fill={color} opacity=".92" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={`v${i}`} transform={`rotate(${i * 40})`} d="M0 0L2 -64" stroke="#1d3b1b" strokeWidth="1" />
      ))}
      <circle r="7" fill="#5b4a2a" />
    </svg>
  );
}

/** Vintage wedding car seen from above, with a ribbon. */
export function WeddingCar({ width = 70 }: { width?: number }) {
  return (
    <svg viewBox="0 0 70 130" width={width} height={width * 1.86} aria-hidden="true">
      <rect x="4" y="18" width="10" height="20" rx="3" fill="#1b1b1b" />
      <rect x="56" y="18" width="10" height="20" rx="3" fill="#1b1b1b" />
      <rect x="4" y="92" width="10" height="20" rx="3" fill="#1b1b1b" />
      <rect x="56" y="92" width="10" height="20" rx="3" fill="#1b1b1b" />
      <rect x="9" y="4" width="52" height="122" rx="22" fill="#9fd0cf" stroke="#5e9493" strokeWidth="1.5" />
      <path d="M16 34Q35 26 54 34L52 50Q35 46 18 50Z" fill="#33484f" opacity=".85" />
      <rect x="17" y="54" width="36" height="34" rx="8" fill="#e9f4f3" stroke="#5e9493" />
      <path d="M18 96Q35 102 52 96L53 108Q35 112 17 108Z" fill="#33484f" opacity=".8" />
      <circle cx="18" cy="9" r="3" fill="#fff6c8" /><circle cx="52" cy="9" r="3" fill="#fff6c8" />
      <path d="M35 4V126" stroke="#c4202f" strokeWidth="5" />
      <path d="M35 66C27 58 21 62 25 70C28 75 35 70 35 66C35 70 42 75 45 70C49 62 43 58 35 66Z" fill="#d42a3a" stroke="#8e1420" />
    </svg>
  );
}

export function Plane({ size = 40, color = "#d9b36c" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z" fill={color} transform="rotate(90 12 12)" />
    </svg>
  );
}
