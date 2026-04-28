import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { Plus } from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const COMPETITORS_TABLE = [
  { name: "Bright Smile Bexleyheath", dr: 70, visibility: "22,180", backlinks: "4,560", adSpend: "£5,200" },
  { name: "Mydentist Group",          dr: 78, visibility: "68,500", backlinks: "31,200", adSpend: "£12,400" },
  { name: "Bupa Dental",              dr: 82, visibility: "58,900", backlinks: "42,800", adSpend: "£18,600" },
  { name: "Smile Direct UK",          dr: 65, visibility: "15,400", backlinks: "2,900",  adSpend: "£3,800" },
];

const MARKET_SHARE_LEGEND = [
  { label: "You",           pct: "38%", color: "#10b981" },
  { label: "Competitor A",  pct: "24%", color: "#8b5cf6" },
  { label: "Competitor B",  pct: "21%", color: "#3b82f6" },
  { label: "Competitor C",  pct: "9%",  color: "#94a3b8" },
  { label: "Competitor D",  pct: "8%",  color: "#ef4444" },
];

const INSIGHTS = [
  "1. Competitor A increased ad spend by 15% this month",
  "2. Competitor B is ranking for 230 new keywords",
  "3. We have 45 unlinked opportunities · audit ready",
];

const RECOMMENDED_ACTIONS = [
  "1. Counter Bright Smile with 'Master clinician supervision' messaging — quality over price",
  "2. Launch P4G academy patient ad at £1,250 to absorb price-sensitive demand",
  "3. Audit Bright Smile reviews — likely cracks within 30 days, prep response content",
];

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

            {/* Top Row: Competitors Overview + Market Share */}
            <div className="flex gap-6 mb-6">

              {/* Competitors Overview */}
              <div className="flex-1 bg-white border border-line rounded-xl p-5">
                <p className="text-base font-bold text-ink mb-4">Competitors Overview</p>
                <table className="w-full">
                  <thead>
                    <tr>
                      {["COMPETITOR", "DR", "VISIBILITY", "BACKLINKS", "AD SPEND"].map((col) => (
                        <th
                          key={col}
                          className="text-left text-[10px] font-bold text-muted uppercase tracking-wider px-4 py-2"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPETITORS_TABLE.map((row, i) => (
                      <tr
                        key={i}
                        className="text-sm border-b border-line last:border-0"
                      >
                        <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3 text-muted">{row.dr}</td>
                        <td className="px-4 py-3 text-muted">{row.visibility}</td>
                        <td className="px-4 py-3 text-muted">{row.backlinks}</td>
                        <td className="px-4 py-3 text-muted">{row.adSpend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Market Share */}
              <div className="bg-white border border-line rounded-xl p-5 w-[320px] flex-shrink-0">
                <p className="text-base font-bold text-ink mb-4">Market Share</p>

                {/* Donut chart */}
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-32 h-32">
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#e5e7eb" />
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#10b981" strokeDasharray="38 62" strokeDashoffset="25" />
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#8b5cf6" strokeDasharray="24 76" strokeDashoffset="87" />
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#3b82f6" strokeDasharray="21 79" strokeDashoffset="63" />
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#94a3b8" strokeDasharray="9 91" strokeDashoffset="42" />
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#ef4444" strokeDasharray="8 92" strokeDashoffset="33" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-ink leading-none">38%</span>
                      <span className="text-[10px] text-muted uppercase tracking-wider mt-0.5">SHARE</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2 w-full mt-4">
                    {MARKET_SHARE_LEGEND.map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-ink">{item.label}</span>
                        <span className="text-xs font-semibold text-ink ml-auto">{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white border border-line rounded-xl p-5 mb-6">
              <p className="text-base font-bold text-ink mb-3">Insights</p>
              {INSIGHTS.map((insight, i) => (
                <div
                  key={i}
                  className="bg-bg-soft border border-line rounded-lg px-4 py-3 mb-2 text-sm text-ink"
                >
                  {insight}
                </div>
              ))}
              <p className="text-xs text-primary font-semibold mt-2 cursor-pointer hover:underline">
                View Full Analysis →
              </p>
            </div>

            {/* Weekly Competitor Brief */}
            <div className="bg-white border border-line rounded-xl p-5">
              <div className="flex justify-between items-center">
                <p className="text-base font-bold text-ink">Weekly Competitor Brief</p>
                <p className="text-xs text-muted">Auto-generated · 21 Apr 2026</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mt-3 text-sm text-ink">
                3 competitors increased Meta spend this week. Bright Smile launched price-led campaign at £950 implants — undercutting our backlog reactivation offer.
              </div>

              <p className="text-sm font-bold text-ink mt-4 mb-2">Recommended actions</p>
              {RECOMMENDED_ACTIONS.map((action, i) => (
                <div
                  key={i}
                  className="bg-bg-soft border border-line rounded-lg px-4 py-3 mb-2 text-sm text-ink"
                >
                  {action}
                </div>
              ))}
            </div>

          </div>

          {/* ── Right Sidebar ── */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
