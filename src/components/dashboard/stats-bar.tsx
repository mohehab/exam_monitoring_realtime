"use client";

import { useAppSelector } from "@/store/hooks";
import { selectStats } from "@/store/selectors";
import { compactNumber } from "@/lib/utils/format";

interface Tile {
  key: string;
  label: string;
  value: number;
  color?: string;
}

export function StatsBar() {
  const stats = useAppSelector(selectStats);

  const tiles: Tile[] = [
    { key: "total", label: "Sessions", value: stats.total },
    {
      key: "active",
      label: "Active",
      value: stats.active,
      color: "var(--color-status-active)",
    },
    {
      key: "flagged",
      label: "Flagged",
      value: stats.flagged,
      color: "var(--color-status-flagged)",
    },
    {
      key: "critical",
      label: "Critical risk",
      value: stats.critical,
      color: "var(--color-risk-critical)",
    },
    {
      key: "disconnected",
      label: "Disconnected",
      value: stats.disconnected,
      color: "var(--color-status-disconnected)",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => (
        <div
          key={t.key}
          className="rounded-[var(--radius-card)] border border-border bg-surface px-3 py-2.5"
        >
          <dt className="text-xs text-muted">{t.label}</dt>
          <dd
            className="mt-1 font-mono text-xl font-semibold tabular-nums sm:text-2xl"
            style={t.color ? { color: t.color } : undefined}
          >
            {compactNumber(t.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
