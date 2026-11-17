import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Admin setup" };

/** Shown when the admin panel is missing its secret key. */
export default function AdminSetupPage() {
  const ready = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <div className="card flex w-full max-w-lg flex-col gap-5 p-8">
        <Logo wordmark={false} size={40} />
        <p className="eyebrow">Admin panel setup</p>
        {ready ? (
          <>
            <h1 className="display text-2xl">The key is set</h1>
            <Link href="/admin" className="btn-primary self-start">Open admin panel</Link>
          </>
        ) : (
          <>
            <h1 className="display text-2xl">One step left</h1>
            <p className="text-sm text-muted">The admin panel needs your Supabase secret key on the server.</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-white/80">
              <li>Supabase → Project Settings → API Keys → <b>Secret keys</b> → copy the <b>default</b> key (starts with <code>sb_secret_</code>).</li>
              <li>Vercel → your project → Settings → Environment Variables → add <code>SUPABASE_SERVICE_ROLE_KEY</code> with that value, for <b>Production</b>.</li>
              <li>Vercel → Deployments → the newest deployment → ⋯ → <b>Redeploy</b>.</li>
            </ol>
            <p className="text-xs text-muted">Keep this key secret. Never add <code>NEXT_PUBLIC_</code> to its name.</p>
          </>
        )}
      </div>
    </main>
  );
}
