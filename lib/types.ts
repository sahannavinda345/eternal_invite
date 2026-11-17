export type EventItem = {
  key: string; // "wedding" | "homecoming" | any short id
  label: string; // "Wedding"
  title: string; // "Poruwa ceremony & reception"
  starts_at: string; // ISO date-time, e.g. 2027-02-20T09:00:00+05:30
  venue: string;
  note?: string; // e.g. "Poruwa nekatha 9:42 AM"
};

export type SectionId = "hero" | "countdown" | "story" | "gallery" | "events" | "rsvp";
export type SectionSetting = { id: SectionId; visible: boolean };

export const SECTION_META: Record<SectionId, { label: string; hint: string }> = {
  hero: { label: "Hero / couple intro", hint: "Names, families and the invitation line" },
  countdown: { label: "Countdown timer", hint: "Counts down to the first event" },
  story: { label: "Our story", hint: "A few lines about how you met" },
  gallery: { label: "Photo gallery", hint: "Your favourite photos together" },
  events: { label: "Events & venues", hint: "Dates, times, venues, directions" },
  rsvp: { label: "RSVP", hint: "Reply-by date and guest replies" },
};

export const DEFAULT_SECTIONS: SectionSetting[] = (Object.keys(SECTION_META) as SectionId[]).map((id) => ({ id, visible: true }));

export type Invitation = {
  id: string;
  owner_id: string;
  slug: string;
  design: string;
  partner1: string;
  partner2: string;
  families: string | null;
  story: string | null;
  events: EventItem[];
  rsvp_by: string | null;
  whatsapp: string | null;
  published: boolean;
  title: string; // dashboard name, e.g. "Wedding" or "Homecoming"
  sections: SectionSetting[];
  views: number;
  cover_photo: string | null; // couple photo for the opening screen
  music_url: string | null; // background music
  gallery: string[]; // photo URLs
  created_at: string;
};

export type RsvpStatus = "accepted" | "declined";

export type Rsvp = {
  id: string;
  guest_id: string;
  event_key: string;
  status: RsvpStatus;
  heads: number;
  message: string | null;
  updated_by: "guest" | "couple";
  updated_at: string;
};

export type Guest = {
  id: string;
  invitation_id: string;
  token: string;
  name: string;
  phone: string | null;
  heads: number;
  grp: string;
  side: string;
  events: string[];
  created_at: string;
  rsvps?: Rsvp[];
};

/** What a guest sees about themselves through their private link. */
export type GuestView = {
  name: string;
  heads: number;
  events: string[];
  rsvps: { event_key: string; status: RsvpStatus; heads: number; message: string | null }[];
};

/** Saved section lists from before a section existed get the new ones added at their default place. */
export function withAllSections(saved?: SectionSetting[] | null): SectionSetting[] {
  if (!saved?.length) return DEFAULT_SECTIONS;
  const ids = new Set(saved.map((s) => s.id));
  const out = [...saved];
  DEFAULT_SECTIONS.forEach((d, i) => { if (!ids.has(d.id)) out.splice(Math.min(i, out.length), 0, d); });
  return out;
}

export type Plan = {
  id: string;
  name: string;
  price: number; // LKR
  max_invitations: number;
  allowed_designs: string[] | null; // null = every template
  sort: number;
};

export type Profile = {
  id: string;
  email: string | null;
  couple_name: string | null;
  phone: string | null;
  role: "couple" | "admin";
  plan_id: string | null;
  max_invitations: number;
  allowed_designs: string[] | null; // null = every template
  status: "active" | "suspended";
  paid_amount: number;
  expires_at: string | null; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
};

/** Paused = suspended by the admin, or past the access end date. */
export function isPaused(p: Pick<Profile, "status" | "expires_at" | "role"> | null) {
  if (!p || p.role === "admin") return false;
  if (p.status !== "active") return true;
  return !!p.expires_at && p.expires_at < new Date().toISOString().slice(0, 10);
}

export function designAllowed(p: Pick<Profile, "allowed_designs" | "role"> | null, designId: string) {
  if (!p || p.role === "admin" || !p.allowed_designs) return true;
  return p.allowed_designs.includes(designId);
}
