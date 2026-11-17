"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/guests/add", label: "Add guests" },
  { href: "/dashboard/guests/links", label: "Guest list & links" },
  { href: "/dashboard/guests/rsvp", label: "RSVP management" },
];

export default function GuestTabs() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1.5" aria-label="Guest management">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href}
          className={cx("rounded-sm px-3.5 py-2 text-sm", path === t.href ? "bg-brand font-medium text-black" : "text-muted hover:bg-white hover:text-brand-ink")}>
          {t.label}
        </Link>
      ))}
      <span className="rounded-sm px-3.5 py-2 text-sm text-muted/60">Table arrangement · soon</span>
    </nav>
  );
}
