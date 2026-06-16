import type { ExamSession, SortState } from "@/types";

type Comparator = (a: ExamSession, b: ExamSession) => number;

/**
 * Comparators keyed by sort field. Numeric fields compare numerically; the
 * name field compares with locale-aware string collation.
 */
const comparators: Record<SortState["field"], Comparator> = {
  riskScore: (a, b) => a.riskScore - b.riskScore,
  flagsCount: (a, b) => a.flagsCount - b.flagsCount,
  progress: (a, b) => a.progress - b.progress,
  startedAt: (a, b) => a.startedAt - b.startedAt,
  lastEventAt: (a, b) => a.lastEventAt - b.lastEventAt,
  candidateName: (a, b) => a.candidateName.localeCompare(b.candidateName),
};

/**
 * Sort a copy of `sessions` by the given sort state. Sorts a shallow copy so
 * the source array (and Redux state) is never mutated.
 */
export function sortSessions(
  sessions: ExamSession[],
  sort: SortState,
): ExamSession[] {
  const cmp = comparators[sort.field];
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...sessions].sort((a, b) => {
    const result = cmp(a, b);
    // Stable tiebreak on id keeps row order from flickering on ties as events
    // stream in.
    return result !== 0 ? result * dir : a.id.localeCompare(b.id);
  });
}
