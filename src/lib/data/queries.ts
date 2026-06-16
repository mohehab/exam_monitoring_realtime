import "server-only";

import { realtimeSource } from "./source";
import type { ExamSession } from "@/types";

export interface InitialSnapshot {
  sessions: ExamSession[];
  /** Sequence number current at snapshot time, so the client can detect gaps. */
  seq: number;
}

/**
 * Read the initial dataset on the server (React Server Component data fetch).
 * Passed down to a thin client initializer that seeds the Redux store, so the
 * first paint already has data without a client round-trip.
 */
export function getInitialSnapshot(): InitialSnapshot {
  return {
    sessions: realtimeSource.getSnapshot(),
    seq: realtimeSource.currentSeq,
  };
}
