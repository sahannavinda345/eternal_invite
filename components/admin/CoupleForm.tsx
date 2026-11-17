"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteUrl } from "@/lib/utils";
import type { Plan, Profile } from "@/lib/types";
import { lkr } from "@/lib/utils";
import { createCouple, updateCouple, type CoupleFields } from "@/app/admin/actions";
import TemplatePicker from "./TemplatePicker";

function randomPassword() {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => c[n % c.length]).join("");
}

/** Add a couple (create) or change a couple's plan and limits (edit). */
export default function CoupleForm({ plans, couple }: { plans: Plan[]; couple?: Profile }) {
  const router = useRouter();
  const editing = !!couple;
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"password" | "invite">("password");
  const [password, setPassword] = useState(() => randomPassword());
  const [f, setF] = useState<CoupleFields>({
    couple_name: couple?.couple_name ?? "",
    phone: couple?.phone ?? "",
    plan_id: couple?.plan_id ?? plans[0]?.id ?? null,
    max_invitations: couple?.max_invitations ?? plans[0]?.max_invitations ?? 1,
    allowed_designs: couple ? couple.allowed_designs : plans[0]?.allowed_designs ?? null,
    status: couple?.status ?? "active",
    paid_amount: couple?.paid_amount ?? plans[0]?.price ?? 0,
    expires_at: couple?.expires_at ?? "",
    notes: couple?.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [created, setCreated] = useState<{ id: string; mode: "password" | "invite" } | null>(null);
  const [copied, setCopied] = useState(false);

  function pickPlan(id: string) {
    const p = plans.find((x) => x.id === id);
    setF((cur) => p
      ? { ...cur, plan_id: p.id, max_invitations: p.max_invitations, allowed_designs: p.allowed_designs, paid_amount: editing ? cur.paid_amount : p.price }
      : { ...cur, plan_id: null });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = editing ? await updateCouple(couple!.id, f) : await createCouple({ ...f, email, mode, password });
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: res.error });
    setMsg({ ok: true, text: res.message ?? "Saved." });
    if (!editing && res.id) setCreated({ id: res.id, mode });
    router.refresh();
  }

  if (created) {
    const details = `Your Eternal Chapter account is ready.\n\nSign in: ${siteUrl()}/login\nEmail: ${email}\nPassword: ${password}\n\nYou can change the password after signing in with "Forgot your password?".`;
    return (
      <section className="card flex flex-col gap-4 p-6">
        <p className="eyebrow">Couple added</p>
        {created.mode === "password" ? (
          <>
            <p className="text-sm text-muted">Send these details to the couple on WhatsApp. The password isn&apos;t shown again.</p>
            <pre className="whitespace-pre-wrap border border-line bg-canvas p-4 text-sm text-white">{details}</pre>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(details); setCopied(true); } catch { setCopied(false); } }}>
                {copied ? "Copied" : "Copy message"}
              </button>
              {f.phone && <a className="btn" target="_blank" rel="noopener" href={`https://wa.me/${f.phone.replace(/\D/g, "").replace(/^0/, "94")}?text=${encodeURIComponent(details)}`}>Send on WhatsApp</a>}
              <Link href={`/admin/couples/${created.id}`} className="btn">Open couple</Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">We emailed {email} a link to choose their password. It can take a few minutes to arrive.</p>
            <div><Link href={`/admin/couples/${created.id}`} className="btn-primary">Open couple</Link></div>
          </>
        )}
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {!editing && (
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-sm text-white sm:col-span-2">Login</h2>
          <label className="label sm:col-span-2" htmlFor="c-email">Couple&apos;s email
            <input id="c-email" type="email" required className="field normal-case tracking-normal" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nethmi@gmail.com" />
          </label>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="label">How they get in</span>
            <label className="flex items-start gap-2 text-sm" htmlFor="m-pw">
              <input id="m-pw" type="radio" name="mode" className="mt-1 accent-white" checked={mode === "password"} onChange={() => setMode("password")} />
              <span>I set a password and send it to them on WhatsApp <span className="block text-xs text-muted">Works right away, no email needed.</span></span>
            </label>
            <label className="flex items-start gap-2 text-sm" htmlFor="m-inv">
              <input id="m-inv" type="radio" name="mode" className="mt-1 accent-white" checked={mode === "invite"} onChange={() => setMode("invite")} />
              <span>Email them an invite to choose their own password <span className="block text-xs text-muted">Needs the invite email template set up (see README).</span></span>
            </label>
          </div>
          {mode === "password" && (
            <label className="label sm:col-span-2" htmlFor="c-pw">Password
              <div className="flex gap-2">
                <input id="c-pw" type="text" minLength={8} required className="field font-mono normal-case tracking-normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="btn" onClick={() => setPassword(randomPassword())}>New</button>
              </div>
            </label>
          )}
        </section>
      )}

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-sm text-white sm:col-span-2">Couple</h2>
        <label className="label" htmlFor="c-name">Couple name
          <input id="c-name" className="field normal-case tracking-normal" value={f.couple_name} onChange={(e) => setF({ ...f, couple_name: e.target.value })} placeholder="Kasun & Nethmi" />
        </label>
        <label className="label" htmlFor="c-phone">WhatsApp
          <input id="c-phone" inputMode="tel" className="field normal-case tracking-normal" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+94 77 123 4567" />
        </label>
        <label className="label sm:col-span-2" htmlFor="c-notes">Notes (only you see these)
          <textarea id="c-notes" className="field min-h-[60px] normal-case tracking-normal" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Paid by bank transfer on 17 Nov, wants Sinhala text" />
        </label>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-sm text-white sm:col-span-2">Plan &amp; payment</h2>
        <label className="label sm:col-span-2" htmlFor="c-plan">Plan
          <select id="c-plan" className="field normal-case tracking-normal" value={f.plan_id ?? ""} onChange={(e) => pickPlan(e.target.value)}>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – {lkr(p.price)} · {p.max_invitations} invitation{p.max_invitations === 1 ? "" : "s"}</option>)}
            <option value="">Custom (no plan)</option>
          </select>
          <span className="normal-case tracking-normal text-muted">Choosing a plan fills in the limits below. You can still change them for this couple.</span>
        </label>
        <label className="label" htmlFor="c-paid">Amount paid (LKR)
          <input id="c-paid" type="number" min={0} step={100} className="field" value={f.paid_amount} onChange={(e) => setF({ ...f, paid_amount: Number(e.target.value) })} />
        </label>
        <label className="label" htmlFor="c-max">Invitations they can make
          <input id="c-max" type="number" min={0} max={100} className="field" value={f.max_invitations} onChange={(e) => setF({ ...f, max_invitations: Number(e.target.value) })} />
        </label>
        <label className="label" htmlFor="c-exp">Access until (optional)
          <input id="c-exp" type="date" className="field" value={f.expires_at ?? ""} onChange={(e) => setF({ ...f, expires_at: e.target.value })} />
          <span className="normal-case tracking-normal text-muted">After this date they can&apos;t edit. Guests still see published invitations.</span>
        </label>
        <label className="label" htmlFor="c-status">Status
          <select id="c-status" className="field normal-case tracking-normal" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as "active" | "suspended" })}>
            <option value="active">Active</option>
            <option value="suspended">Suspended (can&apos;t sign in to edit)</option>
          </select>
        </label>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="label">Templates they can use</span>
          <TemplatePicker idPrefix="c-tpl" value={f.allowed_designs} onChange={(v) => setF({ ...f, allowed_designs: v })} />
        </div>
      </section>

      {msg && <p className={msg.ok ? "bg-emerald-400/10 p-3 text-sm text-emerald-300" : "bg-red-400/10 p-3 text-sm text-red-300"}>{msg.text}</p>}
      <div><button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add couple"}</button></div>
    </form>
  );
}
