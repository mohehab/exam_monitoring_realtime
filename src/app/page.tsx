import { getInitialSnapshot } from "@/lib/data/queries";
import { StoreProvider } from "@/components/providers/store-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// Render per request so the initial snapshot reflects the realtime source's
// current state (it mutates as events stream), rather than a build-time copy.
export const dynamic = "force-dynamic";

/**
 * Dashboard route (Server Component). Reads the initial dataset on the server
 * and hands it to the client store provider, so the first paint already has
 * 12k sessions and the realtime stream only ever carries deltas.
 */
export default function DashboardPage() {
  const { sessions, seq } = getInitialSnapshot();

  return (
    <StoreProvider initialSessions={sessions} initialSeq={seq}>
      <DashboardShell />
    </StoreProvider>
  );
}
