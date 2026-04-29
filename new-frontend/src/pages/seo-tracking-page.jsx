import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

const Sparkline = ({ points, color }) => (
  <svg viewBox="0 0 60 20" className="w-16 h-5 mt-2">
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      points={points}
    />
  </svg>
);

// KPI_CARDS, KEYWORDS, LEGEND_ITEMS removed — requires Ahrefs/Semrush API key + backend endpoint.

export default function SeoTrackingPage() {
  const [mode, setMode] = useState("today");

  return (
    <>
      <Topbar title="SEO & Rankings" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">SEO &amp; Rankings</h1>
          <p className="text-sm text-muted mt-1">Track your SEO performance and rankings</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter mode={mode} onChange={setMode} />

        {/* Main layout */}
        <div className="flex gap-6 mt-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Ahrefs / Semrush Integration</p>
                <p className="text-xs text-amber-600 leading-relaxed">SEO data (organic traffic, keyword rankings, backlinks, domain authority) requires an Ahrefs or Semrush API key. Add <code className="font-mono bg-amber-100 px-1 rounded">AHREFS_API_KEY</code> or <code className="font-mono bg-amber-100 px-1 rounded">SEMRUSH_API_KEY</code> to the backend <code className="font-mono bg-amber-100 px-1 rounded">.env</code> and implement a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/seo/overview</code> endpoint.</p>
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
