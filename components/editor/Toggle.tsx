"use client";

export default function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition ${on ? "border-white bg-white" : "border-white/30 bg-transparent"}`}>
      <span className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all ${on ? "left-[18px] bg-black" : "left-[2px] bg-white/50"}`} />
    </button>
  );
}
