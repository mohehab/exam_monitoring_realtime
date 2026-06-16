"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectRecentEvents } from "@/store/selectors";
import { selectSession } from "@/store/slices/ui-slice";
import { clockTime } from "@/lib/utils/format";
import type { EventSeverity } from "@/types";

const SEVERITY_COLOR: Record<EventSeverity, string> = {
  info: "var(--color-status-paused)",
  warning: "var(--color-status-flagged)",
  critical: "var(--color-risk-critical)",
};

/** Newest-first stream of recent events; click an item to focus its session. */
export function ActivityFeed() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectRecentEvents);

  return (
    <section
      aria-label="Live activity feed"
      className="flex min-h-0 flex-col rounded-[var(--radius-card)] border border-border bg-surface"
    >
      <h2 className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Activity feed
      </h2>
      <ul
        className="min-h-0 flex-1 divide-y divide-border/60 overflow-auto"
        aria-live="off"
      >
        {events.length === 0 ? (
          <li className="p-3 text-sm text-muted">Waiting for events…</li>
        ) : (
          events.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => dispatch(selectSession(e.sessionId))}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface-2"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLOR[e.severity] }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{e.message}</span>
                  <span className="block truncate font-mono text-xs text-muted">
                    {e.sessionId} · {clockTime(e.timestamp)}
                  </span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
