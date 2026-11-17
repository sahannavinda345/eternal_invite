"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

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
    <aside className="flex flex-wrap items-center gap-4 border-b border-line bg-canvas px-4 py-3 md:sticky md:top-0 md:h-screen md:flex-col md:flex-nowrap md:items-stretch md:border-b-0 md:border-r md:px-3.5 md:py-5">
      <Logo href="/admin" size={28} />
      <span className="border border-white/30 px-2 py-1 text-center text-[0.58rem] uppercase tracking-[0.3em] text-white md:self-start">Admin</span>
      <nav className="flex w-full gap-1.5 overflow-x-auto md:flex-col md:gap-0" aria-label="Admin">
        {items.map((it) => (
          <Link key={it.href} href={it.href}
            className={cx("whitespace-nowrap border-l px-2.5 py-1.5 text-sm",
              active(it.href) ? "border-white bg-white/[0.06] text-white" : "border-transparent text-white/60 hover:text-white")}>
            {it.label}
          </Link>
        ))}
        <Link href="/dashboard" className="whitespace-nowrap border-l border-transparent px-2.5 py-1.5 text-sm text-white/40 hover:text-white md:mt-3">My couple dashboard →</Link>
      </nav>
      <div className="mt-auto hidden items-center gap-2 border-t border-line pt-3.5 text-xs md:flex">
        <span className="min-w-0 flex-1 truncate text-muted">{email}</span>
        <button type="button" className="text-[0.6rem] uppercase tracking-[0.2em] text-muted hover:text-white"
          onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); }}>Sign out</button>
      </div>
    </aside>
  );
}
