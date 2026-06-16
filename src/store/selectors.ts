import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { sessionsAdapter } from "./slices/sessions-slice";
import { makeSessionPredicate } from "@/lib/utils/filtering";
import { sortSessions } from "@/lib/utils/sorting";
import type { ExamSession, SessionStatus } from "@/types";

const adapterSelectors = sessionsAdapter.getSelectors(
  (state: RootState) => state.sessions,
);

export const selectAllSessions = adapterSelectors.selectAll;
export const selectSessionById = adapterSelectors.selectById;
export const selectTotalSessions = adapterSelectors.selectTotal;
export const selectHydrated = (state: RootState) => state.sessions.hydrated;

export const selectFilters = (state: RootState) => state.ui.filters;
export const selectSort = (state: RootState) => state.ui.sort;
export const selectSelectedId = (state: RootState) =>
  state.ui.selectedSessionId;
export const selectConnection = (state: RootState) => state.connection;
export const selectRecentEvents = (state: RootState) => state.events.recent;

/**
 * The visible rows: full dataset -> filter -> sort. Memoized on its inputs so
 * the expensive pass only re-runs when the dataset, filters, or sort change —
 * not on unrelated UI state changes.
 */
export const selectVisibleSessions = createSelector(
  [selectAllSessions, selectFilters, selectSort],
  (sessions, filters, sort): ExamSession[] => {
    const predicate = makeSessionPredicate(filters);
    const filtered = sessions.filter(predicate);
    return sortSessions(filtered, sort);
  },
);

export const selectVisibleCount = createSelector(
  [selectVisibleSessions],
  (rows) => rows.length,
);

export interface DashboardStats {
  total: number;
  active: number;
  flagged: number;
  disconnected: number;
  critical: number;
}

const EMPTY_COUNTS: Record<SessionStatus, number> = {
  active: 0,
  flagged: 0,
  paused: 0,
  submitted: 0,
  disconnected: 0,
};

/** Top-line counts across the whole dataset (not just the filtered view). */
export const selectStats = createSelector(
  [selectAllSessions],
  (sessions): DashboardStats => {
    const counts = { ...EMPTY_COUNTS };
    let critical = 0;
    for (const s of sessions) {
      counts[s.status] += 1;
      if (s.riskLevel === "critical") critical += 1;
    }
    return {
      total: sessions.length,
      active: counts.active,
      flagged: counts.flagged,
      disconnected: counts.disconnected,
      critical,
    };
  },
);

export const selectSelectedSession = createSelector(
  [selectAllSessions, selectSelectedId],
  (sessions, id) => sessions.find((s) => s.id === id) ?? null,
);
