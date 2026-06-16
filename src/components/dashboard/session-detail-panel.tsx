"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedSession } from "@/store/selectors";
import { selectSession } from "@/store/slices/ui-slice";
import { StatusPill } from "@/components/ui/status-pill";
import { RiskBadge } from "@/components/ui/risk-badge";
import { ConnectionDot } from "@/components/ui/connection-dot";
import { clockTime, timeAgo } from "@/lib/utils/format";

/**
 * Slide-over detail for the selected session. On desktop it docks to the right;
 * on mobile it becomes a full-height sheet. Closes on Escape and returns focus
 * handling to the dialog while open.
 */
export function SessionDetailPanel() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectSelectedSession);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!session) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(selectSession(null));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, dispatch]);

  if (!session) return null;

  const rows: [string, React.ReactNode][] = [
    ["Candidate", session.candidateName],
    ["Candidate ID", <Mono key="cid">{session.candidateId}</Mono>],
    ["Session ID", <Mono key="sid">{session.id}</Mono>],
    ["Exam", session.examName],
    ["Region", session.region],
    ["Status", <StatusPill key="st" status={session.status} />],
    ["Risk", <RiskBadge key="rk" score={session.riskScore} level={session.riskLevel} />],
    ["Flags", <Mono key="fl">{session.flagsCount}</Mono>],
    ["Progress", <Mono key="pr">{session.progress}%</Mono>],
    [
      "Connection",
      <span key="cn" className="flex items-center gap-2">
        <ConnectionDot quality={session.connectionQuality} />
        <span className="capitalize">{session.connectionQuality}</span>
      </span>,
    ],
    ["Started", <Mono key="sa">{clockTime(session.startedAt)}</Mono>],
    ["Last event", timeAgo(session.lastEventAt)],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Session detail for ${session.candidateName}`}
      className="fixed inset-0 z-30 lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96"
    >
      {/* Backdrop (mobile + desktop overlay) */}
      <button
        type="button"
        aria-label="Close detail"
        onClick={() => dispatch(selectSession(null))}
        className="absolute inset-0 bg-canvas/70 lg:bg-canvas/40"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl lg:w-96">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Session detail</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => dispatch(selectSession(null))}
            className="rounded-md px-2 py-1 text-sm text-muted hover:text-text"
          >
            Close
          </button>
        </div>
        <dl className="flex-1 overflow-auto px-4 py-3 text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-border/50 py-2"
            >
              <dt className="text-muted">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
          {session.lastNote && (
            <div className="mt-3 rounded-md border border-border bg-surface-2 p-3">
              <p className="text-xs text-muted">Latest proctor note</p>
              <p className="mt-1">{session.lastNote}</p>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono tabular-nums">{children}</span>;
}
