# Live Exam Monitoring Dashboard

A production-style frontend for remote proctors to monitor active exam sessions
at scale. Built to demonstrate senior-level frontend architecture: clear
server/client boundaries, predictable state management, resilient realtime
handling, and smooth interaction over a large dataset.

> Built with Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, and
> `@tanstack/react-virtual`.

---

## Setup

Requires Node.js 20+ (developed on Node 22).

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

There are no environment variables and no external services — the realtime
source and dataset are self-contained (see "Realtime" below), so the app runs
fully from these instructions.

---

## What it does

- Loads **12,000 exam sessions** (above the 10,000 floor) and renders them in a
  virtualized table that scrolls at native speed.
- Streams **live events** — risk updates, suspicious-activity flags, status
  changes, connection drop/restore, proctor notes — and applies them to the
  view without a refresh.
- Supports **search, filtering, and sorting** on operationally useful fields
  (candidate, status, risk, connection, flags, progress, recency).
- Surfaces **loading, empty, and error states** explicitly.
- Works on **desktop and mobile**, with keyboard access and AA-contrast color.

---

## Architecture

### Server / client boundary

The tree is server-rendered by default; client interactivity is pushed to the
leaves ("islands"):

| Server Components | Client Components (islands) |
| --- | --- |
| `app/page.tsx` (fetches snapshot) | `store-provider`, `realtime-bridge` |
| `dashboard-shell`, `dashboard-header` | `stats-bar`, `toolbar`, `search-input` |
| `empty-state` | `sessions-table`, `session-row`, `session-detail-panel` |
| `loading.tsx`, `not-found.tsx` | `connection-status`, `activity-feed` |

`page.tsx` reads the initial dataset on the server and passes it to a thin
client provider that seeds the Redux store, so the **first paint already has
data** and the realtime stream only ever carries deltas.

### State management (Redux Toolkit)

State is split along a strict **server/cache vs UI** boundary so that live data
updates never disturb the proctor's current view configuration:

- **Server / cache state**
  - `sessions-slice` — the dataset, **normalized** via `createEntityAdapter` so
    a single session updates in O(1) as events arrive.
  - `events-slice` — a bounded (200-item) newest-first log powering the feed.
- **UI state**
  - `ui-slice` — search, filters, sort, selection, live-pause.
  - `connection-slice` — realtime connection health and stale/dropped counters.

Derived data (the filtered + sorted visible rows, and top-line stats) is
computed in **memoized selectors** (`store/selectors.ts`), so the expensive
12k-record pass only re-runs when the dataset, filters, or sort actually change.

### Realtime

The realtime source is a **Server-Sent Events** endpoint at `/api/stream`
(`app/api/stream/route.ts`), backed by an in-memory singleton
(`lib/data/source.ts`) that plays the role a managed service (Pusher/Firebase)
would in production: it owns the canonical dataset, assigns a globally
**monotonic `seq`** to every event, and keeps a 500-event ring buffer.

The client hook (`lib/realtime/use-realtime.ts`) connects with `EventSource`
and:

- **Batches** incoming events and flushes them to the store **once per animation
  frame** — at hundreds of events/sec this caps store updates at ~60/sec instead
  of one-per-event, which is what keeps the table from going janky.
- **Guards against stale events** by sequence: an event is applied only if its
  `seq` exceeds the last applied one. There's a second guard at the entity level
  (an older `timestamp` never overwrites a newer one for the same session).
- **Recovers from disconnects** automatically. `EventSource` reconnects and
  sends `Last-Event-ID`; the server replays buffered events after that id, and
  the seq guard dedupes anything already seen. The UI reflects
  connecting / live / reconnecting / stalled states.

### Large-data rendering

- `@tanstack/react-virtual` renders only the rows in view (+overscan), so DOM
  size is constant regardless of dataset size.
- Rows are `React.memo`'d and keyed by stable session id, so re-renders touch
  only changed rows.
- Search input is **debounced** (200ms) to avoid filtering 12k records on every
  keystroke.
- Sorting uses a stable tiebreak on id so rows don't flicker position on ties as
  live updates arrive.

### Error & loading states

- `app/error.tsx` — route-level error boundary with a retry that re-runs the
  segment.
- `app/global-error.tsx` — catches failures in the root layout itself.
- `app/loading.tsx` — skeleton mirroring the dashboard frame.
- `empty-state.tsx` — actionable empty view when filters match nothing.

---

## Project structure

```
src/
├─ app/
│  ├─ api/stream/route.ts      # SSE realtime source
│  ├─ page.tsx                 # server: fetch snapshot + hydrate
│  ├─ layout.tsx  error.tsx  global-error.tsx  loading.tsx  not-found.tsx
│  └─ globals.css              # design tokens (Tailwind v4 @theme)
├─ components/
│  ├─ dashboard/               # feature components (each < 300 lines)
│  ├─ providers/store-provider.tsx
│  └─ ui/                      # small presentational primitives
├─ lib/
│  ├─ data/                    # generate.ts, source.ts, queries.ts (server)
│  ├─ realtime/use-realtime.ts # client subscription hook
│  └─ utils/                   # filtering, sorting, format, options
├─ store/                      # store, hooks, selectors, slices/
└─ types/                      # session.ts, event.ts, ui.ts (separated by domain)
```

---

## Key decisions and tradeoffs

**SSE over WebSocket.** The dashboard is strictly server -> client (proctors
observe; they don't push high-frequency data back). SSE fits that shape and
gives automatic reconnection plus the `Last-Event-ID` replay handshake for
free — exactly what the stale-event/reconnect requirement needs. WebSocket would
be the choice if proctors needed low-latency bidirectional actions; it would
also require a custom server, since App Router route handlers don't natively
upgrade connections.

**Self-contained realtime source.** Rather than wiring a third-party service,
the SSE endpoint *is* the managed source. This keeps the app runnable from the
README with zero setup while still exercising real reconnect/replay/stale-event
logic. Swapping in Pusher/Firebase later means replacing only
`use-realtime.ts` + the route — the store and components don't change.

**Server-fetch + hydrate for the initial 12k.** The server component serializes
the full dataset into the initial payload (~4 MB) so the table is interactive on
first paint with no client round-trip. The tradeoff is a large initial payload.
At true production scale you'd instead fetch a windowed/paginated slice from an
API and load more on demand, or keep the dataset server-side and stream only
viewport-relevant rows. The component/store design already supports that change
without restructuring.

**Batched, frame-aligned updates.** Applying every event immediately would
thrash React under load. Frame-batching trades a few milliseconds of latency for
a stable 60fps table — the right call for a "no visible jank" requirement.

**Dark, dense theme.** A deliberate choice for long monitoring shifts: status
color carries the information, and a dark canvas keeps it legible without eye
strain. All text/background pairs meet WCAG AA.

---

## Accessibility

- Semantic roles on the virtualized grid (`grid` / `row` / `columnheader`),
  `aria-sort` on sortable headers, `aria-pressed` on toggles.
- Full keyboard path: tab to controls, arrow-key row navigation that scrolls the
  selected row into view, Escape to close the detail dialog.
- Visible focus rings everywhere (never removed, only restyled).
- `prefers-reduced-motion` respected globally.
- Live region on the connection status; non-essential feed updates are not
  announced to avoid screen-reader spam.

---

## Performance notes (measurable constraints)

- **Records:** 12,000 sessions held in normalized store.
- **DOM rows:** ~visible + 12 overscan (constant), not 12,000.
- **Store updates under load:** capped at ~60/sec via rAF batching.
- **Filter/sort pass:** single tight loop, memoized; only re-runs on
  dataset/filter/sort change.
- **Search:** debounced 200ms.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Lint |
