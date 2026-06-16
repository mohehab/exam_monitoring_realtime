import { DashboardHeader } from "./dashboard-header";
import { RealtimeBridge } from "./realtime-bridge";
import { StatsBar } from "./stats-bar";
import { Toolbar } from "./toolbar";
import { SessionsTable } from "./sessions-table";
import { SessionDetailPanel } from "./session-detail-panel";
import { ActivityFeed } from "./activity-feed";

/**
 * Top-level layout (Server Component). It owns no state — it only arranges the
 * static frame and slots in the interactive client islands. The server/client
 * boundary lives at the leaves (StatsBar, Toolbar, SessionsTable, …), keeping
 * as much of the tree server-rendered as the interactivity allows.
 */
export function DashboardShell() {
  return (
    <div className="flex h-screen flex-col bg-canvas text-text">
      <DashboardHeader />
      <RealtimeBridge />

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <StatsBar />
        <Toolbar />

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Relative so the detail panel can dock within the table area on lg */}
          <div className="relative flex min-h-0 flex-col">
            <SessionsTable />
            <SessionDetailPanel />
          </div>

          <aside className="hidden min-h-0 lg:flex lg:flex-col">
            <ActivityFeed />
          </aside>
        </div>
      </main>
    </div>
  );
}
