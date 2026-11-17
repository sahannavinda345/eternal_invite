import PageHead from "@/components/dashboard/PageHead";
import GuestLinks from "@/components/dashboard/GuestLinks";
import { getSession } from "@/lib/dashboard";

export const metadata = { title: "Guest list & links" };

export default async function LinksPage() {
  const { invitation } = await getSession();
  return (
    <>
      <PageHead eyebrow="Guest management" title="Guest list & links" sub="Every guest has a personal link that opens with their name." />
      <GuestLinks invitation={invitation!} />
    </>
  );
}
