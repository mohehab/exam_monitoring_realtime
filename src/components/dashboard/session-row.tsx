"use client";

import { memo } from "react";
import type { ExamSession } from "@/types";
import { StatusPill } from "@/components/ui/status-pill";
import { RiskBadge, RISK_VAR } from "@/components/ui/risk-badge";
import { ConnectionDot } from "@/components/ui/connection-dot";
import { timeAgo } from "@/lib/utils/format";

/** Desktop (lg+) 9-column grid. Mobile uses its own condensed card layout. */
export const GRID_TEMPLATE =
  "grid-cols-[3px_minmax(0,2.2fr)_minmax(0,1.3fr)_100px_72px_56px_100px_48px_84px]";

interface SessionRowProps {
  session: ExamSession;
  selected: boolean;
  onSelect: (id: string) => void;
}

function SessionRowBase({ session: s, selected, onSelect }: SessionRowProps) {
  return (
    <button
      type="button"
      role="row"
      aria-selected={selected}
      onClick={() => onSelect(s.id)}
      className={`block h-full w-full border-b border-border/60 text-left text-sm transition-colors ${
        selected ? "bg-accent-weak" : "hover:bg-surface-2"
      }`}
    >
      {/* ---------- Mobile / tablet: condensed card (matches Figma) ---------- */}
      <div
        role="presentation"
        className="grid h-full grid-cols-[3px_minmax(0,1fr)_auto] items-center gap-x-3 pr-3 lg:hidden"
      >
        <span
          className="h-full w-[3px]"
          style={{ backgroundColor: RISK_VAR[s.riskLevel] }}
          aria-hidden="true"
        />
        <span role="cell" className="min-w-0 pl-2">
          <span className="block truncate font-medium">{s.candidateName}</span>
          <span className="block truncate font-mono text-xs text-muted">
            {s.id} · {s.candidateId}
          </span>
        </span>
        <span role="cell" className="flex flex-col items-end gap-1.5">
          <StatusPill status={s.status} />
          <span className="flex items-center gap-2">
            <RiskBadge score={s.riskScore} level={s.riskLevel} />
            <ConnectionDot quality={s.connectionQuality} />
          </span>
        </span>
      </div>

      {/* ---------- Desktop (lg+): full table row ---------- */}
      <div
        role="presentation"
        className={`hidden h-full items-center gap-x-3 pr-3 lg:grid ${GRID_TEMPLATE}`}
      >
        {/* Signature: continuous risk rail — proctors read risk as a left edge */}
        <span
          className="h-full w-[3px]"
          style={{ backgroundColor: RISK_VAR[s.riskLevel] }}
          aria-hidden="true"
        />

        <span className="min-w-0 py-2 pl-2">
          <span className="block truncate font-medium">{s.candidateName}</span>
          <span className="block truncate font-mono text-xs text-muted">
            {s.id} · {s.candidateId}
          </span>
        </span>

        <span className="min-w-0">
          <span className="block truncate">{s.examName}</span>
          <span className="block truncate text-xs text-muted">{s.region}</span>
        </span>

        <span role="cell">
          <StatusPill status={s.status} />
        </span>

        <span role="cell">
          <RiskBadge score={s.riskScore} level={s.riskLevel} />
        </span>

        <span
          role="cell"
          className="flex items-center gap-1 font-mono tabular-nums"
          style={s.flagsCount > 0 ? { color: "var(--color-status-flagged)" } : undefined}
        >
          {s.flagsCount > 0 ? `⚑ ${s.flagsCount}` : "—"}
        </span>

        <span role="cell" className="flex items-center gap-2">
          <span
            className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2"
            aria-hidden="true"
          >
            <span
              className="block h-full bg-accent"
              style={{ width: `${s.progress}%` }}
            />
          </span>
          <span className="font-mono text-xs text-muted tabular-nums">
            {s.progress}%
          </span>
        </span>

        <span role="cell" className="flex">
          <ConnectionDot quality={s.connectionQuality} />
        </span>

        <span
          role="cell"
          className="text-right font-mono text-xs text-muted tabular-nums"
        >
          {timeAgo(s.lastEventAt)}
        </span>
      </div>
    </button>
  );
}

/**
 * Memoized so that when the visible list re-renders, only rows whose session
 * object identity changed actually re-render — critical with 12k rows updating.
 */
export const SessionRow = memo(SessionRowBase);
