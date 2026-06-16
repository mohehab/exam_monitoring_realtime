/** Relative "time ago" label from an epoch-ms timestamp. */
export function timeAgo(ts: number, now = Date.now()): string {
  const sec = Math.max(0, Math.round((now - ts) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

/** Clock time (HH:MM:SS) for an epoch-ms timestamp. */
export function clockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Compact thousands formatting, e.g. 12000 -> "12,000". */
export function compactNumber(n: number): string {
  return n.toLocaleString();
}
