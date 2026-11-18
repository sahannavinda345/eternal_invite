import type { SeatTable } from "@/lib/types";

export const SEAT = 28; // chair diameter in canvas units
export const WORLD = { w: 2000, h: 1400 };

/** Size of the table top (not the chairs). */
export function tableSize(t: SeatTable) {
  switch (t.kind) {
    case "round": { const d = Math.max(76, t.seats * 12); return { w: d, h: d }; }
    case "banquet": return { w: Math.max(120, Math.ceil(t.seats / 2) * 36), h: 60 };
    case "head": return { w: Math.max(140, t.seats * 36), h: 52 };
    case "row": return { w: Math.max(SEAT, t.seats * 34), h: 8 };
    case "decor": return { w: t.w ?? 220, h: t.h ?? 140 };
  }
}

/** Chair centres relative to the table centre. */
export function seatPositions(t: SeatTable): { x: number; y: number }[] {
  const { w, h } = tableSize(t);
  const n = t.seats;
  switch (t.kind) {
    case "round": {
      const r = w / 2 + 20;
      return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
    }
    case "banquet": {
      const top = Math.ceil(n / 2), bottom = n - top;
      const step = w / top;
      return [
        ...Array.from({ length: top }, (_, i) => ({ x: -w / 2 + step * (i + 0.5), y: -h / 2 - 20 })),
        ...Array.from({ length: bottom }, (_, i) => ({ x: -w / 2 + (w / bottom) * (i + 0.5), y: h / 2 + 20 })),
      ];
    }
    case "head": {
      const step = w / n;
      return Array.from({ length: n }, (_, i) => ({ x: -w / 2 + step * (i + 0.5), y: -h / 2 - 20 }));
    }
    case "row": {
      return Array.from({ length: n }, (_, i) => ({ x: -w / 2 + 34 * i + 17, y: 0 }));
    }
    case "decor":
      return [];
  }
}

/** Bounding box including chairs, for fitting the view. */
export function bounds(t: SeatTable) {
  const { w, h } = tableSize(t);
  const pad = t.kind === "decor" ? 0 : t.kind === "row" ? SEAT / 2 + 4 : 34;
  return { x0: t.x - w / 2 - pad, y0: t.y - h / 2 - pad, x1: t.x + w / 2 + pad, y1: t.y + h / 2 + pad };
}

export function initials(name: string) {
  const parts = name.replace(/&.*/, "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
