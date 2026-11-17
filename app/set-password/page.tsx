"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

/** Couples arrive here from their invite or password-reset email and choose a password. */
export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <form onSubmit={submit} className="card flex w-full max-w-sm flex-col gap-4 p-8">
        <div className="flex flex-col items-center gap-5 pb-2 text-center">
          <Logo wordmark={false} size={44} />
          <p className="eyebrow">Welcome to Eternal Chapter</p>
          <h1 className="display text-2xl">Choose your password</h1>
          <p className="text-sm text-muted">You&apos;ll use it with your email to sign in from now on.</p>
        </div>
        <label className="label" htmlFor="pw">New password
          <input id="pw" type="password" autoComplete="new-password" minLength={8} required className="field normal-case tracking-normal"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="label" htmlFor="pw2">Confirm password
          <input id="pw2" type="password" autoComplete="new-password" minLength={8} required className="field normal-case tracking-normal"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && <p className="bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save & continue"}</button>
      </form>
    </main>
  );
}
