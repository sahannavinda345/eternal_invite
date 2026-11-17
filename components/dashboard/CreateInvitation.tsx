"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setCurrentInvitation } from "@/lib/current-invitation";
import { DEFAULT_SECTIONS } from "@/lib/types";
import { randomKey, slugify } from "@/lib/utils";
import { DESIGNS } from "@/components/designs";

const KINDS = [
  { title: "Wedding", heading: "Poruwa ceremony & reception" },
  { title: "Homecoming", heading: "Homecoming dinner" },
  { title: "Engagement", heading: "Engagement ceremony" },
  { title: "Reception", heading: "Wedding reception" },
];

/** Creates a new invitation with sensible defaults, then opens the editor. */
export default function CreateInvitation({ partner1 = "", partner2 = "", isFirst }: { partner1?: string; partner2?: string; isFirst: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ title: isFirst ? "Wedding" : "Homecoming", partner1, partner2, design: DESIGNS[0].id });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.partner1.trim() || !f.partner2.trim()) return setError("Enter both names.");
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const kind = KINDS.find((k) => k.title === f.title);
    const base = slugify(`${f.partner1}-${f.partner2}${isFirst ? "" : `-${f.title}`}`) || "invitation";
    const row = {
      owner_id: user!.id,
      title: f.title.trim() || "Wedding",
      design: f.design,
      partner1: f.partner1.trim(),
      partner2: f.partner2.trim(),
      sections: DEFAULT_SECTIONS,
      events: [{ key: slugify(f.title) || `e-${randomKey()}`, label: f.title, title: kind?.heading ?? f.title, starts_at: "", venue: "" }],
    };
    // Try the clean link first, then add a short suffix if it's taken
    let res = await supabase.from("invitations").insert({ ...row, slug: base.padEnd(3, "x") }).select("id").single();
    if (res.error?.code === "23505") res = await supabase.from("invitations").insert({ ...row, slug: `${base}-${randomKey(4)}` }).select("id").single();
    setBusy(false);
    if (res.error || !res.data) return setError(res.error?.message ?? "Could not create the invitation.");
    setCurrentInvitation(res.data.id);
    router.push("/dashboard/invitation");
    router.refresh();
  }

  return (
    <form onSubmit={create} className="card grid max-w-2xl gap-4 p-6 sm:grid-cols-2">
      <label className="label sm:col-span-2" htmlFor="kind">What are you inviting guests to?
        <div id="kind" className="flex flex-wrap gap-2 normal-case tracking-normal">
          {KINDS.map((k) => (
            <button key={k.title} type="button" onClick={() => setF({ ...f, title: k.title })}
              className={f.title === k.title ? "border border-white bg-white px-4 py-2 text-xs uppercase tracking-[0.18em] text-black" : "border border-line px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted hover:border-white/40"}>
              {k.title}
            </button>
          ))}
        </div>
      </label>
      <label className="label" htmlFor="c1">Groom / partner 1
        <input id="c1" className="field normal-case tracking-normal" value={f.partner1} placeholder="Kasun" onChange={(e) => setF({ ...f, partner1: e.target.value })} />
      </label>
      <label className="label" htmlFor="c2">Bride / partner 2
        <input id="c2" className="field normal-case tracking-normal" value={f.partner2} placeholder="Nethmi" onChange={(e) => setF({ ...f, partner2: e.target.value })} />
      </label>
      <label className="label sm:col-span-2" htmlFor="design">Template
        <select id="design" className="field normal-case tracking-normal" value={f.design} onChange={(e) => setF({ ...f, design: e.target.value })}>
          {DESIGNS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      {error && <p className="bg-red-400/10 p-3 text-sm text-red-300 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Creating…" : "Create & open editor →"}</button>
      </div>
    </form>
  );
}
