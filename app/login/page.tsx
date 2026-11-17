"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { whatsappLink } from "@/lib/site";

/**
 * Sign in for couples. There is no public sign-up: accounts are created by
 * Eternal Chapter in Supabase → Authentication → Add user after payment.
 */
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("link") === "expired")
      setMsg({ kind: "error", text: "That email link has expired or was already used. Sign in, or reset your password to get a new link." });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg({ kind: "error", text: error.message === "Invalid login credentials"
          ? "That email and password don't match. Check them, or reset your password below."
          : error.message });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: prof } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
        router.replace(prof?.role === "admin" ? "/admin" : "/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/set-password`,
      });
      // Same message whether or not the email has an account, so addresses can't be probed
      if (error && error.status !== 400) setMsg({ kind: "error", text: error.message });
      else setMsg({ kind: "info", text: "If that email has an Eternal Chapter account, a link to set a new password is on its way." });
    }
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <form onSubmit={submit} className="card flex flex-col gap-4 p-8">
          <div className="flex flex-col items-center gap-5 pb-2 text-center">
            <Logo wordmark={false} size={44} />
            <p className="eyebrow">Eternal Chapter</p>
            <h1 className="display text-2xl">{mode === "signin" ? "Welcome back" : "Reset your password"}</h1>
            {mode === "forgot" && <p className="text-sm text-muted">Enter the email we set up your account with.</p>}
          </div>
          <label className="label" htmlFor="email">
            Email
            <input id="email" type="email" required autoComplete="email" className="field normal-case tracking-normal"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode === "signin" && (
            <label className="label" htmlFor="password">
              Password
              <input id="password" type="password" required autoComplete="current-password"
                className="field normal-case tracking-normal" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          )}
          {msg && (
            <p className={msg.kind === "error" ? "bg-red-400/10 p-3 text-sm text-red-300" : "bg-white/5 p-3 text-sm text-white/80"}>{msg.text}</p>
          )}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Send reset link"}
          </button>
          <button type="button" className="text-[0.68rem] uppercase tracking-[0.2em] text-muted hover:text-white"
            onClick={() => { setMode(mode === "signin" ? "forgot" : "signin"); setMsg(null); }}>
            {mode === "signin" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-muted">
          Don&apos;t have an account yet?{" "}
          <a href={whatsappLink()} target="_blank" rel="noopener" className="text-white underline underline-offset-4">Message us on WhatsApp</a>
        </p>
      </div>
    </main>
  );
}
