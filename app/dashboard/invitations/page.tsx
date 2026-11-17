import Link from "next/link";
import PageHead from "@/components/dashboard/PageHead";
import CopyButton from "@/components/dashboard/CopyButton";
import PublishToggle from "@/components/dashboard/PublishToggle";
import { DeleteInvitation, GoTo, QrCode } from "@/components/dashboard/InvitationActions";
import { getDesign } from "@/components/designs";
import { getSession } from "@/lib/dashboard";
import { formatShortDate, invitationLink } from "@/lib/utils";

export const metadata = { title: "My invitations" };

export default async function MyInvitationsPage() {
  const { invitations } = await getSession();

  return (
    <>
      <PageHead eyebrow="Invitation" title={`My invitations (${invitations.length})`}
        sub="Every invitation you've created – publish, share or edit."
        action={<Link href="/dashboard/invitations/new" className="btn-primary">+ New invitation</Link>} />

      {!invitations.length && (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-muted">You haven&apos;t created an invitation yet.</p>
          <Link href="/dashboard/invitations/new" className="btn-primary">Create your first invitation</Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {invitations.map((inv) => {
          const first = inv.events[0];
          const link = invitationLink(inv.slug);
          return (
            <article key={inv.id} className="card flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={inv.published ? "pill-accepted" : "pill-pending"}>{inv.published ? "Published" : "Draft"}</span>
                <span className="border border-line px-2 py-0.5 text-xs text-muted">{getDesign(inv.design).name}</span>
              </div>
              <div>
                <h2 className="display text-xl">{inv.title}</h2>
                <p className="text-sm text-muted">{inv.partner1} &amp; {inv.partner2}</p>
                <p className="mt-1 text-xs text-muted">{formatShortDate(first?.starts_at)} · {first?.venue || "No venue yet"}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 border border-line bg-canvas p-2 pl-3">
                  <span className="min-w-0 flex-1 truncate text-sm">{link}</span>
                  <CopyButton text={link} label="Copy" />
                  <GoTo id={inv.id} href="/dashboard/invitation">Customize</GoTo>
                </div>
                <QrCode url={link} name={inv.slug} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {inv.published
                  ? <a href={`/i/${inv.slug}`} target="_blank" rel="noopener" className="btn-primary">Open invitation ↗</a>
                  : <a href={`/i/${inv.slug}`} target="_blank" rel="noopener" className="btn">Preview ↗</a>}
                <GoTo id={inv.id} href="/dashboard/invitation">Edit</GoTo>
                <PublishToggle id={inv.id} published={inv.published} />
                <span className="ml-auto"><DeleteInvitation id={inv.id} title={inv.title} /></span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
