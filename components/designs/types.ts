import type { GuestView, Invitation } from "@/lib/types";

export type DesignProps = {
  invitation: Invitation;
  guest: GuestView | null;
  token: string | null;
  /** Rendered inside the editor's phone frame: no envelope cover, compact sizes, RSVP is a demo. */
  preview?: boolean;
};

/** Sample guest shown in the editor preview and dashboard thumbnails. */
export function sampleGuest(inv: Invitation): GuestView {
  return { name: "Nimal Perera", heads: 2, events: inv.events.map((e) => e.key), rsvps: [] };
}
