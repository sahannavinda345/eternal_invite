"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { EventItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { setCurrentInvitation } from "@/lib/current-invitation";
import { cx, daysUntil, formatShortDate } from "@/lib/utils";
import Logo from "@/components/Logo";
import MobileNav from "./MobileNav";

const groups: { title: string; items: { href: string; label: string; soon?: boolean }[] }[] = [
  { title: "Invitation", items: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/invitations", label: "My invitations" },
    { href: "/dashboard/invitation", label: "Edit invitation" },
  ] },
  { title: "Guest management", items: [
    { href: "/dashboard/guests/add", label: "Add guests" },
    { href: "/dashboard/guests/links", label: "Guest list & links" },
    { href: "/dashboard/guests/rsvp", label: "RSVP management" },
    { href: "/dashboard/guests/tables", label: "Table arrangement" },
    { href: "#", label: "Guest gallery", soon: true },
  ] },
];

type Props = {
  couple: string;
  firstEvent: EventItem | null;
  invitations: { id: string; title: string }[];
  currentId: string | null;
  isAdmin?: boolean;
};

export default function Sidebar({ couple, firstEvent, invitations, currentId, isAdmin = false }: Props) {
  const path = usePathname();
  const router = useRouter();
  const days = daysUntil(firstEvent?.starts_at);

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      <MobileNav
        home="/dashboard"
        isActive={(href) => path === href}
        chip={days !== null ? <span className="flex items-center gap-1.5 border border-line px-2 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-muted"><b className="font-display text-base font-light text-white">{days}</b> days</span> : null}
        tabs={[
          { href: "/dashboard", label: "Home", icon: "home" },
          { href: "/dashboard/invitation", label: "Edit", icon: "edit" },
          { href: "/dashboard/guests/add", label: "Add", icon: "plus" },
          { href: "/dashboard/guests/links", label: "Guests", icon: "guests" },
          { href: "/dashboard/guests/rsvp", label: "RSVPs", icon: "rsvp" },
        ]}
        groups={groups}
        top={invitations.length > 1 ? (
          <label className="label w-full" htmlFor="current-inv-m">Working on
            <select id="current-inv-m" className="field normal-case tracking-normal" value={currentId ?? ""}
              onChange={(e) => { setCurrentInvitation(e.target.value); router.refresh(); }}>
              {invitations.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </label>
        ) : null}
        bottom={
          <div className="flex flex-col gap-3">
            {isAdmin && <Link href="/admin" className="btn w-full">Admin panel →</Link>}
            <div className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-muted">{couple}</span>
              <button type="button" onClick={signOut} className="btn">Sign out</button>
            </div>
          </div>
        }
      />
    <aside className="hidden border-r border-line bg-canvas px-3.5 py-5 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:gap-4 md:overflow-y-auto">
      <Logo href="/dashboard" size={28} />

      {days !== null && (
        <div className="flex items-center gap-3 border border-line px-3 py-2">
          <b className="font-display text-2xl font-light tabular-nums text-white">{days}</b>
          <span className="text-[0.6rem] uppercase leading-snug tracking-[0.18em] text-muted">
            Days until<br />{formatShortDate(firstEvent?.starts_at)}
          </span>
        </div>
      )}

      {invitations.length > 1 && (
        <label className="label w-full" htmlFor="current-inv">Working on
          <select id="current-inv" className="field normal-case tracking-normal" value={currentId ?? ""}
            onChange={(e) => { setCurrentInvitation(e.target.value); router.refresh(); }}>
            {invitations.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
          </select>
        </label>
      )}

      {groups.map((g) => (
        <nav key={g.title} className="flex flex-col" aria-label={g.title}>
          <h4 className="mb-1.5 text-[0.6rem] uppercase tracking-[0.24em] text-muted">{g.title}</h4>
          {g.items.map((it) =>
            it.soon ? (
              <span key={it.label} className="flex items-center px-2.5 py-1.5 text-sm text-white/35">
                {it.label}
                <span className="ml-auto border border-line px-1.5 text-[0.55rem] uppercase tracking-wider">Soon</span>
              </span>
            ) : (
              <Link key={it.href} href={it.href}
                className={cx("border-l px-2.5 py-1.5 text-sm", path === it.href ? "border-white bg-white/[0.06] text-white" : "border-transparent text-white/60 hover:text-white")}>
                {it.label}
              </Link>
            )
          )}
        </nav>
      ))}


      {isAdmin && (
        <Link href="/admin" className="border border-white/30 px-2.5 py-2 text-center text-[0.62rem] uppercase tracking-[0.24em] text-white hover:border-white">Admin panel →</Link>
      )}

      <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5 text-sm">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/30 text-xs">{couple.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1 truncate">{couple}</div>
        <button type="button" onClick={signOut} className="text-[0.6rem] uppercase tracking-[0.2em] text-muted hover:text-white">Sign out</button>
      </div>
    </aside>
    </>
  );
}
