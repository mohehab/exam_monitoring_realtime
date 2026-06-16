import type {
  ConnectionQuality,
  RiskLevel,
  SessionStatus,
} from "./session";

/** Fields the table can be sorted by. */
export type SortField =
  | "riskScore"
  | "flagsCount"
  | "progress"
  | "startedAt"
  | "lastEventAt"
  | "candidateName";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

/**
 * Operationally useful filters. Empty arrays mean "no filter" (show all) so the
 * default state is the unfiltered view.
 */
export interface FilterState {
  /** Free-text search across name, id, exam, and region. */
  search: string;
  statuses: SessionStatus[];
  riskLevels: RiskLevel[];
  connection: ConnectionQuality[];
  /** When true, only sessions with at least one flag are shown. */
  flaggedOnly: boolean;
}

/** Lifecycle of the client's connection to the realtime source. */
export type ConnectionState =
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed";

export interface ConnectionInfo {
  state: ConnectionState;
  /** Highest event sequence number the client has applied. */
  lastSeq: number;
  /** Epoch ms of the last event received, or null if none yet. */
  lastEventAt: number | null;
  /** How many reconnect attempts have happened this session. */
  reconnectAttempts: number;
  /** Count of stale (out-of-order) events that were dropped. */
  droppedStaleEvents: number;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  statuses: [],
  riskLevels: [],
  connection: [],
  flaggedOnly: false,
};

export const DEFAULT_SORT: SortState = {
  field: "riskScore",
  direction: "desc",
};
