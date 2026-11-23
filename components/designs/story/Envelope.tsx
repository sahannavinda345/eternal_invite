"use client";
/**
 * Burgundy envelope with fine, delicate blind-embossed flowers: thin raised outlines, hair-fine
 * lines inside the petals and leaves, buds and berries on slender stems, on matte grained paper.
 * Tap: the side flaps swing open towards you and catch the light, then the top and bottom
 * flaps fold away, revealing the ivory card underneath.
 */
import { useId } from "react";
import { rng } from "./art";

const W = 360, H = 640;
type El = React.ReactNode;
type Art = El[];

const P = (a: Art, d: string, w: number, t?: string) => a.push(<path key={a.length} d={d} strokeWidth={w} transform={t} />);
const f1 = (n: number) => n.toFixed(1);

/* ---------- botanical line art (everything here is raised) ---------- */

/** Open flower: wavy petals, each filled with fine lines fanning from the centre, and a stamen ring. */
function flower(a: Art, cx: number, cy: number, r: number, rot: number, n = 6, seed = 1) {
  const rand = rng(seed);
  const half = (180 / n) * 0.98;
  for (let i = 0; i < n; i++) {
    const t = `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rot + (360 / n) * i + (rand() - 0.5) * 6)})`;
    const rr = r * (0.9 + rand() * 0.12);
    const sx = Math.sin((half * Math.PI) / 180) * rr;
    // petal outline with a soft wave at the tip
    P(a, `M0 ${f1(-r * 0.18)}C${f1(-sx * 1.05)} ${f1(-rr * 0.32)} ${f1(-sx * 1.15)} ${f1(-rr * 0.86)} ${f1(-sx * 0.45)} ${f1(-rr * 0.97)}Q${f1(-sx * 0.2)} ${f1(-rr * 0.9)} 0 ${f1(-rr * 1.01)}Q${f1(sx * 0.2)} ${f1(-rr * 0.9)} ${f1(sx * 0.45)} ${f1(-rr * 0.97)}C${f1(sx * 1.15)} ${f1(-rr * 0.86)} ${f1(sx * 1.05)} ${f1(-rr * 0.32)} 0 ${f1(-r * 0.18)}`, 0.85, t);
    // hatching
    const k = 6;
    for (let j = -k; j <= k; j++) {
      const ang = (j / k) * half * 0.78 * (Math.PI / 180);
      const len = 0.86 - Math.abs(j / k) * 0.22;
      P(a, `M${f1(Math.sin(ang * 0.35) * r * 0.26)} ${f1(-Math.cos(ang * 0.35) * r * 0.26)}Q${f1(Math.sin(ang * 0.8) * r * 0.55)} ${f1(-Math.cos(ang * 0.8) * r * 0.58)} ${f1(Math.sin(ang) * r * len)} ${f1(-Math.cos(ang) * r * len)}`, 0.38, t);
    }
  }
  a.push(<circle key={a.length} cx={cx} cy={cy} r={r * 0.15} strokeWidth={0.9} />);
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    a.push(<circle key={a.length} cx={cx + Math.cos(ang) * r * 0.22} cy={cy + Math.sin(ang) * r * 0.22} r={0.9} fill="#000" />);
  }
  a.push(<circle key={a.length} cx={cx} cy={cy} r={r * 0.06} fill="#000" />);
}

/** Half-open bloom seen from the side (cup shape with petals and sepals). */
function bloom(a: Art, x: number, y: number, s: number, rot: number) {
  const t = `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`;
  P(a, `M0 0C${-s * 0.9} ${-s * 0.2} ${-s * 1.1} ${-s * 1.2} ${-s * 0.5} ${-s * 1.5}C${-s * 0.2} ${-s * 1.1} ${s * 0.2} ${-s * 1.1} ${s * 0.5} ${-s * 1.5}C${s * 1.1} ${-s * 1.2} ${s * 0.9} ${-s * 0.2} 0 0`, 0.85, t);
  P(a, `M0 ${-s * 0.2}C${-s * 0.3} ${-s * 0.8} ${-s * 0.2} ${-s * 1.3} 0 ${-s * 1.55}C${s * 0.2} ${-s * 1.3} ${s * 0.3} ${-s * 0.8} 0 ${-s * 0.2}`, 0.7, t);
  for (let j = -3; j <= 3; j++) P(a, `M${j * s * 0.05} ${-s * 0.25}Q${j * s * 0.16} ${-s * 0.8} ${j * s * 0.25} ${-s * (1.25 - Math.abs(j) * 0.05)}`, 0.35, t);
  P(a, `M${-s * 0.6} ${-s * 0.1}Q${-s * 0.3} ${-s * 0.4} 0 ${-s * 0.05}Q${s * 0.3} ${-s * 0.4} ${s * 0.6} ${-s * 0.1}`, 0.7, t);
}

function leaf(a: Art, x: number, y: number, len: number, w: number, rot: number) {
  const t = `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`;
  P(a, `M0 0C${f1(len * 0.22)} ${f1(-w)} ${f1(len * 0.72)} ${f1(-w * 0.85)} ${f1(len)} 0C${f1(len * 0.72)} ${f1(w * 0.85)} ${f1(len * 0.22)} ${f1(w)} 0 0`, 0.8, t);
  P(a, `M0 0Q${f1(len * 0.5)} ${f1(-w * 0.1)} ${f1(len * 0.95)} 0`, 0.6, t);
  for (let i = 1; i <= 6; i++) {
    const px = len * (0.1 + i * 0.12), vy = w * 0.78 * Math.sin((i / 7) * Math.PI);
    P(a, `M${f1(px)} 0Q${f1(px + len * 0.05)} ${f1(-vy * 0.6)} ${f1(px + len * 0.11)} ${f1(-vy)}M${f1(px)} 0Q${f1(px + len * 0.05)} ${f1(vy * 0.6)} ${f1(px + len * 0.11)} ${f1(vy)}`, 0.32, t);
  }
}

function bud(a: Art, x: number, y: number, s: number, rot: number) {
  const t = `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`;
  P(a, `M0 0C${-s * 0.55} ${-s * 0.25} ${-s * 0.45} ${-s * 1.1} 0 ${-s * 1.35}C${s * 0.45} ${-s * 1.1} ${s * 0.55} ${-s * 0.25} 0 0`, 0.75, t);
  P(a, `M${-s * 0.42} ${-s * 0.12}Q${-s * 0.1} ${-s * 0.55} ${-s * 0.05} ${-s * 0.95}M${s * 0.42} ${-s * 0.12}Q${s * 0.1} ${-s * 0.55} ${s * 0.05} ${-s * 0.95}`, 0.45, t);
}

/** A slender sprig ending in tiny berries or buds. */
function sprig(a: Art, x: number, y: number, len: number, rot: number, seed: number) {
  const r = rng(seed);
  const t = `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`;
  P(a, `M0 0Q${f1(len * 0.5)} ${f1(-len * 0.12)} ${f1(len)} 0`, 0.6, t);
  for (let i = 0; i < 5; i++) {
    const px = len * (0.35 + i * 0.15), side = i % 2 ? 1 : -1, l = 6 + r() * 5;
    P(a, `M${f1(px)} ${f1(-len * 0.05)}l${f1(l * 0.6)} ${f1(side * l)}`, 0.45, t);
    a.push(<circle key={a.length} cx={px + l * 0.6} cy={-len * 0.05 + side * l} r={1.7} strokeWidth={0.6} transform={t} />);
  }
}

/** A curving vine with leaves, buds and sprigs along it, ending in a flower, bloom or bud. */
function vine(a: Art, seed: number, p: [number, number][], end: { flower?: number; bloom?: number; bud?: number; rot?: number }, leaves = 8) {
  const r = rng(seed);
  const [p0, p1, p2] = p;
  const at = (t: number) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
  P(a, `M${p0[0]} ${p0[1]}Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`, 1.3);
  for (let i = 1; i <= leaves; i++) {
    const t = i / (leaves + 1.2), [x, y] = at(t), [x2, y2] = at(t + 0.01);
    const dir = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI, side = i % 2 ? 1 : -1, pick = r();
    if (pick < 0.16) bud(a, x, y, 6 + r() * 4, dir + 90 + side * 35);
    else if (pick < 0.27) sprig(a, x, y, 26 + r() * 14, dir + side * 40, seed * 10 + i);
    else leaf(a, x, y, 18 + r() * 14, 6 + r() * 3, dir + side * (32 + r() * 24));
  }
  const [ex, ey] = p2;
  if (end.flower) flower(a, ex, ey, end.flower, end.rot ?? r() * 60, 5, seed);
  if (end.bloom) bloom(a, ex, ey, end.bloom, end.rot ?? 0);
  if (end.bud) bud(a, ex, ey, end.bud, end.rot ?? 0);
}

/* ---------- artwork for each flap (360 × 640 space, like the reference) ---------- */

const leftArt = (a: Art) => {
  vine(a, 1, [[-10, 640], [-8, 380], [44, 200]], { flower: 46, rot: 6 }, 16);
  vine(a, 2, [[24, 300], [70, 250], [114, 222]], { bloom: 10, rot: 70 }, 6);
  vine(a, 3, [[30, 430], [100, 380], [154, 318]], { bloom: 9, rot: 50 }, 9);
  vine(a, 4, [[-14, 600], [14, 560], [50, 500]], { flower: 48, rot: 20 }, 7);
  vine(a, 5, [[6, 150], [20, 100], [30, 52]], { bud: 8, rot: -10 }, 6);
  vine(a, 6, [[60, 560], [96, 470], [104, 420]], { bud: 8, rot: 20 }, 6);
  vine(a, 19, [[44, 200], [90, 160], [120, 140]], { bud: 7, rot: 70 }, 4);
  vine(a, 20, [[10, 640], [50, 610], [70, 590]], { bloom: 9, rot: 40 }, 3);
};
const rightArt = (a: Art) => {
  vine(a, 7, [[370, 540], [352, 320], [318, 198]], { flower: 40, rot: 12 }, 16);
  vine(a, 8, [[336, 300], [276, 290], [226, 268]], { bloom: 10, rot: -70 }, 7);
  vine(a, 9, [[372, 660], [334, 560], [314, 466]], { flower: 36, rot: 4 }, 10);
  vine(a, 10, [[318, 420], [266, 400], [236, 360]], { bloom: 9, rot: -40 }, 6);
  vine(a, 11, [[360, 640], [300, 600], [264, 560]], { bloom: 9, rot: -50 }, 7);
  vine(a, 12, [[352, 130], [334, 92], [320, 56]], { bud: 8, rot: 10 }, 6);
  vine(a, 21, [[318, 198], [280, 160], [262, 150]], { bud: 7, rot: -70 }, 4);
  vine(a, 22, [[300, 640], [290, 600], [292, 570]], { flower: 22, rot: 30 }, 4);
};
const topArt = (a: Art) => {
  vine(a, 13, [[340, 260], [286, 186], [252, 136]], { flower: 34, rot: 10 }, 9);
  vine(a, 14, [[252, 136], [214, 96], [180, 62]], { bloom: 10, rot: -40 }, 7);
  vine(a, 15, [[252, 136], [272, 72], [264, 18]], { bud: 8, rot: 0 }, 6);
  vine(a, 16, [[30, 54], [78, 78], [120, 112]], { bloom: 9, rot: 120 }, 7);
  vine(a, 23, [[120, 112], [140, 140], [150, 170]], { bud: 7, rot: 150 }, 3);
};
const bottomArt = (a: Art) => {
  vine(a, 17, [[30, 660], [76, 600], [118, 556]], { flower: 28, rot: 10 }, 9);
  vine(a, 18, [[186, 660], [208, 620], [240, 588]], { bloom: 8, rot: 40 }, 6);
};

/* ---------- one flap: raised line art on matte grained paper ---------- */

function Flap({ draw, base, clip }: { draw: (a: Art) => void; base: string; clip: string }) {
  const id = useId().replace(/:/g, "");
  const art: Art = [];
  draw(art);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" style={{ clipPath: clip }} aria-hidden="true">
      <defs>
        <filter id={`e${id}`} filterUnits="userSpaceOnUse" x="0" y="0" width={W} height={H} colorInterpolationFilters="sRGB">
          {/* height: the line art, softened, plus fine paper grain */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="h0" />
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" result="na" />
          <feComposite in="h0" in2="na" operator="arithmetic" k2=".9" k3="1" result="h" />
          <feDiffuseLighting in="h" surfaceScale="2.2" diffuseConstant="1" lightingColor="#fff" result="L">
            <feDistantLight azimuth="230" elevation="30" />
          </feDiffuseLighting>
          <feFlood floodColor={base} result="base" />
          {/* base + (light − flat): raised edges catch light on the top left, shade on the bottom right */}
          <feComposite in="L" in2="base" operator="arithmetic" k2=".5" k3="1" k4="-.25" result="lit" />
          {/* soft mottling of real paper */}
          <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="2" result="m" />
          <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 -.03" result="ma" />
          <feComposite in="ma" in2="lit" operator="over" />
        </filter>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".06" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <g filter={`url(#e${id})`}>
        <rect width={W} height={H} fill="none" />
        <g fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round">{art}</g>
      </g>
      <rect width={W} height={H} fill={`url(#g${id})`} />
    </svg>
  );
}

/* ---------- the envelope ---------- */

/* ---------- envelope from a photo: the picture is cut along its own folds ---------- */

const IW = 736, IH = 1308; // size of the envelope photo; fold lines below are in its pixels
const FOLDS = {
  left: "0,20 362,602 352,700 20,1290 0,1308",
  right: "736,10 378,592 383,700 736,1290",
  top: "0,0 736,0 736,10 378,592 362,602 0,20",
  bottom: "0,1308 20,1290 352,700 383,700 736,1290 736,1308",
};

function PhotoFlap({ src, points, opening, delay, dur }: { src: string; points: string; opening: boolean; delay: number; dur: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${IW} ${IH}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id={`c${id}`}><polygon points={points} /></clipPath>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd9dc" /><stop offset="1" stopColor="#ffd9dc" stopOpacity="0" /></linearGradient>
      </defs>
      <image href={src} width={IW} height={IH} preserveAspectRatio="none" clipPath={`url(#c${id})`} />
      {/* catches the light as it swings towards you */}
      <polygon points={points} fill={`url(#l${id})`} style={{ opacity: opening ? 0.24 : 0, transition: `opacity ${dur * 0.7}ms ease ${delay}ms` }} />
    </svg>
  );
}

export default function EmbossEnvelope({ opening, onOpen, preview, guestName, image }: {
  opening: boolean; onOpen: () => void; preview?: boolean; guestName?: string | null;
  /** Envelope photo (736 × 1308, folds as in FOLDS). Without it the envelope is drawn in code. */
  image?: string;
}) {
  const ease = "cubic-bezier(.55,.05,.25,1)";
  if (image) {
    const swing = (points: string, origin: string, open: string, delay: number, dur: number, z: number, shadow: string) => (
      <span className="absolute inset-0" style={{ zIndex: z, transformOrigin: origin, transform: opening ? open : "none", transition: `transform ${dur}ms ${ease} ${delay}ms, opacity 500ms linear ${delay + dur - 500}ms`, opacity: opening ? 0 : 1, willChange: "transform", filter: shadow }}>
        <PhotoFlap src={image} points={points} opening={opening} delay={delay} dur={dur} />
      </span>
    );
    return (
      <button type="button" onClick={onOpen} aria-label="Open the invitation"
        className={`${preview ? "absolute" : "fixed"} inset-0 z-40 block overflow-hidden ${opening ? "pointer-events-none" : ""}`}
        style={{ perspective: "1600px" }}>
        {/* the whole photo until the tap, so the slit between the flaps looks exactly like the picture */}
        <svg viewBox={`0 0 ${IW} ${IH}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${opening ? "opacity-0" : ""}`} aria-hidden="true">
          <image href={image} width={IW} height={IH} preserveAspectRatio="none" />
        </svg>
        {swing(FOLDS.top, "50% 0%", "rotateX(80deg)", 900, 1500, 1, "drop-shadow(0 3px 5px rgba(15,0,3,.3))")}
        {swing(FOLDS.bottom, "50% 100%", "rotateX(-80deg)", 1000, 1500, 1, "none")}
        {swing(FOLDS.left, "0% 50%", "rotateY(-80deg)", 0, 1900, 2, "drop-shadow(3px 2px 6px rgba(15,0,3,.45))")}
        {swing(FOLDS.right, "100% 50%", "rotateY(80deg)", 80, 1900, 2, "drop-shadow(-3px 2px 6px rgba(15,0,3,.45))")}
        <span className={`pointer-events-none absolute -inset-[30%] z-[3] opacity-[.04] blur-2xl transition-opacity ${opening ? "opacity-0" : ""}`}
          style={{ background: "linear-gradient(115deg,transparent 40%,#fff 50%,transparent 60%)", animation: "st-light 9s ease-in-out infinite" }} />
        <span className={`absolute inset-x-0 bottom-[6%] z-[4] flex flex-col items-center gap-1 text-center transition-opacity duration-300 ${opening ? "opacity-0" : ""}`}>
          <span className="font-serif text-[0.58rem] uppercase tracking-[0.42em] text-[#f1d6d6]/70" style={{ animation: "ec-glow 2.6s ease-in-out infinite" }}>Tap to open</span>
          {guestName && <span className="font-script text-2xl text-[#f1d6d6]/75">for {guestName}</span>}
        </span>
      </button>
    );
  }
  const flap = (clip: string, art: (a: Art) => void, shade: string, origin: string, open: string, delay: number, dur: number, z: number, shadow: string, edge?: string) => (
    <span className="absolute inset-0" style={{ zIndex: z, transformOrigin: origin, transform: opening ? open : "none", transition: `transform ${dur}ms ${ease} ${delay}ms, opacity 500ms linear ${delay + dur - 500}ms`, opacity: opening ? 0 : 1, willChange: "transform" }}>
      <span className="absolute inset-0" style={{ filter: shadow }}>
        <span className="absolute inset-0"><Flap draw={art} base={shade} clip={clip} /></span>
      </span>
      {/* a fine light catch along the folded edge */}
      {edge && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <polyline points={edge} fill="none" stroke="#f3c3c8" strokeOpacity=".22" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {/* catches the light as it swings towards you */}
      <span className="absolute inset-0 bg-gradient-to-br from-[#ffd9dc] to-transparent" style={{ clipPath: clip, opacity: opening ? 0.24 : 0, transition: `opacity ${dur * 0.7}ms ease ${delay}ms` }} />
    </span>
  );
  // flap shapes traced from a real folded envelope: the side flaps end in a short square tip
  const L = "polygon(0 1.5%,49% 46.5%,49% 52.5%,3.5% 100%,0 100%)";
  const R = "polygon(100% 1%,52% 46%,51.5% 53%,77% 100%,100% 100%)";
  const T = "polygon(0 0,100% 0,100% 1%,51% 49.5%,0 1.5%)";
  const B = "polygon(0 100%,100% 100%,51% 50.5%)";
  return (
    <button type="button" onClick={onOpen} aria-label="Open the invitation"
      className={`${preview ? "absolute" : "fixed"} inset-0 z-40 block overflow-hidden ${opening ? "pointer-events-none" : ""}`}
      style={{ perspective: "1600px", background: opening ? "transparent" : "#3a0d15" }}>
      {/* the dark gap where the flaps meet */}
      <span className={`absolute left-[50.3%] top-1/2 h-[7%] w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#120306] transition-opacity ${opening ? "opacity-0" : ""}`} />
      {flap(T, topArt, "#5e1c27", "50% 0%", "rotateX(80deg)", 900, 1500, 1, "drop-shadow(0 3px 5px rgba(15,0,3,.35))")}
      {flap(B, bottomArt, "#561822", "50% 100%", "rotateX(-80deg)", 1000, 1500, 1, "none")}
      {flap(L, leftArt, "#6d2532", "0% 50%", "rotateY(-80deg)", 0, 1900, 2, "drop-shadow(3px 2px 6px rgba(15,0,3,.5))", "0,1.5 49,46.5 49,52.5 3.5,100")}
      {flap(R, rightArt, "#64202c", "100% 50%", "rotateY(80deg)", 80, 1900, 2, "drop-shadow(-3px 2px 6px rgba(15,0,3,.5))", "100,1 52,46 51.5,53 77,100")}
      {/* slow sheen across the paper */}
      <span className={`pointer-events-none absolute -inset-[30%] z-[3] opacity-[.04] blur-2xl transition-opacity ${opening ? "opacity-0" : ""}`}
        style={{ background: "linear-gradient(115deg,transparent 40%,#fff 50%,transparent 60%)", animation: "st-light 9s ease-in-out infinite" }} />
      <span className={`absolute inset-x-0 bottom-[6%] z-[4] flex flex-col items-center gap-1 text-center transition-opacity duration-300 ${opening ? "opacity-0" : ""}`}>
        <span className="font-serif text-[0.58rem] uppercase tracking-[0.42em] text-[#f1d6d6]/70" style={{ animation: "ec-glow 2.6s ease-in-out infinite" }}>Tap to open</span>
        {guestName && <span className="font-script text-2xl text-[#f1d6d6]/75">for {guestName}</span>}
      </span>
    </button>
  );
}
