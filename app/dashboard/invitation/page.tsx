import PageHead from "@/components/dashboard/PageHead";
import CreateInvitation from "@/components/dashboard/CreateInvitation";
import InvitationEditor from "@/components/editor/InvitationEditor";
import { getSession } from "@/lib/dashboard";

export const metadata = { title: "Edit invitation" };

export default async function EditInvitationPage() {
  const { invitation, invitations, profile } = await getSession();
  const allowed = profile?.role === "admin" ? null : profile?.allowed_designs ?? null;
  if (!invitation) {
    return (
      <>
        <PageHead eyebrow="Invitation" title="Create your invitation" sub="Start with your names. You'll design everything else with a live preview." />
        <CreateInvitation isFirst allowedDesigns={allowed} />
      </>
    );
  }
  return (
    <>
      <PageHead eyebrow="Invitation" title="Edit invitation" sub="Every change shows in the phone preview and saves automatically." />
      <InvitationEditor key={invitation.id} initial={invitation} invitations={invitations.map((i) => ({ id: i.id, title: i.title }))} allowedDesigns={allowed} />
    </>
  );
}
