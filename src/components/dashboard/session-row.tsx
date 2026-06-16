"use client";

import { memo } from "react";
import type { ExamSession } from "@/types";
import { StatusPill } from "@/components/ui/status-pill";
import { RiskBadge, RISK_VAR } from "@/components/ui/risk-badge";
import { ConnectionDot } from "@/components/ui/connection-dot";
import { timeAgo } from "@/lib/utils/format";

export const GRID_TEMPLATE =
  "grid-cols-[3px_minmax(0,2fr)_1fr_84px_92px_56px] lg:grid-cols-[3px_minmax(0,2.4fr)_minmax(0,1.4fr)_96px_104px_104px_64px_120px_92px]";

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
      className={`grid ${GRID_TEMPLATE} h-full w-full items-center gap-x-3 border-b border-border/60 pr-3 text-left text-sm transition-colors ${
        selected ? "bg-accent-weak" : "hover:bg-surface-2"
      }`}
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

      <span className="hidden min-w-0 lg:block">
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
        className="hidden font-mono tabular-nums lg:flex lg:items-center lg:gap-1"
        style={s.flagsCount > 0 ? { color: "var(--color-status-flagged)" } : undefined}
      >
        {s.flagsCount > 0 ? `⚑ ${s.flagsCount}` : "—"}
      </span>

      <span role="cell" className="hidden items-center gap-2 lg:flex">
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

      <span role="cell" className="flex justify-center lg:justify-start">
        <ConnectionDot quality={s.connectionQuality} />
      </span>

      <span
        role="cell"
        className="hidden text-right font-mono text-xs text-muted tabular-nums lg:block"
      >
        {timeAgo(s.lastEventAt)}
      </span>
    </button>
  );
}

/**
 * Memoized so that when the visible list re-renders, only rows whose session
 * object identity changed actually re-render — critical with 12k rows updating.
 */
export const SessionRow = memo(SessionRowBase);
