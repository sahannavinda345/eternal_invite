import Link from "next/link";
import GuestTabs from "@/components/dashboard/GuestTabs";
import { getSession } from "@/lib/dashboard";

export default async function GuestsLayout({ children }: { children: React.ReactNode }) {
  const { invitation } = await getSession();
  if (!invitation) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-muted">Create your invitation first, then add guests to it.</p>
        <Link href="/dashboard" className="btn-primary">Create invitation</Link>
      </div>
    );
  }
  return (
    <>
      <GuestTabs />
      {children}
    </>
  );
}
