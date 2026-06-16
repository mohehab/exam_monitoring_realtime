"use client";

import { useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedId, selectVisibleSessions } from "@/store/selectors";
import { selectSession, setSort } from "@/store/slices/ui-slice";
import { GRID_TEMPLATE, SessionRow } from "./session-row";
import { EmptyState } from "./empty-state";
import type { SortField } from "@/types";

const ROW_HEIGHT = 52;

const COLUMNS: { label: string; field?: SortField; lgOnly?: boolean; cls?: string }[] = [
  { label: "", cls: "" }, // risk rail
  { label: "Candidate", field: "candidateName" },
  { label: "Exam", lgOnly: true },
  { label: "Status" },
  { label: "Risk", field: "riskScore" },
  { label: "Flags", field: "flagsCount", lgOnly: true },
  { label: "Progress", field: "progress", lgOnly: true },
  { label: "Conn." },
  { label: "Last event", field: "lastEventAt", lgOnly: true },
];

/**
 * The monitoring table. Renders only the rows currently in view via
 * @tanstack/react-virtual, so 12k records scroll at native speed and live
 * updates never force a full re-render of the list.
 */
export function SessionsTable() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectVisibleSessions);
  const selectedId = useAppSelector(selectSelectedId);
  const sort = useAppSelector((s) => s.ui.sort);
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    getItemKey: (index) => rows[index].id,
  });

  const onSelect = useCallback(
    (id: string) => dispatch(selectSession(id)),
    [dispatch],
  );

  // Keyboard navigation without 12k tab stops: arrow keys move selection and
  // scroll the chosen row into view.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const idx = rows.findIndex((r) => r.id === selectedId);
      const next =
        e.key === "ArrowDown"
          ? Math.min(rows.length - 1, idx + 1)
          : Math.max(0, idx - 1);
      if (next >= 0 && rows[next]) {
        dispatch(selectSession(rows[next].id));
        virtualizer.scrollToIndex(next, { align: "auto" });
      }
    },
    [rows, selectedId, dispatch, virtualizer],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[var(--radius-card)] border border-border bg-surface">
      {/* Header row, aligned to the body grid template */}
      <div
        role="rowgroup"
        className={`grid ${GRID_TEMPLATE} items-center gap-x-3 border-b border-border bg-surface-2 pr-3 text-xs font-medium text-muted`}
      >
        {COLUMNS.map((c, i) => {
          const sortable = !!c.field;
          const active = c.field && sort.field === c.field;
          return (
            <div
              key={i}
              role="columnheader"
              aria-sort={
                active
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : sortable
                    ? "none"
                    : undefined
              }
              className={`${c.lgOnly ? "hidden lg:block" : ""} ${i === 1 ? "pl-2" : ""} py-2`}
            >
              {sortable ? (
                <button
                  type="button"
                  onClick={() => dispatch(setSort(c.field as SortField))}
                  className={`hover:text-text ${active ? "text-accent" : ""}`}
                >
                  {c.label}
                  {active ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
                </button>
              ) : (
                c.label
              )}
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          ref={scrollRef}
          role="grid"
          aria-label="Exam sessions"
          aria-rowcount={rows.length}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="min-h-0 flex-1 overflow-auto focus:outline-none"
        >
          <div
            style={{ height: virtualizer.getTotalSize(), position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((vi) => {
              const session = rows[vi.index];
              return (
                <div
                  key={vi.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: vi.size,
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  <SessionRow
                    session={session}
                    selected={session.id === selectedId}
                    onSelect={onSelect}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
