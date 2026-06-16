"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { type AppStore, makeStore } from "@/store/store";
import { hydrate } from "@/store/slices/sessions-slice";
import { hydrateSeq } from "@/store/slices/connection-slice";
import type { ExamSession } from "@/types";

interface StoreProviderProps {
  children: ReactNode;
  /** Snapshot fetched in a Server Component and passed down for hydration. */
  initialSessions: ExamSession[];
  initialSeq: number;
}

/**
 * Creates the Redux store exactly once per mount via a lazy `useState`
 * initializer (React's blessed pattern for per-instance values) and seeds it
 * with the server snapshot before first render, so the dashboard paints with
 * data immediately and the realtime stream only carries deltas thereafter.
 */
export function StoreProvider({
  children,
  initialSessions,
  initialSeq,
}: StoreProviderProps) {
  const [store] = useState<AppStore>(() => {
    const s = makeStore();
    s.dispatch(hydrate(initialSessions));
    s.dispatch(hydrateSeq(initialSeq));
    return s;
  });

  return <Provider store={store}>{children}</Provider>;
}
