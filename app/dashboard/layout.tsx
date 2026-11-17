import Sidebar from "@/components/dashboard/Sidebar";
import { getSession } from "@/lib/dashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, invitation, invitations } = await getSession();
  return (
    <div className="grid min-h-screen md:grid-cols-[232px_minmax(0,1fr)]">
      <Sidebar
        couple={invitation ? `${invitation.partner1} & ${invitation.partner2}` : user.email ?? "Your account"}
        firstEvent={invitation?.events[0] ?? null}
        invitations={invitations.map((i) => ({ id: i.id, title: i.title }))}
        currentId={invitation?.id ?? null}
      />
      <main className="min-w-0 px-4 pb-12 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
