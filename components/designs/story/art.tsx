/** Hand-drawn SVG artwork for the Story templates: roses, blossoms, pampas, wreaths, frames, seals. */
import { useId } from "react";

/* deterministic random so server and browser draw the same picture */
export function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/* ---------------- flowers ---------------- */

export function Rose({ x, y, r, c, d, rot = 0, shade }: { x: number; y: number; r: number; c: string; d: string; rot?: number; shade: string }) {
  const petal = (k: number, a: number, s: number) => (
    <path key={`${k}-${a}`} d={`M0 0C${-r * 0.55 * s} ${-r * 0.2 * s} ${-r * 0.5 * s} ${-r * 0.95 * s} 0 ${-r * 0.92 * s}C${r * 0.5 * s} ${-r * 0.95 * s} ${r * 0.55 * s} ${-r * 0.2 * s} 0 0Z`}
      fill={c} stroke={d} strokeWidth={r * 0.05} strokeOpacity=".55" transform={`rotate(${a})`} />
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={r * 0.95} fill={d} />
      {[0, 60, 120, 180, 240, 300].map((a) => petal(1, a, 1))}
      {[30, 102, 174, 246, 318].map((a) => petal(2, a, 0.74))}
      {[10, 130, 250].map((a) => petal(3, a, 0.5))}
      <path d={`M${-r * 0.16} ${r * 0.06}C${-r * 0.2} ${-r * 0.2} ${r * 0.2} ${-r * 0.22} ${r * 0.18} ${r * 0.02}C${r * 0.14} ${r * 0.16} ${-r * 0.04} ${r * 0.14} ${-r * 0.02} ${-r * 0.02}`}
        stroke={d} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
      <circle r={r} fill={`url(#${shade})`} />
    </g>
  );
}

export function Blossom({ x, y, r, c = "#fffaf0", center = "#d9b25f", rot = 0 }: { x: number; y: number; r: number; c?: string; center?: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cy={-r * 0.55} rx={r * 0.42} ry={r * 0.6} fill={c} transform={`rotate(${a})`} />)}
      <circle r={r * 0.28} fill={center} />
    </g>
  );
}

export function Leaf({ x, y, l, w, rot, c }: { x: number; y: number; l: number; w: number; rot: number; c: string }) {
  return <path d={`M0 0Q${l / 2} ${-w} ${l} 0Q${l / 2} ${w} 0 0Z`} fill={c} transform={`translate(${x} ${y}) rotate(${rot})`} />;
}

type Palette = { roses: [string, string][]; blossom: string; leaf: string[] };
export const CRIMSON: Palette = { roses: [["#9e1b2c", "#5a0a16"], ["#b3263a", "#6d0f1d"], ["#f4ece0", "#cdbb9d"]], blossom: "#fffaf0", leaf: ["#3e4a2c", "#56603a", "#2e3a22"] };
export const BLUSH: Palette = { roses: [["#7d1f2e", "#4a0c16"], ["#e9d8c8", "#bfa58b"], ["#c97f86", "#8a4250"]], blossom: "#fdf6ec", leaf: ["#6e7354", "#8a8a62", "#4f5a3c"] };

/** A natural-looking bunch of roses, small blossoms and leaves inside an ellipse. */
export function FloralCluster({ w, h, seed = 1, palette = CRIMSON, density = 1, scale = 1, className, style }: { w: number; h: number; seed?: number; palette?: Palette; density?: number; scale?: number; className?: string; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, "");
  const r = rng(seed);
  const pt = (k = 1) => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * k; return [w / 2 + Math.cos(a) * d * w * 0.46, h / 2 + Math.sin(a) * d * h * 0.44]; };
  const size = Math.min(w, h) * scale;
  const leaves = Array.from({ length: Math.round(14 * density) }, () => { const [x, y] = pt(1.05); return { x, y, l: size * (0.16 + r() * 0.14), w: size * (0.05 + r() * 0.04), rot: r() * 360, c: palette.leaf[Math.floor(r() * palette.leaf.length)] }; });
  const roses = Array.from({ length: Math.round(7 * density) }, () => { const [x, y] = pt(0.8); const p = palette.roses[Math.floor(r() * palette.roses.length)]; return { x, y, rr: size * (0.08 + r() * 0.07), c: p[0], d: p[1], rot: r() * 360 }; });
  const blossoms = Array.from({ length: Math.round(12 * density) }, () => { const [x, y] = pt(1); return { x, y, rr: size * (0.025 + r() * 0.03), rot: r() * 360 }; });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`s${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".35" />
        </radialGradient>
      </defs>
      {leaves.map((l, i) => <Leaf key={`l${i}`} {...l} />)}
      {roses.sort((a, b) => a.y - b.y).map((o, i) => <Rose key={`r${i}`} x={o.x} y={o.y} r={o.rr} c={o.c} d={o.d} rot={o.rot} shade={`s${id}`} />)}
      {blossoms.map((b, i) => <Blossom key={`b${i}`} x={b.x} y={b.y} r={b.rr} c={palette.blossom} rot={b.rot} />)}
    </svg>
  );
}

/** Strings of tiny white flowers hanging from the top (sway gently). */
export function HangingStrands({ w, h, count = 14, seed = 3, className }: { w: number; h: number; count?: number; seed?: number; className?: string }) {
  const r = rng(seed);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const x = (i + 0.5) * (w / count) + (r() - 0.5) * 10;
        const len = h * (0.35 + r() * 0.6);
        const n = Math.floor(len / 9);
        return (
          <g key={i} style={{ transformOrigin: `${x}px 0px`, animation: `ec-sway ${5 + r() * 3}s ease-in-out ${-r() * 4}s infinite` }}>
            <line x1={x} y1="0" x2={x} y2={len} stroke="#d8c7a4" strokeWidth=".5" opacity=".6" />
            {Array.from({ length: n }, (_, k) => <Blossom key={k} x={x + (k % 2 ? 1.4 : -1.4)} y={k * 9 + 4} r={2.6 + r() * 1.4} c="#fffdf6" center="#e8d29a" rot={r() * 90} />)}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- Mughal arch ---------------- */

/** Onion (ogee) arch top, as a path in a 300×150 box. */
export const ARCH_PATH = "M0 150V96C0 62 34 50 64 42C102 32 132 22 150 0C168 22 198 32 236 42C266 50 300 62 300 96V150Z";

export function ArchTop({ fill, line, className }: { fill: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 -14 300 164" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={ARCH_PATH} fill={fill} />
      <path d={ARCH_PATH.replace(/Z$/, "")} fill="none" stroke={line} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <path d={ARCH_PATH.replace(/Z$/, "")} transform="translate(10 12) scale(.933)" fill="none" stroke={line} strokeWidth=".8" opacity=".6" vectorEffect="non-scaling-stroke" />
      <path d="M150 0V-12M146 -6L150 -13L154 -6" stroke={line} strokeWidth="1.2" fill="none" />
      <circle cx="150" cy="-3" r="2.4" fill={line} />
    </svg>
  );
}

/* ---------------- pampas ---------------- */

/** Embossed pampas grass: stems with feathery plumes that grow in one by one. */
export function Pampas({ seed = 5, stems = 5, className, style, paper = "#efe6da" }: { seed?: number; stems?: number; className?: string; style?: React.CSSProperties; paper?: string }) {
  const r = rng(seed);
  const plumes = Array.from({ length: stems }, (_, s) => {
    const baseX = 40 + s * 18 + r() * 10, tipX = 30 + s * 34 + (r() - 0.5) * 40, tipY = 40 + r() * 120;
    const ctrlX = baseX + (tipX - baseX) * 0.3, ctrlY = 300 - (300 - tipY) * 0.6;
    const at = (t: number) => [(1 - t) ** 2 * baseX + 2 * (1 - t) * t * ctrlX + t * t * tipX, (1 - t) ** 2 * 400 + 2 * (1 - t) * t * ctrlY + t * t * tipY];
    const strands: string[] = [];
    for (let k = 0; k < 46; k++) {
      const t = 0.45 + (k / 46) * 0.55;
      const [x, y] = at(t), [x2, y2] = at(Math.min(1, t + 0.02));
      const ang = Math.atan2(y2 - y, x2 - x), side = k % 2 ? 1 : -1;
      const len = 26 * Math.sin(((t - 0.45) / 0.55) * Math.PI) + 8 + r() * 8;
      const a2 = ang + side * (0.5 + r() * 0.35);
      const ex = x + Math.cos(a2) * len, ey = y + Math.sin(a2) * len;
      strands.push(`M${x.toFixed(1)} ${y.toFixed(1)}Q${((x + ex) / 2 + side * 3).toFixed(1)} ${((y + ey) / 2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
    }
    const [mx, my] = at(0.45);
    return { stem: `M${baseX} 400Q${ctrlX} ${ctrlY} ${tipX} ${tipY}`, strands: strands.join(""), mx, my };
  });
  const layer = (dx: number, dy: number, color: string, op: number) => (
    <g transform={`translate(${dx} ${dy})`} opacity={op}>
      {plumes.map((p, i) => (
        <g key={i} className="st-anim" style={{ animation: `st-grow 1.6s cubic-bezier(.2,.7,.2,1) ${0.25 + i * 0.22}s both`, transformOrigin: `${p.mx}px 400px` }}>
          <path d={p.stem} stroke={color} strokeWidth="1.6" fill="none" />
          <path d={p.strands} stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 220 400" className={className} style={style} aria-hidden="true">
      {layer(1.1, 1.3, "#6b5442", 0.28)}
      {layer(-0.9, -0.9, "#ffffff", 0.6)}
      {layer(0, 0, paper, 1)}
    </svg>
  );
}

/* ---------------- gold wreath ---------------- */

export function Wreath({ className }: { className?: string }) {
  const items = Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 2, x = 150 + Math.cos(a) * 112, y = 190 + Math.sin(a) * 160;
    return { x, y, deg: (a * 180) / Math.PI + 90, i };
  });
  return (
    <svg viewBox="0 0 300 380" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="wr-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6dc95" /><stop offset=".5" stopColor="#c9963c" /><stop offset="1" stopColor="#8d6220" /></linearGradient>
      </defs>
      <ellipse cx="150" cy="190" rx="112" ry="160" fill="none" stroke="url(#wr-gold)" strokeWidth="1.6" className="st-anim" pathLength={1}
        style={{ strokeDasharray: 1, animation: "st-draw 2.4s ease-out .2s both" }} />
      {items.map((o) => (
        <g key={o.i} className="st-anim" style={{ animation: `st-pop .6s ease-out ${0.4 + o.i * 0.05}s both`, transformOrigin: `${o.x}px ${o.y}px` }}>
          <Leaf x={o.x} y={o.y} l={20} w={6} rot={o.deg - 40} c="url(#wr-gold)" />
          <Leaf x={o.x} y={o.y} l={16} w={5} rot={o.deg + 210} c="url(#wr-gold)" />
          {o.i % 2 === 0 && <Blossom x={o.x} y={o.y} r={o.i % 4 === 0 ? 9 : 6.5} c="#f5e6cf" center="#c9963c" rot={o.i * 17} />}
          {o.i % 4 === 1 && <circle cx={o.x + 6} cy={o.y - 4} r="2.2" fill="url(#wr-gold)" />}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- baroque frame (draws itself) ---------------- */

export function OrnateFrame({ color = "#e8c7c7", className }: { color?: string; className?: string }) {
  const draw = (d: number) => ({ strokeDasharray: 1, animation: `st-draw 2.2s ease-out ${d}s both` });
  const curls = "M150 22c-10-18-34-12-30 4 3 12 18 8 16-1M150 22c10-18 34-12 30 4-3 12-18 8-16-1M150 358c-10 18-34 12-30-4 3-12 18-8 16 1M150 358c10 18 34 12 30-4-3-12-18-8-16 1M34 190c-18-10-12-34 4-30 12 3 8 18-1 16M34 190c-18 10-12 34 4 30 12-3 8-18-1-16M266 190c18-10 12-34-4-30-12 3-8 18 1 16M266 190c18 10 12 34-4 30-12-3-8-18 1-16";
  return (
    <svg viewBox="0 0 300 380" className={className} fill="none" stroke={color} aria-hidden="true">
      <ellipse className="st-anim" cx="150" cy="190" rx="112" ry="160" strokeWidth="1.6" pathLength={1} style={draw(0.1)} />
      <ellipse className="st-anim" cx="150" cy="190" rx="102" ry="150" strokeWidth=".7" pathLength={1} style={draw(0.35)} />
      <path className="st-anim" d={curls} strokeWidth="1.3" pathLength={1} style={draw(0.6)} />
      <path className="st-anim" d="M150 8l6 10-6 6-6-6zM60 70c20 0 30-14 32-28M240 70c-20 0-30-14-32-28M60 310c20 0 30 14 32 28M240 310c-20 0-30 14-32 28" strokeWidth="1.1" pathLength={1} style={draw(0.9)} />
    </svg>
  );
}

/* ---------------- gold wax seal ---------------- */

export function GoldSeal({ initials, className }: { initials: string; className?: string }) {
  const r = rng(9);
  const edge = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2, rad = 46 + r() * 4; return `${(50 + Math.cos(a) * rad).toFixed(1)},${(50 + Math.sin(a) * rad).toFixed(1)}`; }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="seal-g" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#fbe7a8" /><stop offset=".45" stopColor="#d4a548" /><stop offset="1" stopColor="#7d5416" /></radialGradient>
      </defs>
      <polygon points={edge} fill="url(#seal-g)" stroke="#8a5d1c" strokeWidth=".6" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#8a5d1c" strokeWidth="1.2" opacity=".7" />
      <circle cx="49.4" cy="49.4" r="33" fill="none" stroke="#fff3c9" strokeWidth=".6" opacity=".6" />
      {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="50" cy="38" rx="5" ry="9" fill="none" stroke="#8a5d1c" strokeWidth=".9" transform={`rotate(${a} 50 50)`} opacity=".55" />)}
      <text x="50" y="57" textAnchor="middle" fontFamily="var(--font-script), cursive" fontSize="20" fill="#6e4710" opacity=".85">{initials}</text>
    </svg>
  );
}

/* ---------------- textures ---------------- */

const svgUrl = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

/** Embossed floral pattern for maroon paper. */
export const embossMaroon = (base = "#5c1421") => {
  const motif = "M8 112C26 84 44 92 54 62S88 30 112 8M54 62c-14-6-22 2-24 12M80 36c10 10 22 8 28 0M30 96c-8-10-20-8-24 0";
  const flower = "M86 86m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M86 74v-6M86 98v6M74 86h-6M98 86h6M22 30m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0";
  const tile = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g fill='none' stroke-width='1.6' stroke-linecap='round'><path d='${motif} ${flower}' stroke='rgba(0,0,0,.28)' transform='translate(1 1.2)'/><path d='${motif} ${flower}' stroke='rgba(255,220,220,.10)' transform='translate(-.8 -.8)'/></g></svg>`;
  return `${svgUrl(tile)}, radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,.06), transparent 60%), ${base}`;
};

export const paperGrain = svgUrl("<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .3  0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>");

/** SVG filter that roughens edges into a torn, deckled paper edge. Render once per page. */
export function DeckleFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="st-deckle" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="4" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/* ---------------- small icons ---------------- */

export function Icon({ name, className = "h-7 w-7" }: { name: "calendar" | "pin" | "clock" | "heart"; className?: string }) {
  const p = {
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" /></>,
    pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  }[name];
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p}</svg>;
}
