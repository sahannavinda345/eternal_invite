import PageHead from "@/components/dashboard/PageHead";
import CoupleForm from "@/components/admin/CoupleForm";
import { requireAdmin } from "@/lib/admin";
import type { Plan } from "@/lib/types";

export const metadata = { title: "Add couple" };

export default async function NewCouplePage() {
  const { db } = await requireAdmin();
  const { data } = await db.from("plans").select("*").order("sort");
  return (
    <>
      <PageHead eyebrow="Admin" title="Add couple" sub="Creates their login and sets what their payment includes." />
      <CoupleForm plans={(data ?? []) as Plan[]} />
    </>
  );
}
