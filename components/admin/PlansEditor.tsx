"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/types";
import { deletePlan, savePlan } from "@/app/admin/actions";
import TemplatePicker from "./TemplatePicker";

function PlanCard({ plan, isNew, used }: { plan: Plan; isNew?: boolean; used: number }) {
  const router = useRouter();
  const [p, setP] = useState(plan);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function save() {
    setBusy(true); setMsg(null);
    const r = await savePlan(p);
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: r.message ?? "Saved." } : { ok: false, text: r.error });
    if (r.ok) router.refresh();
  }

  return (
    <article className="card flex flex-col gap-4 p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="label" htmlFor={`${plan.id}-name`}>Plan name
          <input id={`${plan.id}-name`} className="field normal-case tracking-normal" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
        </label>
        <label className="label" htmlFor={`${plan.id}-code`}>Code
          <input id={`${plan.id}-code`} className="field font-mono normal-case tracking-normal" value={p.id} disabled={!isNew}
            onChange={(e) => setP({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
        </label>
        <label className="label" htmlFor={`${plan.id}-price`}>Price (LKR)
          <input id={`${plan.id}-price`} type="number" min={0} step={100} className="field" value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} />
        </label>
        <label className="label" htmlFor={`${plan.id}-max`}>Invitations
          <input id={`${plan.id}-max`} type="number" min={0} max={100} className="field" value={p.max_invitations} onChange={(e) => setP({ ...p, max_invitations: Number(e.target.value) })} />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className="label">Templates included</span>
        <TemplatePicker idPrefix={`${plan.id}-tpl`} value={p.allowed_designs} onChange={(v) => setP({ ...p, allowed_designs: v })} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : isNew ? "Create plan" : "Save plan"}</button>
        {!isNew && (
          <button type="button" className="text-[0.62rem] uppercase tracking-[0.2em] text-muted hover:text-red-300" disabled={busy} onBlur={() => setConfirm(false)}
            onClick={async () => { if (!confirm) return setConfirm(true); setBusy(true); const r = await deletePlan(plan.id); setBusy(false); setMsg(r.ok ? { ok: true, text: r.message ?? "" } : { ok: false, text: r.error }); router.refresh(); }}>
            {confirm ? "Click again to delete" : "Delete plan"}
          </button>
        )}
        {!isNew && <span className="text-xs text-muted">{used} couple{used === 1 ? "" : "s"} on this plan · changes apply to new couples; existing couples keep their own limits</span>}
      </div>
      {msg && <p className={msg.ok ? "bg-emerald-400/10 p-3 text-sm text-emerald-300" : "bg-red-400/10 p-3 text-sm text-red-300"}>{msg.text}</p>}
    </article>
  );
}

export default function PlansEditor({ plans, usage }: { plans: Plan[]; usage: Record<string, number> }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      {plans.map((p) => <PlanCard key={p.id} plan={p} used={usage[p.id] ?? 0} />)}
      {adding
        ? <PlanCard isNew used={0} plan={{ id: "", name: "", price: 0, max_invitations: 1, allowed_designs: null, sort: plans.length + 1 }} />
        : <button type="button" className="btn self-start" onClick={() => setAdding(true)}>+ New plan</button>}
    </div>
  );
}
