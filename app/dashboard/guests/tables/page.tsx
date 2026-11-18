import PageHead from "@/components/dashboard/PageHead";
import SeatingPlanner from "@/components/seating/SeatingPlanner";
import { getSession } from "@/lib/dashboard";

export const metadata = { title: "Table arrangement" };

export default async function TablesPage() {
  const { invitation } = await getSession();
  return (
    <>
      <PageHead eyebrow="Guest management" title="Table arrangement"
        sub="Add tables, then drag guests onto chairs. Their whole party sits together. Publish to show each guest their table." />
      <SeatingPlanner invitation={invitation!} />
    </>
  );
}
