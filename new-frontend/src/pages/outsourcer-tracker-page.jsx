import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

// ─── Static Data ──────────────────────────────────────────────────────────────

// KPI_CARDS, ROSTER removed — requires outsourcer backend model + endpoints.

const TABLE_HEADERS = ["NAME", "ROLE", "COUNTRY", "HOURS / CAP", "£/HR", "OPEN", "STATUS"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OutsourcerTrackerPage() {
  const [mode, setMode] = useState("week");

  return (
    <>
      <Topbar title="Outsourcer Tracker" />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Outsourcer Tracker</h1>
          <p className="text-sm text-muted">Hours · cap · status · open tasks</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter mode={mode} onChange={setMode} />

        {/* Content Row */}
        <div className="flex gap-6 mt-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Outsourcer Backend</p>
                <p className="text-xs text-amber-600 leading-relaxed">Outsourcer tracking requires a backend <code className="font-mono bg-amber-100 px-1 rounded">outsourcer</code> model with hours cap, hourly rate, and status fields. Add <code className="font-mono bg-amber-100 px-1 rounded">GET /api/outsourcers</code> and link to the task system for open task counts.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
