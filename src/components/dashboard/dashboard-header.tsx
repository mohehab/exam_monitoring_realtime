import { ConnectionStatus } from "./connection-status";

/**
 * Static dashboard header (Server Component). The only dynamic piece — the
 * live connection indicator and clock — is isolated in a small client island.
 */
export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          className="grid h-8 w-8 place-items-center rounded-md bg-accent-weak text-accent"
          aria-hidden="true"
        >
          {/* simple radar glyph */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 12 19 8" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </span>
        <div>
          <h1 className="text-sm font-semibold leading-tight sm:text-base">
            Live Exam Monitoring
          </h1>
          <p className="text-xs text-muted">Proctor operations console</p>
        </div>
      </div>
      <ConnectionStatus />
    </header>
  );
}
