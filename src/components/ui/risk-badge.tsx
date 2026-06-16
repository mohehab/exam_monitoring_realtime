import type { RiskLevel } from "@/types";

export const RISK_VAR: Record<RiskLevel, string> = {
  low: "var(--color-risk-low)",
  medium: "var(--color-risk-medium)",
  high: "var(--color-risk-high)",
  critical: "var(--color-risk-critical)",
};

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
  critical: "Crit",
};

/** Numeric risk score with a color tied to its level. */
export function RiskBadge({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums"
      style={{ color: RISK_VAR[level] }}
    >
      <span className="font-semibold">{score}</span>
      <span className="text-[10px] uppercase tracking-wide opacity-70">
        {RISK_LABEL[level]}
      </span>
    </span>
  );
}
