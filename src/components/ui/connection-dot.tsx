import type { ConnectionQuality } from "@/types";

const CONN: Record<ConnectionQuality, { color: string; label: string }> = {
  good: { color: "var(--color-status-active)", label: "Good connection" },
  unstable: { color: "var(--color-status-flagged)", label: "Unstable connection" },
  lost: { color: "var(--color-status-disconnected)", label: "Connection lost" },
};

/** Small dot conveying candidate connection health, with an accessible label. */
export function ConnectionDot({ quality }: { quality: ConnectionQuality }) {
  const { color, label } = CONN[quality];
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span
        className={`h-2 w-2 rounded-full ${quality === "unstable" ? "pulse-dot" : ""}`}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
