"use client";

import { useRealtime } from "@/lib/realtime/use-realtime";

/**
 * Headless mount point for the realtime subscription. Kept as its own island so
 * the rest of the tree doesn't re-render when the hook sets up or tears down.
 */
export function RealtimeBridge() {
  useRealtime();
  return null;
}
