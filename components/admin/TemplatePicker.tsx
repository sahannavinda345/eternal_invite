"use client";
import { DESIGNS } from "@/components/designs";
import { cx } from "@/lib/utils";

/** Choose which templates a plan or couple may use. `null` means every template (including future ones). */
export default function TemplatePicker({ value, onChange, idPrefix }: { value: string[] | null; onChange: (v: string[] | null) => void; idPrefix: string }) {
  const all = value === null;
  const toggle = (id: string) => {
    const cur = value ?? DESIGNS.map((d) => d.id);
    onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm" htmlFor={`${idPrefix}-all`}>
        <input id={`${idPrefix}-all`} type="checkbox" className="h-4 w-4 accent-white" checked={all}
          onChange={(e) => onChange(e.target.checked ? null : DESIGNS.map((d) => d.id))} />
        All templates <span className="text-xs text-muted">(includes templates you add later)</span>
      </label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGNS.map((d) => {
          const on = all || value!.includes(d.id);
          return (
            <label key={d.id} htmlFor={`${idPrefix}-${d.id}`}
              className={cx("flex cursor-pointer items-center gap-2.5 border px-3 py-2 text-sm", on ? "border-white/60 text-white" : "border-line text-muted", all && "cursor-default opacity-70")}>
              <input id={`${idPrefix}-${d.id}`} type="checkbox" className="h-4 w-4 accent-white" checked={on} disabled={all} onChange={() => toggle(d.id)} />
              <span className="h-4 w-4 shrink-0 rounded-full border border-white/30" style={{ background: d.swatch }} />
              <span className="min-w-0 flex-1 truncate">{d.name}</span>
              {d.animated && <span className="text-[0.55rem] uppercase tracking-wider text-muted">Animated</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
