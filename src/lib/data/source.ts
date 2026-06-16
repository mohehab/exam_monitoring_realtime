import "server-only";

import {
  type EventPayload,
  type ExamEvent,
  type ExamEventType,
  type ExamSession,
  type SessionStatus,
  riskLevelFromScore,
} from "@/types";
import { generateSessions } from "./generate";

/**
 * The managed realtime source, server-side.
 *
 * In a production system this would be Pusher/Firebase/a Kafka consumer. Here a
 * single in-memory instance plays that role: it owns the canonical dataset,
 * assigns a globally monotonic `seq` to every event, and keeps a bounded ring
 * buffer of recent events so a reconnecting client can replay what it missed
 * (the SSE `Last-Event-ID` mechanism).
 *
 * It is a module-level singleton, cached across hot reloads via `globalThis`.
 */
const REPLAY_BUFFER_SIZE = 500;

class RealtimeSource {
  private sessions: ExamSession[];
  private byId: Map<string, ExamSession>;
  private seq = 0;
  private buffer: ExamEvent[] = [];

  constructor() {
    this.sessions = generateSessions();
    this.byId = new Map(this.sessions.map((s) => [s.id, s]));
  }

  /** Snapshot of the full dataset for initial hydration. */
  getSnapshot(): ExamSession[] {
    return this.sessions;
  }

  get currentSeq(): number {
    return this.seq;
  }

  /** Events with seq strictly greater than `afterSeq`, for reconnect replay. */
  getEventsAfter(afterSeq: number): ExamEvent[] {
    if (afterSeq >= this.seq) return [];
    return this.buffer.filter((e) => e.seq > afterSeq);
  }

  /** Produce the next event, apply it to the dataset, and buffer it. */
  tick(): ExamEvent {
    const event = this.buildEvent();
    this.apply(event);
    this.buffer.push(event);
    if (this.buffer.length > REPLAY_BUFFER_SIZE) this.buffer.shift();
    return event;
  }

  private apply(event: ExamEvent): void {
    const session = this.byId.get(event.sessionId);
    if (!session) return;
    const p = event.payload;
    if (p.status) session.status = p.status;
    if (p.riskScore !== undefined) {
      session.riskScore = p.riskScore;
      session.riskLevel = riskLevelFromScore(p.riskScore);
    }
    if (p.flagsCountDelta) session.flagsCount += p.flagsCountDelta;
    if (p.connectionQuality) session.connectionQuality = p.connectionQuality;
    if (p.progress !== undefined) session.progress = p.progress;
    if (p.note) {
      session.lastNote = p.note;
      session.notesCount += 1;
    }
    session.lastEventAt = event.timestamp;
  }

  private buildEvent(): ExamEvent {
    const session =
      this.sessions[Math.floor(Math.random() * this.sessions.length)];
    const type = this.rollType();
    this.seq += 1;
    const timestamp = Date.now();
    const { message, severity, payload } = describe(type, session);
    return {
      id: `E-${this.seq}`,
      seq: this.seq,
      sessionId: session.id,
      type,
      severity,
      message,
      timestamp,
      payload,
    };
  }

  private rollType(): ExamEventType {
    const r = Math.random();
    if (r < 0.34) return "risk_update";
    if (r < 0.55) return "suspicious_activity";
    if (r < 0.7) return "status_change";
    if (r < 0.82) return "connection_drop";
    if (r < 0.93) return "connection_restored";
    return "proctor_note";
  }
}

const NOTES = [
  "Candidate looked off-screen repeatedly.",
  "Verified ID, cleared earlier flag.",
  "Second face briefly detected in frame.",
  "Asked candidate to adjust camera angle.",
  "Background noise consistent with another person.",
];

function describe(
  type: ExamEventType,
  session: ExamSession,
): { message: string; severity: ExamEvent["severity"]; payload: EventPayload } {
  switch (type) {
    case "risk_update": {
      const delta = Math.round((Math.random() - 0.45) * 24);
      const riskScore = Math.max(0, Math.min(100, session.riskScore + delta));
      return {
        message: `Risk score updated to ${riskScore}`,
        severity: riskScore >= 80 ? "critical" : riskScore >= 55 ? "warning" : "info",
        payload: { riskScore },
      };
    }
    case "suspicious_activity":
      return {
        message: "Suspicious activity flag raised",
        severity: "warning",
        payload: {
          flagsCountDelta: 1,
          riskScore: Math.min(100, session.riskScore + 8),
        },
      };
    case "status_change": {
      const next: SessionStatus =
        session.status === "active" ? "flagged" : "active";
      return {
        message: `Status changed to ${next}`,
        severity: next === "flagged" ? "warning" : "info",
        payload: { status: next },
      };
    }
    case "connection_drop":
      return {
        message: "Candidate connection dropped",
        severity: "warning",
        payload: { connectionQuality: "lost", status: "disconnected" },
      };
    case "connection_restored":
      return {
        message: "Candidate connection restored",
        severity: "info",
        payload: { connectionQuality: "good", status: "active" },
      };
    case "proctor_note":
      return {
        message: "Proctor note added",
        severity: "info",
        payload: { note: NOTES[Math.floor(Math.random() * NOTES.length)] },
      };
  }
}

// Persist across dev hot reloads.
const globalForSource = globalThis as unknown as {
  __realtimeSource?: RealtimeSource;
};

export const realtimeSource: RealtimeSource =
  globalForSource.__realtimeSource ??
  (globalForSource.__realtimeSource = new RealtimeSource());
