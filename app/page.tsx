import Link from "next/link";
import Logo from "@/components/Logo";
import { whatsappLink } from "@/lib/site";

const features = [
  ["Personal links", "Every guest receives their own WhatsApp link that opens with their name."],
  ["Live replies", "See who is coming, head counts and messages the moment guests answer."],
  ["Every celebration", "Wedding, homecoming and more, from one guest list."],
  ["The details that matter", "The nekatha, directions to the venue and add-to-calendar in one tap."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-brand-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-[0.68rem] uppercase tracking-[0.22em] text-white/70 hover:text-white">Couple sign in</Link>
          <a href={whatsappLink()} target="_blank" rel="noopener" className="btn hidden sm:inline-flex">Get your invitation</a>
        </nav>
      </header>

      <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 pb-24 pt-20 text-center sm:pt-28">
        <p className="eyebrow">Your story, beautifully told</p>
        <h1 className="display text-4xl leading-tight sm:text-6xl">Let your eternal chapter begin with an invitation</h1>
        <p className="max-w-md text-sm leading-relaxed text-white/60">
          Your invitation becomes the first page of your story, opened on WhatsApp and answered in one tap.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={whatsappLink()} target="_blank" rel="noopener" className="btn-primary">Get your invitation <span aria-hidden="true">→</span></a>
          <Link href="/login" className="btn">Couple sign in</Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([t, d]) => (
            <div key={t} className="flex flex-col gap-3 bg-canvas p-8">
              <h2 className="text-[0.68rem] uppercase tracking-[0.28em] text-white">{t}</h2>
              <p className="text-sm leading-relaxed text-white/55">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
        <p className="eyebrow">Our philosophy</p>
        <h2 className="display text-3xl sm:text-4xl">Every love story deserves its own chapter</h2>
        <a href={whatsappLink("Hi Eternal Chapter, we'd love to tell you our story and get an invitation.")} target="_blank" rel="noopener" className="btn">Tell us your story <span aria-hidden="true">→</span></a>
      </section>

      <footer className="flex flex-col items-center gap-4 border-t border-line px-4 py-12 text-center">
        <Logo wordmark={false} size={40} />
        <p className="text-[0.62rem] uppercase tracking-[0.32em] text-white/50">© {new Date().getFullYear()} · Eternal Chapter</p>
        <p className="text-[0.62rem] uppercase tracking-[0.32em] text-white/35">Your story, beautifully told</p>
      </footer>
    </main>
  );
}
