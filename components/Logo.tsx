import Image from "next/image";
import Link from "next/link";

/** Eternal Chapter brush-circle mark, optionally with the wordmark beside it. */
export default function Logo({ size = 32, wordmark = true, href = "/" }: { size?: number; wordmark?: boolean; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3" aria-label="Eternal Chapter home">
      <Image src="/logo-white.png" alt="" width={size} height={Math.round(size * 0.925)} priority />
      {wordmark && <span className="font-display text-[0.8rem] uppercase tracking-[0.32em] text-white">Eternal Chapter</span>}
    </Link>
  );
}
