import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExamEvent } from "@/types";

/**
 * SERVER / CACHE STATE (derived stream).
 *
 * A bounded, newest-first log of recent events powering the live activity feed.
 * Capped so memory stays flat no matter how long the dashboard runs.
 */
const MAX_FEED = 200;

interface EventsState {
  recent: ExamEvent[];
}

const initialState: EventsState = { recent: [] };

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    pushEvents(state, action: PayloadAction<ExamEvent[]>) {
      // Newest first; incoming batch is already in ascending seq order.
      state.recent.unshift(...[...action.payload].reverse());
      if (state.recent.length > MAX_FEED) {
        state.recent.length = MAX_FEED;
      }
    },
  },
});

export const { pushEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
