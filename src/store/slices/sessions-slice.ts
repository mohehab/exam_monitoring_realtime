import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  type ExamEvent,
  type ExamSession,
  riskLevelFromScore,
} from "@/types";

/**
 * SERVER / CACHE STATE.
 *
 * This slice mirrors the authoritative dataset coming from the realtime source.
 * It is normalized with an entity adapter so individual sessions can be updated
 * in O(1) as events stream in, and so 12k records never get re-created
 * wholesale on each update.
 */
export const sessionsAdapter = createEntityAdapter<ExamSession>();

interface SessionsExtra {
  /** True once the initial snapshot has been loaded. */
  hydrated: boolean;
}

const initialState = sessionsAdapter.getInitialState<SessionsExtra>({
  hydrated: false,
});

export type SessionsState = typeof initialState;

/** Mutate one session entity in place from an event payload (Immer draft). */
function applyToDraft(entity: ExamSession, event: ExamEvent): void {
  // Stale guard at the entity level: never let an older event overwrite a
  // newer state for the same session.
  if (event.timestamp < entity.lastEventAt) return;
  const p = event.payload;
  if (p.status) entity.status = p.status;
  if (p.riskScore !== undefined) {
    entity.riskScore = p.riskScore;
    entity.riskLevel = riskLevelFromScore(p.riskScore);
  }
  if (p.flagsCountDelta) entity.flagsCount += p.flagsCountDelta;
  if (p.connectionQuality) entity.connectionQuality = p.connectionQuality;
  if (p.progress !== undefined) entity.progress = p.progress;
  if (p.note) {
    entity.lastNote = p.note;
    entity.notesCount += 1;
  }
  entity.lastEventAt = event.timestamp;
}

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<ExamSession[]>) {
      sessionsAdapter.setAll(state, action.payload);
      state.hydrated = true;
    },
    /**
     * Apply a batch of events at once. Batching is essential under high
     * throughput: one dispatch -> one re-render instead of one per event.
     */
    applyEvents(state, action: PayloadAction<ExamEvent[]>) {
      for (const event of action.payload) {
        const entity = state.entities[event.sessionId];
        if (entity) applyToDraft(entity, event);
      }
    },
  },
});

export const { hydrate, applyEvents } = sessionsSlice.actions;
export default sessionsSlice.reducer;
