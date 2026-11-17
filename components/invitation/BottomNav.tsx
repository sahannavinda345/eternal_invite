"use client";

const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  events: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  gallery: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /><circle cx="15.5" cy="9" r="1.5" /></>,
  venue: <><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  rsvp: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
};

/** Floating icon bar that jumps to sections (ids: ec-home, ec-events, ec-gallery, ec-venue, ec-rsvp). */
export default function BottomNav({ items, look, preview = false }: { items: string[]; look: string; preview?: boolean }) {
  return (
    <nav aria-label="Invitation sections"
      style={preview ? undefined : { bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      className={`${preview ? "sticky bottom-3 mx-auto mt-6" : "fixed inset-x-0 mx-auto"} z-40 flex w-max items-center gap-1 rounded-full px-2 py-1.5 shadow-lg backdrop-blur-md ${look}`}>
      {items.map((id) => (
        <button key={id} type="button" aria-label={`Go to ${id}`}
          onClick={() => document.getElementById(`ec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/5">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{ICONS[id]}</svg>
        </button>
      ))}
    </nav>
  );
}
