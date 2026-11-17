import Link from "next/link";
import PageHead from "@/components/dashboard/PageHead";
import CreateInvitation from "@/components/dashboard/CreateInvitation";
import { getSession } from "@/lib/dashboard";
import { whatsappLink } from "@/lib/site";

export const metadata = { title: "New invitation" };

export default async function NewInvitationPage() {
  const { invitation, invitations, profile, canCreate, maxInvitations } = await getSession();
  return (
    <>
      <PageHead eyebrow="Invitation" title="New invitation" sub="Each celebration can have its own design, link and guest replies." />
      {canCreate ? (
        <CreateInvitation isFirst={!invitations.length} partner1={invitation?.partner1} partner2={invitation?.partner2}
          allowedDesigns={profile?.role === "admin" ? null : profile?.allowed_designs ?? null} />
      ) : (
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="text-white">Your plan includes {maxInvitations} invitation{maxInvitations === 1 ? "" : "s"}, and you&apos;ve used {invitations.length}.</p>
          <p className="text-sm text-muted">To add a homecoming or another celebration, ask us to upgrade your plan.</p>
          <div className="flex flex-wrap gap-2">
            <a href={whatsappLink("Hi Eternal Chapter, I'd like to add another invitation to my plan.")} target="_blank" rel="noopener" className="btn-primary">Ask on WhatsApp</a>
            <Link href="/dashboard/invitations" className="btn">My invitations</Link>
          </div>
        </div>
      )}
    </>
  );
}
