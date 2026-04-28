import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static Data ──────────────────────────────────────────────────────────────

const KPI_STRIP = [
  { label: "Sources Tracked", value: "47",  color: "#7c3aed" },
  { label: "New Today",       value: "5",   color: "#7c3aed" },
  { label: "Threats",         value: "3",   color: "#ef4444" },
  { label: "Opportunities",   value: "8",   color: "#7c3aed" },
];

const FEED_ITEMS = [
  {
    source: "REDDIT R/DENTISTRY",
    title: "Patient education videos drive 2-3x more implant consults than ads",
    description: "Thread with 340 upvotes — practices using YouTube before/after content reporting big lifts.",
  },
  {
    source: "HACKER NEWS",
    title: "GPT-5 dental imaging analysis · early benchmarks",
    description: "Researchers claim 92% accuracy on caries detection on intraoral photos.",
  },
  {
    source: "META ADS LIBRARY",
    title: "Smile Direct Club restarting UK ops",
    description: "7 new ad creatives detected in past 48h targeting Kent/SE London.",
  },
  {
    source: "COMPANIES HOUSE",
    title: "New competitor: Bright Smile Bexleyheath Ltd · incorporated 14 Apr",
    description: "Director: Dr Amol Patel. Likely launching Q3.",
  },
  {
    source: "BMJ OPEN",
    title: "Biological dentistry 25-year outcomes paper",
    description: "Reinforces Plan4Growth biological track curriculum.",
  },
];

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

            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4">
              {KPI_STRIP.map((kpi) => (
                <div key={kpi.label} className="bg-white border border-line rounded-xl p-5">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">{kpi.label}</div>
                  <div className="text-2xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Live Feed */}
            <div className="bg-white border border-line rounded-xl">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Live feed</span>
                <span className="text-xs text-muted">refreshes every 15 min</span>
              </div>
              {FEED_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={`px-5 py-4 border-b border-line last:border-0`}
                >
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">{item.source}</div>
                  <div className="text-sm font-semibold text-ink mt-1">{item.title}</div>
                  <div className="text-xs text-muted mt-0.5">{item.description}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Sidebar */}
          <RightSidebar mode={mode} activeBiz={activeBiz} />
        </div>

      </main>
    </>
  );
}
