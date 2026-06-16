import type { ExamSession, FilterState } from "@/types";

/**
 * Predicate factory for the current filters. Returns a single function so the
 * 12k-record pass is one tight loop with no per-row array allocations.
 *
 * Search is matched case-insensitively across the operationally useful text
 * fields: candidate name, candidate id, exam name, region, and session id.
 */
export function makeSessionPredicate(
  filters: FilterState,
): (s: ExamSession) => boolean {
  const q = filters.search.trim().toLowerCase();
  const hasStatus = filters.statuses.length > 0;
  const hasRisk = filters.riskLevels.length > 0;
  const hasConn = filters.connection.length > 0;

  return (s: ExamSession): boolean => {
    if (filters.flaggedOnly && s.flagsCount === 0) return false;
    if (hasStatus && !filters.statuses.includes(s.status)) return false;
    if (hasRisk && !filters.riskLevels.includes(s.riskLevel)) return false;
    if (hasConn && !filters.connection.includes(s.connectionQuality)) {
      return false;
    }
    if (q) {
      const haystack =
        `${s.candidateName} ${s.candidateId} ${s.examName} ${s.region} ${s.id}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  };
}
