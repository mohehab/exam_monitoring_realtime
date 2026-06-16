"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyEvents } from "@/store/slices/sessions-slice";
import { pushEvents } from "@/store/slices/events-slice";
import {
  markReconnecting,
  recordDroppedStale,
  recordEventProgress,
  setConnectionState,
} from "@/store/slices/connection-slice";
import type { ExamEvent, StreamHello } from "@/types";

/**
 * Subscribes to the SSE realtime source and feeds the store.
 *
 * Performance: incoming events are buffered in a ref and flushed once per
 * animation frame as a single batched dispatch. At hundreds of events/second
 * that means ~60 store updates/second max instead of one per event, which is
 * what keeps the table from going janky under load.
 *
 * Resilience: every event carries a monotonic `seq`. We only apply events with
 * `seq` greater than the last applied one, so duplicate/out-of-order frames
 * after a reconnect can't corrupt the view. EventSource handles reconnection
 * and replays missed events via `Last-Event-ID` on the server side.
 */
export function useRealtime(): void {
  const dispatch = useAppDispatch();
  const paused = useAppSelector((s) => s.ui.liveUpdatesPaused);

  // Refs survive re-renders without re-subscribing.
  const bufferRef = useRef<ExamEvent[]>([]);
  const lastSeqRef = useRef(0);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const source = new EventSource("/api/stream");
    let rafId = 0;
    let stopped = false;

    const flush = () => {
      rafId = requestAnimationFrame(flush);
      if (pausedRef.current) return;
      const batch = bufferRef.current;
      if (batch.length === 0) return;
      bufferRef.current = [];

      // Drop stale / already-applied events by sequence.
      let dropped = 0;
      const fresh: ExamEvent[] = [];
      for (const ev of batch) {
        if (ev.seq <= lastSeqRef.current) {
          dropped += 1;
          continue;
        }
        fresh.push(ev);
      }
      if (dropped > 0) dispatch(recordDroppedStale(dropped));
      if (fresh.length === 0) return;

      lastSeqRef.current = fresh[fresh.length - 1].seq;
      dispatch(applyEvents(fresh));
      dispatch(pushEvents(fresh));
      dispatch(
        recordEventProgress({
          lastSeq: lastSeqRef.current,
          lastEventAt: fresh[fresh.length - 1].timestamp,
        }),
      );
    };

    source.onopen = () => {
      if (!stopped) dispatch(setConnectionState("open"));
    };

    source.onmessage = (e: MessageEvent<string>) => {
      const data = JSON.parse(e.data) as ExamEvent | StreamHello;
      if ("type" in data && data.type === "hello") {
        // A gap between our last seq and the server's means we missed events
        // while away; the server replays them, the seq guard dedupes the rest.
        return;
      }
      bufferRef.current.push(data as ExamEvent);
    };

    source.onerror = () => {
      // EventSource auto-reconnects; reflect the transient state in the UI.
      if (!stopped) dispatch(markReconnecting());
    };

    dispatch(setConnectionState("connecting"));
    rafId = requestAnimationFrame(flush);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      source.close();
      dispatch(setConnectionState("closed"));
    };
  }, [dispatch]);
}
