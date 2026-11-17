import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <Logo wordmark={false} size={48} />
        <p className="eyebrow">Page not found</p>
        <h1 className="display text-3xl">This chapter doesn&apos;t exist</h1>
        <p className="max-w-sm text-sm text-white/60">Please check the link the couple sent you on WhatsApp.</p>
        <Link href="/" className="btn">Go to Eternal Chapter</Link>
      </div>
    </main>
  );
}
