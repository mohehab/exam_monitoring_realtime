/**
 * Route-level loading UI (Next.js `loading.tsx`). Shown while the server
 * component prepares the initial snapshot. A calm skeleton that mirrors the
 * dashboard frame rather than a spinner.
 */
export default function DashboardLoading() {
  return (
    <div className="flex h-screen flex-col bg-canvas text-text">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 animate-pulse rounded-md bg-surface-2" />
          <div className="space-y-1.5">
            <span className="block h-3 w-40 animate-pulse rounded bg-surface-2" />
            <span className="block h-2.5 w-28 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-surface-2" />
          Connecting…
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface"
            />
          ))}
        </div>
        <div className="h-12 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface" />
        <div className="min-h-0 flex-1 animate-pulse rounded-[var(--radius-card)] border border-border bg-surface" />
      </main>
    </div>
  );
}
