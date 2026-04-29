import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static Data ──────────────────────────────────────────────────────────────

// KPI_STRIP, FEED_ITEMS removed — requires web/Reddit/Companies House scraping backend.

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketIntelPage() {
  const [mode, setMode] = useState("all");
  const [activeBiz, setActiveBiz] = useState(null);

  return (
    <>
      <Topbar
        title="Research Engine"
        subtitle="Continuous web · Reddit · HN · Companies House · Meta Ad Library"
      />
      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-6">

        <ModeFilter mode={mode} setMode={setMode} activeBiz={activeBiz} setActiveBiz={setActiveBiz} />

        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Research Engine Backend</p>
                <p className="text-xs text-amber-600 leading-relaxed">Market intelligence requires a backend service that scrapes Reddit, HN, Companies House, and the Meta Ads Library on a schedule. Add a <code className="font-mono bg-amber-100 px-1 rounded">market_intel</code> table and a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/intel/feed</code> endpoint that serves the aggregated feed.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar mode={mode} activeBiz={activeBiz} />
        </div>

      </main>
    </>
  );
}
