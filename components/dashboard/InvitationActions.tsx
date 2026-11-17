"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { setCurrentInvitation } from "@/lib/current-invitation";

/** Makes this the dashboard's current invitation, then opens a page (editor, guest links…). */
export function GoTo({ id, href, children, primary = false }: { id: string; href: string; children: React.ReactNode; primary?: boolean }) {
  const router = useRouter();
  return (
    <button type="button" className={primary ? "btn-primary" : "btn"}
      onClick={() => { setCurrentInvitation(id); router.push(href); router.refresh(); }}>
      {children}
    </button>
  );
}

export function DeleteInvitation({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy}
      className={confirm ? "text-[0.65rem] uppercase tracking-[0.2em] text-red-300" : "text-[0.65rem] uppercase tracking-[0.2em] text-muted hover:text-red-300"}
      aria-label={`Delete ${title}`}
      onBlur={() => setConfirm(false)}
      onClick={async () => {
        if (!confirm) return setConfirm(true);
        setBusy(true);
        await createClient().from("invitations").delete().eq("id", id);
        setBusy(false);
        router.refresh();
      }}>
      {busy ? "Deleting…" : confirm ? "Click again – deletes guests & replies too" : "Delete"}
    </button>
  );
}

/** QR code for an invitation link, with PNG and SVG downloads. */
export function QrCode({ url, name }: { url: string; name: string }) {
  const [png, setPng] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 512, color: { dark: "#0a0a0a", light: "#ffffff" } }).then(setPng).catch(() => setPng(""));
  }, [url]);

  async function downloadSvg() {
    const svg = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0a0a0a", light: "#ffffff" } });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    a.download = `${name}-qr.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!png) return <div className="h-16 w-16 border border-line" aria-hidden="true" />;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="QR code options" className="block border border-line bg-white p-1 hover:border-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={png} alt={`QR code for ${url}`} width={56} height={56} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 flex w-44 flex-col border border-line bg-surface p-1 text-sm">
          <a href={png} download={`${name}-qr.png`} className="px-3 py-2 hover:bg-canvas">Download PNG</a>
          <button type="button" onClick={downloadSvg} className="px-3 py-2 text-left hover:bg-canvas">Download SVG</button>
        </div>
      )}
    </div>
  );
}
