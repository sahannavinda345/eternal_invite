import PageHead from "@/components/dashboard/PageHead";
import RsvpManager from "@/components/dashboard/RsvpManager";
import { getSession } from "@/lib/dashboard";

export const metadata = { title: "RSVP management" };

export default async function RsvpPage() {
  const { invitation } = await getSession();
  return (
    <>
      <PageHead eyebrow="Guest management" title="RSVP management" sub="Replies arrive here live as guests answer their personal links." />
      <RsvpManager invitation={invitation!} />
    </>
  );
}
