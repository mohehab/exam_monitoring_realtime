import type {
  ConnectionQuality,
  RiskLevel,
  SessionStatus,
  SortField,
} from "@/types";

export const STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "flagged", label: "Flagged" },
  { value: "paused", label: "Paused" },
  { value: "submitted", label: "Submitted" },
  { value: "disconnected", label: "Disconnected" },
];

export const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const CONNECTION_OPTIONS: { value: ConnectionQuality; label: string }[] =
  [
    { value: "good", label: "Good" },
    { value: "unstable", label: "Unstable" },
    { value: "lost", label: "Lost" },
  ];

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "riskScore", label: "Risk" },
  { value: "flagsCount", label: "Flags" },
  { value: "progress", label: "Progress" },
  { value: "lastEventAt", label: "Last event" },
  { value: "startedAt", label: "Started" },
  { value: "candidateName", label: "Name" },
];
