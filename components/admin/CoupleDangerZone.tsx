"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCouple, sendPasswordReset, setCouplePassword } from "@/app/admin/actions";

export default function CoupleDangerZone({ id, email, label }: { id: string; email: string | null; label: string }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    setBusy(true); setMsg(null);
    const r = await fn();
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: r.message ?? "Done." } : { ok: false, text: r.error ?? "Something went wrong." });
    return r.ok;
  }

  return (
    <section className="card flex flex-col gap-5 p-5">
      <h2 className="text-sm text-white">Login help</h2>
      <div className="flex flex-wrap items-end gap-2">
        <label className="label min-w-[220px] flex-1" htmlFor="new-pw">Set a new password
          <input id="new-pw" type="text" minLength={8} className="field font-mono normal-case tracking-normal" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        </label>
        <button type="button" className="btn" disabled={busy || pw.length < 8} onClick={() => run(() => setCouplePassword(id, pw))}>Change password</button>
        {email && <button type="button" className="btn" disabled={busy} onClick={() => run(() => sendPasswordReset(email))}>Email reset link</button>}
      </div>

      <div className="flex flex-col gap-2 border-t border-red-400/20 pt-5">
        <h2 className="text-sm text-red-300">Remove couple</h2>
        <p className="text-sm text-muted">Deletes the account, all their invitations, guest lists, replies, photos and music. Guests&apos; links stop working. This can&apos;t be undone. To keep their data but block access, set Status to Suspended instead.</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="label min-w-[220px] flex-1" htmlFor="del-confirm">Type DELETE to confirm
            <input id="del-confirm" className="field normal-case tracking-normal" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <button type="button" className="btn border-red-400/50 text-red-300 hover:border-red-300 hover:text-red-200" disabled={busy || confirm !== "DELETE"}
            onClick={async () => { if (await run(() => deleteCouple(id))) { router.push("/admin/couples"); router.refresh(); } }}>
            Remove {label}
          </button>
        </div>
      </div>
      {msg && <p className={msg.ok ? "bg-emerald-400/10 p-3 text-sm text-emerald-300" : "bg-red-400/10 p-3 text-sm text-red-300"} aria-live="polite">{msg.text}</p>}
    </section>
  );
}
