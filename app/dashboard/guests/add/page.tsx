import PageHead from "@/components/dashboard/PageHead";
import AddGuestsForm from "@/components/dashboard/AddGuestsForm";
import { getSession } from "@/lib/dashboard";

export const metadata = { title: "Add guests" };

export default async function AddGuestsPage() {
  const { invitation } = await getSession();
  return (
    <>
      <PageHead eyebrow="Guest management" title="Add guests" sub="Fill in as many rows as you need. Each guest gets a personal invitation link." />
      <AddGuestsForm invitationId={invitation!.id} events={invitation!.events} />
    </>
  );
}
