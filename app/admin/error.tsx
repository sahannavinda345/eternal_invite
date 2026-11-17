"use client";

/** Friendly message if something in the admin panel fails. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card flex flex-col items-start gap-4 p-6">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display text-2xl">This admin page couldn&apos;t load</h1>
      <p className="text-sm text-muted">
        Check that <code>004_admin.sql</code> has been run in Supabase and that <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in Vercel, then try again.
        {error.digest && <> Error code: <code>{error.digest}</code> (search for it in Vercel → Logs).</>}
      </p>
      <button type="button" className="btn-primary" onClick={reset}>Try again</button>
    </div>
  );
}
