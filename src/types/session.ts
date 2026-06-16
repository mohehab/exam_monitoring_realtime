/**
 * Domain types for a monitored exam session.
 *
 * These describe the *server/cache* shape of data the dashboard observes.
 * UI-only concerns (filters, selection, sort) live in `types/ui.ts`.
 */

/** Lifecycle state of a candidate's exam session. */
export type SessionStatus =
  | "active"
  | "flagged"
  | "paused"
  | "submitted"
  | "disconnected";

/** Derived risk bucket, computed from the numeric risk score. */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Health of the candidate's realtime connection to the proctoring service. */
export type ConnectionQuality = "good" | "unstable" | "lost";

/** A single exam session under observation. */
export interface ExamSession {
  /** Stable unique id (also the entity-adapter key). */
  id: string;
  candidateName: string;
  candidateId: string;
  examName: string;
  region: string;
  status: SessionStatus;
  /** 0–100. Higher means more likely to need proctor intervention. */
  riskScore: number;
  riskLevel: RiskLevel;
  /** Count of suspicious-activity flags raised so far. */
  flagsCount: number;
  /** Exam completion percentage, 0–100. */
  progress: number;
  connectionQuality: ConnectionQuality;
  /** Epoch ms the session started. */
  startedAt: number;
  /** Epoch ms of the most recent event applied to this session. */
  lastEventAt: number;
  /** Number of proctor notes attached. */
  notesCount: number;
  /** Most recent proctor note, if any. */
  lastNote?: string;
}

/** Maps a numeric risk score (0–100) to a coarse risk level. */
export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  return "low";
}
