"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectConnection } from "@/store/selectors";
import { clockTime, timeAgo } from "@/lib/utils/format";
import type { ConnectionState } from "@/types";

const STATE_META: Record<
  ConnectionState,
  { label: string; color: string; pulse: boolean }
> = {
  connecting: { label: "Connecting", color: "var(--color-status-flagged)", pulse: true },
  open: { label: "Live", color: "var(--color-status-active)", pulse: true },
  reconnecting: {
    label: "Reconnecting",
    color: "var(--color-status-flagged)",
    pulse: true,
  },
  closed: { label: "Disconnected", color: "var(--color-status-disconnected)", pulse: false },
};

export function ConnectionStatus() {
  const conn = useAppSelector(selectConnection);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const meta = STATE_META[conn.state];
  const stale =
    conn.lastEventAt !== null && now - conn.lastEventAt > 5000 && conn.state === "open";

  return (
    <div className="flex items-center gap-4 text-xs">
      <div
        className="hidden font-mono tabular-nums text-muted sm:block"
        aria-label="Current time"
      >
        {clockTime(now)}
      </div>
      <div
        className="flex items-center gap-2"
        role="status"
        aria-live="polite"
        aria-label={`Realtime connection: ${meta.label}`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${meta.pulse ? "pulse-dot" : ""}`}
          style={{ backgroundColor: meta.color }}
          aria-hidden="true"
        />
        <span className="font-medium">{stale ? "Stalled" : meta.label}</span>
      </div>
      {conn.lastEventAt !== null && (
        <span className="hidden text-muted md:inline">
          last event {timeAgo(conn.lastEventAt, now)}
        </span>
      )}
    </div>
  );
}
