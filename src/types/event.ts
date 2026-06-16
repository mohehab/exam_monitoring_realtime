import type {
  ConnectionQuality,
  RiskLevel,
  SessionStatus,
} from "./session";

/** Kinds of realtime events the managed source can emit. */
export type ExamEventType =
  | "status_change"
  | "suspicious_activity"
  | "connection_drop"
  | "connection_restored"
  | "proctor_note"
  | "risk_update";

/** Visual/priority weight of an event. */
export type EventSeverity = "info" | "warning" | "critical";

/**
 * Partial mutation an event applies to its target session. Only the fields an
 * event actually changes are present, so reducers can shallow-merge safely.
 */
export interface EventPayload {
  status?: SessionStatus;
  riskScore?: number;
  riskLevel?: RiskLevel;
  flagsCountDelta?: number;
  connectionQuality?: ConnectionQuality;
  note?: string;
  progress?: number;
}

/**
 * A single realtime event.
 *
 * `seq` is a globally monotonic sequence number assigned by the source. It is
 * the backbone of stale-event protection: the client only applies events whose
 * `seq` is greater than the last one it has seen, and uses it as the SSE event
 * id so reconnects can resume from the right place.
 */
export interface ExamEvent {
  id: string;
  seq: number;
  sessionId: string;
  type: ExamEventType;
  severity: EventSeverity;
  /** Human-readable, end-user-facing description of what happened. */
  message: string;
  /** Epoch ms when the event occurred. */
  timestamp: number;
  payload: EventPayload;
}

/**
 * First frame the stream sends on (re)connect: tells the client where the
 * sequence currently stands so it can detect gaps.
 */
export interface StreamHello {
  type: "hello";
  seq: number;
  serverTime: number;
}
