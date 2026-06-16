"use client";

interface ChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  color?: string;
}

/** A single toggleable filter chip; reflects pressed state for a11y. */
export function Chip({ label, active, onToggle, color }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-transparent text-canvas"
          : "border-border bg-surface text-muted hover:text-text"
      }`}
      style={active ? { backgroundColor: color ?? "var(--color-accent)" } : undefined}
    >
      {label}
    </button>
  );
}
