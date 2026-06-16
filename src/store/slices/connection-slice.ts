import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConnectionInfo, ConnectionState } from "@/types";

/**
 * UI STATE (connection health).
 *
 * Reflects the client's link to the realtime source so the UI can surface
 * connecting / reconnecting / stale conditions to the proctor.
 */
const initialState: ConnectionInfo = {
  state: "connecting",
  lastSeq: 0,
  lastEventAt: null,
  reconnectAttempts: 0,
  droppedStaleEvents: 0,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConnectionState(state, action: PayloadAction<ConnectionState>) {
      state.state = action.payload;
    },
    markReconnecting(state) {
      state.state = "reconnecting";
      state.reconnectAttempts += 1;
    },
    recordEventProgress(
      state,
      action: PayloadAction<{ lastSeq: number; lastEventAt: number }>,
    ) {
      state.lastSeq = action.payload.lastSeq;
      state.lastEventAt = action.payload.lastEventAt;
    },
    /** Seed the starting sequence at hydration (no event time yet). */
    hydrateSeq(state, action: PayloadAction<number>) {
      state.lastSeq = action.payload;
    },
    recordDroppedStale(state, action: PayloadAction<number>) {
      state.droppedStaleEvents += action.payload;
    },
  },
});

export const {
  setConnectionState,
  markReconnecting,
  recordEventProgress,
  recordDroppedStale,
  hydrateSeq,
} = connectionSlice.actions;
export default connectionSlice.reducer;
