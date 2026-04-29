import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static Data ──────────────────────────────────────────────────────────────

// KPI_STRIP, BACKLINK_ROWS removed — requires Ahrefs API key + backend endpoint.

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ points, color }) {
  return (
    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" className="mt-2">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BacklinksPage() {
  const [mode, setMode] = useState(null);

  return (
    <>
      <Topbar title="Backlink Monitor" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Backlink Monitor</h1>
          <p className="text-sm text-muted mt-1">Track your backlinks and domain authority</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter value={mode} onChange={setMode} className="mb-6" />

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Ahrefs Integration</p>
                <p className="text-xs text-amber-600 leading-relaxed">Backlink data (domain authority, referring domains, spam score, individual backlinks) requires Ahrefs API. Add <code className="font-mono bg-amber-100 px-1 rounded">AHREFS_API_KEY</code> to the backend <code className="font-mono bg-amber-100 px-1 rounded">.env</code> and implement a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/seo/backlinks</code> endpoint.</p>
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
