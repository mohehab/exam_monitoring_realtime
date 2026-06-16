import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  type ConnectionQuality,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  type FilterState,
  type RiskLevel,
  type SessionStatus,
  type SortField,
  type SortState,
} from "@/types";

/**
 * UI STATE.
 *
 * Purely local view concerns: what the proctor has filtered/sorted/selected.
 * Kept strictly separate from the server/cache slices so realtime updates never
 * disturb the proctor's current view configuration.
 */
interface UiState {
  filters: FilterState;
  sort: SortState;
  selectedSessionId: string | null;
  /** Pause applying live updates to the table to inspect a frozen view. */
  liveUpdatesPaused: boolean;
}

const initialState: UiState = {
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  selectedSessionId: null,
  liveUpdatesPaused: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
    toggleStatus(state, action: PayloadAction<SessionStatus>) {
      state.filters.statuses = toggle(state.filters.statuses, action.payload);
    },
    toggleRiskLevel(state, action: PayloadAction<RiskLevel>) {
      state.filters.riskLevels = toggle(
        state.filters.riskLevels,
        action.payload,
      );
    },
    toggleConnection(state, action: PayloadAction<ConnectionQuality>) {
      state.filters.connection = toggle(
        state.filters.connection,
        action.payload,
      );
    },
    setFlaggedOnly(state, action: PayloadAction<boolean>) {
      state.filters.flaggedOnly = action.payload;
    },
    clearFilters(state) {
      state.filters = DEFAULT_FILTERS;
    },
    setSort(state, action: PayloadAction<SortField>) {
      if (state.sort.field === action.payload) {
        state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
      } else {
        state.sort = { field: action.payload, direction: "desc" };
      }
    },
    selectSession(state, action: PayloadAction<string | null>) {
      state.selectedSessionId = action.payload;
    },
    setLiveUpdatesPaused(state, action: PayloadAction<boolean>) {
      state.liveUpdatesPaused = action.payload;
    },
  },
});

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export const {
  setSearch,
  toggleStatus,
  toggleRiskLevel,
  toggleConnection,
  setFlaggedOnly,
  clearFilters,
  setSort,
  selectSession,
  setLiveUpdatesPaused,
} = uiSlice.actions;
export default uiSlice.reducer;
