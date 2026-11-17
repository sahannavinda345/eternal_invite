"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteInvitation, setInvitationPublished } from "@/app/admin/actions";

export default function InvitationAdminActions({ id, slug, published }: { id: string; slug: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a href={`/i/${slug}`} target="_blank" rel="noopener" className="btn">Open ↗</a>
      <button type="button" className="btn" disabled={busy} onClick={async () => { setBusy(true); await setInvitationPublished(id, !published); setBusy(false); router.refresh(); }}>
        {published ? "Unpublish" : "Publish"}
      </button>
      <button type="button" disabled={busy} onBlur={() => setConfirm(false)}
        className="text-[0.62rem] uppercase tracking-[0.2em] text-muted hover:text-red-300"
        onClick={async () => { if (!confirm) return setConfirm(true); setBusy(true); await deleteInvitation(id); setBusy(false); router.refresh(); }}>
        {confirm ? "Click again to delete" : "Delete"}
      </button>
    </span>
  );
}
