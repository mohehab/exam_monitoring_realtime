"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary (Next.js `error.tsx`). Catches render/runtime
 * errors in the dashboard subtree and offers recovery without a full reload.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you'd report to your observability sink.
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-6 text-text">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-risk-critical)]">
          Dashboard error
        </p>
        <h1 className="mt-2 text-lg font-semibold">
          The monitoring view stopped unexpectedly
        </h1>
        <p className="mt-2 text-sm text-muted">
          The session data couldn&apos;t be displayed. Retry to reconnect to the
          realtime source and reload the dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted">
            Reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas hover:opacity-90"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
