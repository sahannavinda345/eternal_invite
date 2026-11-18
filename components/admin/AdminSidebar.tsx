"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";
import MobileNav from "@/components/dashboard/MobileNav";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/couples", label: "Couples" },
  { href: "/admin/couples/new", label: "Add couple" },
  { href: "/admin/plans", label: "Plans & templates" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const path = usePathname();
  const router = useRouter();
  const active = (href: string) => (href === "/admin" ? path === href : path === href || (href === "/admin/couples" && path.startsWith("/admin/couples/") && path !== "/admin/couples/new"));
  return (
    <>
      <MobileNav
        home="/admin"
        isActive={active}
        chip={<span className="border border-white/30 px-2 py-1 text-[0.55rem] uppercase tracking-[0.3em] text-white">Admin</span>}
        tabs={[
          { href: "/admin", label: "Overview", icon: "home" },
          { href: "/admin/couples", label: "Couples", icon: "couples" },
          { href: "/admin/couples/new", label: "Add", icon: "plus" },
          { href: "/admin/plans", label: "Plans", icon: "plans" },
        ]}
        groups={[{ title: "Admin", items: [...items, { href: "/dashboard", label: "My couple dashboard" }] }]}
        bottom={
          <div className="flex items-center gap-3 text-sm">
            <span className="min-w-0 flex-1 truncate text-muted">{email}</span>
            <button type="button" className="btn" onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); }}>Sign out</button>
          </div>
        }
      />
    <aside className="hidden border-r border-line bg-canvas px-3.5 py-5 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:gap-4">
      <Logo href="/admin" size={28} />
      <span className="self-start border border-white/30 px-2 py-1 text-center text-[0.58rem] uppercase tracking-[0.3em] text-white">Admin</span>
      <nav className="flex flex-col" aria-label="Admin">
        {items.map((it) => (
          <Link key={it.href} href={it.href}
            className={cx("whitespace-nowrap border-l px-2.5 py-1.5 text-sm",
              active(it.href) ? "border-white bg-white/[0.06] text-white" : "border-transparent text-white/60 hover:text-white")}>
            {it.label}
          </Link>
        ))}
        <Link href="/dashboard" className="whitespace-nowrap border-l border-transparent px-2.5 py-1.5 text-sm text-white/40 hover:text-white md:mt-3">My couple dashboard →</Link>
      </nav>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3.5 text-xs">
        <span className="min-w-0 flex-1 truncate text-muted">{email}</span>
        <button type="button" className="text-[0.6rem] uppercase tracking-[0.2em] text-muted hover:text-white"
          onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); }}>Sign out</button>
      </div>
    </aside>
    </>
  );
}
