import PageHead from "@/components/dashboard/PageHead";
import CreateInvitation from "@/components/dashboard/CreateInvitation";
import { getSession } from "@/lib/dashboard";

export const metadata = { title: "New invitation" };

export default async function NewInvitationPage() {
  const { invitation, invitations } = await getSession();
  return (
    <>
      <PageHead eyebrow="Invitation" title="New invitation" sub="Each celebration can have its own design, link and guest replies." />
      <CreateInvitation isFirst={!invitations.length} partner1={invitation?.partner1} partner2={invitation?.partner2} />
    </>
  );
}
