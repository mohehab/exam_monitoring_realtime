import type { NextRequest } from "next/server";
import { realtimeSource } from "@/lib/data/source";
import type { StreamHello } from "@/types";

// Long-lived stream — never statically optimized, always runs on the server.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENCODER = new TextEncoder();
/** Average gap between emitted events (ms). Tunable burst load. */
const TICK_MS = 12200;

function sse(data: unknown, id?: number): Uint8Array {
  const idLine = id !== undefined ? `id: ${id}\n` : "";
  return ENCODER.encode(`${idLine}data: ${JSON.stringify(data)}\n\n`);
}

/**
 * GET /api/stream — Server-Sent Events feed of live exam events.
 *
 * SSE is chosen over WebSocket because the dashboard is strictly
 * server -> client (proctors observe; they don't push high-frequency data
 * back). SSE gives automatic browser reconnection and a built-in
 * `Last-Event-ID` replay handshake for free, which is exactly what the
 * stale-event / reconnect requirement needs. See README for the tradeoff.
 */
export async function GET(req: NextRequest) {
  const lastEventId = Number(req.headers.get("last-event-id") ?? 0) || 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: Uint8Array) => {
        if (!closed) controller.enqueue(chunk);
      };

      // 1) Hello frame: tells the client where the sequence currently stands.
      const hello: StreamHello = {
        type: "hello",
        seq: realtimeSource.currentSeq,
        serverTime: Date.now(),
      };
      safeEnqueue(sse(hello));

      // 2) Replay anything the client missed while disconnected.
      if (lastEventId > 0) {
        for (const event of realtimeSource.getEventsAfter(lastEventId)) {
          safeEnqueue(sse(event, event.seq));
        }
      }

      // 3) Live ticks. Jitter keeps it from looking metronomic.
      const interval = setInterval(
        () => {
          const burst = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < burst; i++) {
            const event = realtimeSource.tick();
            safeEnqueue(sse(event, event.seq));
          }
        },
        TICK_MS,
      );

      // Heartbeat comment keeps proxies from closing an idle connection.
      const heartbeat = setInterval(() => {
        safeEnqueue(ENCODER.encode(": ping\n\n"));
      }, 15_000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
