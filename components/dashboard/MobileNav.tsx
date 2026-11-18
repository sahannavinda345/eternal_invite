"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { cx } from "@/lib/utils";

export type NavIcon = "home" | "edit" | "list" | "guests" | "rsvp" | "plus" | "plans" | "couples";

const PATHS: Record<NavIcon, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  list: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  guests: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M17.5 14c2.2.3 3.6 1.9 4 4.5" /></>,
  rsvp: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  plans: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 14h3" /></>,
  couples: <><circle cx="8.5" cy="9" r="3" /><circle cx="15.5" cy="9" r="3" /><path d="M2.5 20c.6-3.2 3-5 6-5 1.4 0 2.6.4 3.5 1.1.9-.7 2.1-1.1 3.5-1.1 3 0 5.4 1.8 6 5" /></>,
};

export function Icon({ name, size = 20 }: { name: NavIcon; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATHS[name]}</svg>;
}

type Item = { href: string; label: string; soon?: boolean };

/**
 * Phone navigation: a slim sticky top bar (logo, a status chip, Menu) and a bottom tab bar
 * with the screens people use most. The Menu opens a sheet with every page.
 */
export default function MobileNav({ home, chip, tabs, groups, top, bottom, isActive }: {
  home: string;
  chip?: React.ReactNode;
  tabs: { href: string; label: string; icon: NavIcon }[];
  groups: { title: string; items: Item[] }[];
  top?: React.ReactNode; // extra controls at the top of the menu (e.g. invitation switcher)
  bottom?: React.ReactNode; // sign out etc.
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-canvas/95 px-4 py-2.5 backdrop-blur md:hidden"
        style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top, 0px))" }}>
        <Logo href={home} size={26} />
        <span className="ml-auto">{chip}</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}
          className="grid h-10 w-10 place-items-center border border-line text-white">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </header>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-canvas/95 backdrop-blur md:hidden"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map((t) => {
          const on = isActive(t.href);
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined}
              className={cx("flex flex-col items-center gap-1 py-2.5 text-[0.58rem] uppercase tracking-[0.1em]", on ? "text-white" : "text-white/45")}>
              <span className={cx("grid h-7 w-12 place-items-center rounded-full transition", on && "bg-white/10")}><Icon name={t.icon} /></span>
              {t.label}
            </Link>
          );
        })}
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 md:hidden" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="anim-sheet flex max-h-[88vh] flex-col gap-5 overflow-y-auto border-t border-line bg-surface px-5 pt-3"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }} role="dialog" aria-label="Menu">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
            <div className="flex items-center justify-between">
              <span className="eyebrow">Menu</span>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center text-2xl text-muted" aria-label="Close menu">×</button>
            </div>
            {top}
            {groups.map((g) => (
              <nav key={g.title} aria-label={g.title} className="flex flex-col">
                <h4 className="mb-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">{g.title}</h4>
                {g.items.map((it) => it.soon ? (
                  <span key={it.label} className="flex items-center justify-between border-b border-line py-3.5 text-white/35">
                    {it.label}<span className="border border-line px-1.5 text-[0.55rem] uppercase tracking-wider">Soon</span>
                  </span>
                ) : (
                  <Link key={it.href} href={it.href} className={cx("flex items-center justify-between border-b border-line py-3.5", isActive(it.href) ? "text-white" : "text-white/70")}>
                    {it.label}<span aria-hidden="true" className="text-muted">›</span>
                  </Link>
                ))}
              </nav>
            ))}
            {bottom}
          </div>
        </div>
      )}
    </>
  );
}
