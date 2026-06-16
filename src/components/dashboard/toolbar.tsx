"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearFilters,
  setFlaggedOnly,
  setLiveUpdatesPaused,
  setSort,
  toggleConnection,
  toggleRiskLevel,
  toggleStatus,
} from "@/store/slices/ui-slice";
import {
  selectFilters,
  selectSort,
  selectTotalSessions,
  selectVisibleCount,
} from "@/store/selectors";
import { compactNumber } from "@/lib/utils/format";
import {
  CONNECTION_OPTIONS,
  RISK_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/utils/options";
import { Chip } from "@/components/ui/chip";
import { SearchInput } from "./search-input";

export function Toolbar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const sort = useAppSelector(selectSort);
  const total = useAppSelector(selectTotalSessions);
  const visible = useAppSelector(selectVisibleCount);
  const paused = useAppSelector((s) => s.ui.liveUpdatesPaused);
  const [open, setOpen] = useState(false);

  const activeCount =
    filters.statuses.length +
    filters.riskLevels.length +
    filters.connection.length +
    (filters.flaggedOnly ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <section
      aria-label="Filters and controls"
      className="rounded-[var(--radius-card)] border border-border bg-surface"
    >
      <div className="flex flex-wrap items-center gap-2 p-3">
        <SearchInput />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="filter-panel"
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:text-text"
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        <button
          type="button"
          onClick={() => dispatch(setLiveUpdatesPaused(!paused))}
          aria-pressed={paused}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            paused
              ? "border-[var(--color-status-flagged)] text-[var(--color-status-flagged)]"
              : "border-border text-muted hover:text-text"
          }`}
        >
          {paused ? "Resume live" : "Pause live"}
        </button>

        <p className="ml-auto text-xs text-muted" aria-live="polite">
          <span className="font-mono tabular-nums text-text">
            {compactNumber(visible)}
          </span>{" "}
          / {compactNumber(total)} shown
        </p>
      </div>

      {open && (
        <div
          id="filter-panel"
          className="space-y-3 border-t border-border p-3"
        >
          <FilterRow label="Status">
            {STATUS_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={filters.statuses.includes(o.value)}
                onToggle={() => dispatch(toggleStatus(o.value))}
              />
            ))}
          </FilterRow>

          <FilterRow label="Risk">
            {RISK_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={filters.riskLevels.includes(o.value)}
                onToggle={() => dispatch(toggleRiskLevel(o.value))}
              />
            ))}
          </FilterRow>

          <FilterRow label="Connection">
            {CONNECTION_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={filters.connection.includes(o.value)}
                onToggle={() => dispatch(toggleConnection(o.value))}
              />
            ))}
            <Chip
              label="Flagged only"
              active={filters.flaggedOnly}
              onToggle={() => dispatch(setFlaggedOnly(!filters.flaggedOnly))}
            />
          </FilterRow>

          <FilterRow label="Sort by">
            {SORT_OPTIONS.map((o) => {
              const active = sort.field === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => dispatch(setSort(o.value))}
                  aria-pressed={active}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    active
                      ? "border-accent bg-accent-weak text-accent"
                      : "border-border bg-surface text-muted hover:text-text"
                  }`}
                >
                  {o.label}
                  {active ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => dispatch(clearFilters())}
              className="ml-auto rounded-full px-2.5 py-1 text-xs text-muted underline-offset-2 hover:text-text hover:underline"
            >
              Clear all
            </button>
          </FilterRow>
        </div>
      )}
    </section>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-medium text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
