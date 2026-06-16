# Design System & Process — Live Exam Monitoring

This document is the design handoff for the dashboard. It captures the design
direction, tokens, component system, wireframes, and the reasoning behind the
information hierarchy and responsive behavior. It is structured so it maps
directly onto Figma styles/variables and components — see "Rebuilding in Figma"
at the end.

> The built application is the high-fidelity "final screen". Run it
> (`npm run dev`) and capture desktop (≥1280px) and mobile (375px) frames for
> the final-screens section of a Figma file.

---

## 1. Design intent

**Subject:** a proctor operations console — a control room for watching
thousands of live exam sessions and finding the few that need intervention.

**The single job of the screen:** let a proctor scan a very large list and
locate at-risk sessions in seconds, while live events keep changing underneath
them.

**Direction:** "mission control." Calm, dark, dense, and quiet — color is spent
almost entirely on *status meaning*, not decoration. The interface should
recede so the data stands out.

**Signature element:** the **risk rail** — a 3px vertical color bar on the left
edge of every row, colored by risk level. A proctor reads risk as a continuous
edge down the table instead of parsing a number in each row. It is the one bold
device; everything else stays restrained.

---

## 2. Tokens

### Color

| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#0B0F14` | App background |
| `surface` | `#131922` | Cards, header, panels |
| `surface-2` | `#1B232E` | Header rows, insets, progress track |
| `border` | `#283341` | Hairline separators |
| `text` | `#E6EDF3` | Primary text (AA on canvas) |
| `muted` | `#8A98A8` | Secondary text, labels |
| `accent` | `#4C8DFF` | Interactive / selection / progress |
| `accent-weak` | `#1D2C45` | Selected row, accent surfaces |

**Status (semantic)**

| Token | Hex | Meaning |
| --- | --- | --- |
| `status-active` | `#2DBD8B` | Session in progress |
| `status-flagged` | `#F5A524` | Needs attention |
| `status-paused` | `#8A98A8` | Temporarily halted |
| `status-submitted` | `#6E7FE0` | Completed |
| `status-disconnected` | `#E0566E` | Candidate offline |

**Risk scale** (used by the risk rail and risk badge)

| Token | Hex | Band |
| --- | --- | --- |
| `risk-low` | `#2DBD8B` | 0–29 |
| `risk-medium` | `#F5A524` | 30–54 |
| `risk-high` | `#FF8C42` | 55–79 |
| `risk-critical` | `#FF5C5C` | 80–100 |

### Typography

- **UI / body:** system sans (`system-ui`) — neutral, fast, no webfont payload.
- **Data / numerics / IDs:** monospace with `tabular-nums` so columns of
  numbers align and don't shift width as values change live.

| Role | Size / weight |
| --- | --- |
| H1 (app title) | 16px / 600 |
| Section label | 12px / 600, uppercase, tracked |
| Body / cell | 14px / 400–500 |
| Meta / sub | 12px / 400, `muted` |
| Stat value | 20–24px / 600, mono |

### Spacing, radius, motion

- Spacing scale: 2 / 4 / 8 / 12 / 16px (Tailwind 0.5–4).
- Card radius: `10px` (`--radius-card`); pills: full.
- Row height: **52px** (fixed — drives virtualization math).
- Motion: 0.6s row-flash and a slow status pulse, both disabled under
  `prefers-reduced-motion`.

---

## 3. Information hierarchy

Ordered by how fast a proctor needs each signal under pressure:

1. **Risk** — the rail (peripheral, always visible) + the risk badge.
2. **Status** — colored pill.
3. **Identity** — candidate name (primary) with id/exam (secondary, muted).
4. **Supporting** — flags, progress, connection, recency.

Top-of-screen **stat tiles** give the room-level picture (total / active /
flagged / critical / disconnected) before the proctor drops into the list.
The **activity feed** is the chronological "what just happened" view, secondary
to the table.

---

## 4. Component system (variants)

| Component | Variants / states | Notes |
| --- | --- | --- |
| `StatusPill` | active, flagged, paused, submitted, disconnected | tinted bg + colored text |
| `RiskBadge` | low, medium, high, critical | score + band label, colored |
| `ConnectionDot` | good, unstable (pulsing), lost | dot + screen-reader label |
| `Chip` | default / active; optional color | filter toggles, `aria-pressed` |
| `SessionRow` | default, hover, selected | risk rail + responsive columns |
| `StatTile` | neutral / colored value | label + mono value |
| `ConnectionStatus` | connecting, live, reconnecting, stalled, closed | live region |
| Buttons | primary (accent), ghost (bordered), pressed | — |

These are real, reusable React components in `src/components/ui` and
`src/components/dashboard`, each driven by the tokens above — so the coded
component library and the design system are the same thing.

---

## 5. Wireframes

### Desktop (≥1024px)

```
┌───────────────────────────────────────────────────────────────────┐
│ ◉ Live Exam Monitoring                    12:04:51  ● Live  · 2s ago│  header
├───────────────────────────────────────────────────────────────────┤
│ ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐                 │
│ │Sessions││Active  ││Flagged ││Critical││Discon. │   stat tiles     │
│ │12,000  ││ 7,431  ││ 1,680  ││  642   ││  712   │                 │
│ └────────┘└────────┘└────────┘└────────┘└────────┘                 │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ [search…]  [Filters(2)] [Pause live]        1,204 / 12,000 shown│ │ toolbar
│ └───────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ ┌───────────────┐ │
│ │▌Candidate    Exam     Status Risk Flags …    │ │ ACTIVITY FEED │ │
│ │▌Aisha Khan   Calc II  Active  72H  ⚑3  ▓▓░ 58│ │ ● flag raised │ │
│ │▌Liam Smith   Net Sec  Flagged 88C  ⚑5  ▓░░ 22│ │ ● risk → 88   │ │
│ │▌… (virtualized rows)                         │ │ ● connection… │ │
│ └─────────────────────────────────────────────┘ └───────────────┘ │
└───────────────────────────────────────────────────────────────────┘
   ▌ = risk rail (color = risk level)   detail panel docks right on select
```

### Mobile (375px)

```
┌─────────────────────────────┐
│ ◉ Live Exam Mon.   ● Live    │ header (clock hidden)
├─────────────────────────────┤
│ ┌─────┐┌─────┐┌─────┐        │ stats: 2–3 per row, wraps
│ │Sess.││Activ││Flag │  …     │
│ └─────┘└─────┘└─────┘        │
│ [search…]      [Filters][⏸]  │ toolbar wraps
│ 1,204 / 12,000 shown         │
│ ┌─────────────────────────┐  │
│ │▌Aisha Khan      Active   │  │ condensed rows:
│ │▌S-26PB·C200001  72H  ●   │  │ name+status / id+risk+conn
│ │▌Liam Smith      Flagged  │  │
│ │▌S-27QY·C200002  88C  ●   │  │
│ └─────────────────────────┘  │
└─────────────────────────────┘
   tap row → full-screen detail sheet
```

---

## 6. Responsive behavior & interaction priorities

**Principle:** no critical interaction is desktop-only. Monitoring the list,
searching, filtering, sorting, selecting a session, and reading its detail all
work at 375px.

| Element | Desktop | Mobile | Why |
| --- | --- | --- | --- |
| Stat tiles | 5 across | 2–3, wraps | keep room-level numbers above the fold |
| Columns | full set | risk, name/id, status, risk, conn. | drop secondary columns, never the decision-driving ones |
| Detail | right dock panel | full-screen sheet | preserves context on desktop, focus on mobile |
| Activity feed | right rail | hidden | supplementary; every event is also reflected in the table/detail, so nothing critical is lost |
| Filters | inline expandable | same, wraps | one interaction model across breakpoints |

**Interaction priority order:** (1) scan risk via the rail, (2) filter/search to
narrow, (3) sort to triage, (4) select to inspect. The layout puts these in
that order top-to-bottom.

---

## 7. Process notes & key decisions

- **Explored** a light theme and a denser spreadsheet look. Rejected light
  (status color washes out, worse for long shifts) and the pure-spreadsheet look
  (no room-level summary, harder triage). Landed on dark + stat tiles + a
  scannable list.
- **Risk rail** chosen over per-row background tinting: tinting whole rows by
  risk makes the table noisy and hurts text contrast; a thin rail gives the same
  peripheral signal without cost to legibility.
- **Pause-live** control added after recognizing that a constantly re-sorting
  list is hard to act on; proctors can freeze the view to work an incident.
- **Connection status as a first-class element** because in a realtime tool the
  proctor must trust that "no events" means calm, not a dead socket.

---

## 8. Rebuilding in Figma

1. **Variables / styles:** create a color variable collection from §2 (same
   names: `canvas`, `surface`, `status/active`, `risk/critical`, …). Create text
   styles from the typography table.
2. **Components with variants:** build `StatusPill`, `RiskBadge`,
   `ConnectionDot`, `Chip`, `StatTile`, and `SessionRow` as Figma components,
   using a `variant` property matching the states in §4.
3. **Frames:** assemble Desktop (1280×800) and Mobile (375×812) frames from the
   wireframes in §5, using the components.
4. **Final screens:** match against screenshots of the running app for fidelity.

Because the coded components and these tokens are one-to-one, the Figma file and
the implementation stay in sync by construction.
