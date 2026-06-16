"use client";

/**
 * Global error boundary (Next.js `global-error.tsx`). Catches errors thrown in
 * the root layout itself, where the route-level `error.tsx` can't reach. It
 * must render its own <html>/<body>.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#0b0f14",
          color: "#e6edf3",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#8a98a8", marginTop: 8, fontSize: 14 }}>
            The application failed to load. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              background: "#4c8dff",
              color: "#0b0f14",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
