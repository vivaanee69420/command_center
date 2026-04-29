import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { Plus } from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

// COMPETITORS_TABLE, MARKET_SHARE_LEGEND, INSIGHTS, RECOMMENDED_ACTIONS removed — requires AI competitor analysis backend.

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompetitorAiPage() {
  const [mode, setMode] = useState(null);

  return (
    <>
      <Topbar
        title="Competitor Analysis"
        subtitle="Track and analyse your competitors"
        right={
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition">
            <Plus size={13} />
            Add Competitor
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter value={mode} onChange={setMode} />

        <div className="flex gap-6 mt-6">
          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Competitor Analysis Backend</p>
                <p className="text-xs text-amber-600 leading-relaxed">Competitor data (domain rating, visibility, backlinks, ad spend) requires Ahrefs/Semrush API and Meta Ads Library scraping. Add a <code className="font-mono bg-amber-100 px-1 rounded">competitor</code> model, scheduled data pulls, and a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/competitors</code> endpoint with AI-generated insights.</p>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
