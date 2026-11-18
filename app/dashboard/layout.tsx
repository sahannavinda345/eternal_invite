import Sidebar from "@/components/dashboard/Sidebar";
import Logo from "@/components/Logo";
import { getSession } from "@/lib/dashboard";
import { isPaused } from "@/lib/types";
import { whatsappLink } from "@/lib/site";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, invitation, invitations } = await getSession();

  if (isPaused(profile)) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-4 text-center">
        <div className="flex max-w-md flex-col items-center gap-5">
          <Logo wordmark={false} size={44} />
          <p className="eyebrow">Account paused</p>
          <h1 className="display text-2xl">Your dashboard is paused</h1>
          <p className="text-sm text-muted">
            {profile?.expires_at && profile.status === "active"
              ? `Editing access ended on ${profile.expires_at}. Published invitations stay online for your guests.`
              : "Please contact Eternal Chapter to continue. Published invitations stay online for your guests."}
          </p>
          <a href={whatsappLink("Hi Eternal Chapter, my dashboard is paused. Can you help?")} target="_blank" rel="noopener" className="btn-primary">Message us on WhatsApp</a>
        </div>
      </main>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] content-start md:grid-cols-[232px_minmax(0,1fr)] md:content-stretch">
      <Sidebar
        couple={invitation ? `${invitation.partner1} & ${invitation.partner2}` : profile?.couple_name || user.email || "Your account"}
        firstEvent={invitation?.events[0] ?? null}
        invitations={invitations.map((i) => ({ id: i.id, title: i.title }))}
        currentId={invitation?.id ?? null}
        isAdmin={profile?.role === "admin"}
      />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 md:pb-12 md:pt-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
