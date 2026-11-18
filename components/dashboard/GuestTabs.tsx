"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/guests/add", label: "Add guests" },
  { href: "/dashboard/guests/links", label: "Guest list & links" },
  { href: "/dashboard/guests/rsvp", label: "RSVP management" },
  { href: "/dashboard/guests/tables", label: "Table arrangement" },
];

export default function GuestTabs() {
  const path = usePathname();
  return (
    <nav className="scroll-row -mx-4 flex items-center gap-1.5 px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Guest management">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href}
          className={cx("whitespace-nowrap rounded-sm px-3.5 py-2 text-sm", path === t.href ? "bg-brand font-medium text-black" : "text-muted hover:bg-white/5 hover:text-white")}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
