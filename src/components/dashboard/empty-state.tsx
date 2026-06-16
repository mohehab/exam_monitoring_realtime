/**
 * Shown when filters/search match no sessions. Directs the proctor to act
 * (relax filters) rather than just stating emptiness.
 */
export function EmptyState() {
  return (
    <div className="grid flex-1 place-items-center p-10 text-center">
      <div className="max-w-xs">
        <p className="text-sm font-medium">No sessions match these filters</p>
        <p className="mt-1 text-sm text-muted">
          Try clearing a filter or broadening your search to see active
          sessions again.
        </p>
      </div>
    </div>
  );
}
