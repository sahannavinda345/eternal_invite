import PageHead from "@/components/dashboard/PageHead";
import PlansEditor from "@/components/admin/PlansEditor";
import { requireAdmin } from "@/lib/admin";
import type { Plan } from "@/lib/types";

export const metadata = { title: "Plans & templates" };

export default async function PlansPage() {
  const { db } = await requireAdmin();
  const [{ data: plans }, { data: profiles }] = await Promise.all([
    db.from("plans").select("*").order("sort"),
    db.from("profiles").select("plan_id").eq("role", "couple"),
  ]);
  const usage: Record<string, number> = {};
  for (const p of profiles ?? []) if (p.plan_id) usage[p.plan_id] = (usage[p.plan_id] ?? 0) + 1;
  return (
    <>
      <PageHead eyebrow="Admin" title="Plans & templates"
        sub="What each price includes. Picking a plan when you add a couple copies these limits to them; you can still adjust each couple." />
      <PlansEditor plans={(plans ?? []) as Plan[]} usage={usage} />
    </>
  );
}
