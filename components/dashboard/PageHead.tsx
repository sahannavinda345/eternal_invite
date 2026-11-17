export default function PageHead({ eyebrow, title, sub, action }: { eyebrow: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display text-2xl sm:text-3xl">{title}</h1>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
