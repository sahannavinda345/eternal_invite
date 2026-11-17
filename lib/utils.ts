const TZ = "Asia/Colombo";

function valid(iso?: string | null) {
  return !!iso && !Number.isNaN(new Date(iso).getTime());
}

export function formatEventDate(iso: string) {
  if (!valid(iso)) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(iso));
}

export function formatLongDate(iso: string) {
  if (!valid(iso)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso)).toUpperCase();
}

export function formatDay(isoDate: string) {
  if (!valid(isoDate + "T12:00:00+05:30")) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" })
    .format(new Date(isoDate + "T12:00:00+05:30"));
}

/** "2027-02-20T09:00" (from <input type=datetime-local>) → ISO in Sri Lanka time */
export function localToIso(local: string) {
  return local ? `${local}:00+05:30` : "";
}

/** ISO → "2027-02-20T09:00" for <input type=datetime-local>, shown in Sri Lanka time */
export function isoToLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

export function formatShortDate(iso?: string) {
  if (!valid(iso)) return "No date yet";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).format(new Date(iso!));
}

export function daysUntil(iso?: string) {
  if (!valid(iso)) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export function timeAgo(iso?: string | null) {
  if (!iso) return "–";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function googleCalendarUrl(title: string, startIso: string, venue: string, hours = 4) {
  if (!valid(startIso)) return "#";
  const start = new Date(startIso);
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${f(start)}/${f(end)}`, location: venue });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function mapsUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function invitationLink(slug: string) {
  return `${siteUrl()}/i/${slug}`;
}

export function guestLink(slug: string, token: string) {
  return `${siteUrl()}/i/${slug}?g=${token}`;
}

/** Normalise a Sri Lankan mobile: "071 234 5678" → "712345678"; returns null if invalid */
export function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^94/, "").replace(/^0/, "");
  if (!digits) return "";
  return /^7\d{8}$/.test(digits) ? digits : null;
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Visible sections in their saved order (falls back to all sections). */
export function visibleSections(sections?: { id: string; visible: boolean }[] | null) {
  const list = sections?.length ? sections : [{ id: "hero" }, { id: "countdown" }, { id: "story" }, { id: "gallery" }, { id: "events" }, { id: "rsvp" }].map((s) => ({ ...s, visible: true }));
  return list.filter((s) => s.visible).map((s) => s.id);
}

export function randomKey(n = 5) {
  const c = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

export const CURRENT_INVITATION_COOKIE = "ec_invitation";
