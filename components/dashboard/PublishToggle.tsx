"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy} className={published ? "btn" : "btn-primary"}
      onClick={async () => {
        setBusy(true);
        await createClient().from("invitations").update({ published: !published }).eq("id", id);
        setBusy(false);
        router.refresh();
      }}>
      {busy ? "Saving…" : published ? "Unpublish" : "Publish"}
    </button>
  );
}
