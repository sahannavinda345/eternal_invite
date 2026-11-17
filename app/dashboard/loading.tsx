/** Shown instantly while a dashboard page loads. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2 border-b border-line pb-5">
        <div className="h-2.5 w-24 animate-pulse bg-white/10" />
        <div className="h-7 w-72 max-w-full animate-pulse bg-white/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse" />)}
      </div>
      <div className="card h-64 animate-pulse" />
    </div>
  );
}
