import type { SessionStatus } from "@/types";

const LABELS: Record<SessionStatus, string> = {
  active: "Active",
  flagged: "Flagged",
  paused: "Paused",
  submitted: "Submitted",
  disconnected: "Disconnected",
};

const COLORS: Record<SessionStatus, string> = {
  active: "text-[var(--color-status-active)] bg-[var(--color-status-active)]/12",
  flagged:
    "text-[var(--color-status-flagged)] bg-[var(--color-status-flagged)]/12",
  paused: "text-[var(--color-status-paused)] bg-[var(--color-status-paused)]/12",
  submitted:
    "text-[var(--color-status-submitted)] bg-[var(--color-status-submitted)]/12",
  disconnected:
    "text-[var(--color-status-disconnected)] bg-[var(--color-status-disconnected)]/12",
};

/** Compact, color-coded session status label. */
export function StatusPill({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
