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

const KPI_CARDS = [
  {
    emoji: "🌐",
    emojiBg: "bg-green-50",
    label: "ORGANIC TRAFFIC",
    value: "28.6K",
    delta: "+18.2% vs last 30 days",
    sparkPoints: "0,15 10,12 20,14 30,8 40,10 50,5 60,7",
    sparkColor: "#10b981",
  },
  {
    emoji: "🔑",
    emojiBg: "bg-blue-50",
    label: "KEYWORDS",
    value: "12,450",
    delta: "+8.7% vs last 30 days",
    sparkPoints: "0,16 10,14 20,15 30,11 40,12 50,8 60,9",
    sparkColor: "#3b82f6",
  },
  {
    emoji: "🔗",
    emojiBg: "bg-purple-50",
    label: "BACKLINKS",
    value: "1,245",
    delta: "+5.4% vs last 30 days",
    sparkPoints: "0,16 10,15 20,13 30,14 40,10 50,11 60,9",
    sparkColor: "#8b5cf6",
  },
  {
    emoji: "🌍",
    emojiBg: "bg-amber-50",
    label: "REF. DOMAINS",
    value: "3,890",
    delta: "+12.1% vs last 30 days",
    sparkPoints: "0,17 10,14 20,15 30,10 40,11 50,7 60,8",
    sparkColor: "#f59e0b",
  },
];

const KEYWORDS = [
  { keyword: "dental implants", position: "#3", change: "+2", changeColor: "text-green-600", volume: "18,000" },
  { keyword: "teeth whitening", position: "#7", change: "-1", changeColor: "text-red-500", volume: "12,000" },
  { keyword: "dental clinic near me", position: "#12", change: "+4", changeColor: "text-green-600", volume: "9,800" },
  { keyword: "cosmetic dentistry", position: "#8", change: "+1", changeColor: "text-green-600", volume: "7,600" },
  { keyword: "clear aligners", position: "#15", change: "0", changeColor: "text-muted", volume: "6,300" },
];

const LEGEND_ITEMS = [
  { color: "#10b981", label: "Top 3", pct: "24%" },
  { color: "#3b82f6", label: "Top 10", pct: "38%" },
  { color: "#f59e0b", label: "Top 50", pct: "25%" },
  { color: "#ef4444", label: "Beyond", pct: "13%" },
];

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
            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {KPI_CARDS.map((card) => (
                <div key={card.label} className="bg-white border border-line rounded-xl p-5">
                  <div className={`w-8 h-8 rounded-lg ${card.emojiBg} flex items-center justify-center text-base`}>
                    {card.emoji}
                  </div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">{card.label}</p>
                  <p className="text-2xl font-bold text-ink">{card.value}</p>
                  <p className="text-xs text-green-600 mt-1">{card.delta}</p>
                  <Sparkline points={card.sparkPoints} color={card.sparkColor} />
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex gap-6">
              {/* Top Keywords */}
              <div className="bg-white border border-line rounded-xl overflow-hidden flex-1">
                <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                  <span className="text-base font-bold text-ink">Top Keywords</span>
                  <span className="text-xs text-primary font-semibold cursor-pointer">View All Keywords →</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      {["KEYWORD", "POSITION", "CHANGE", "VOLUME"].map((col) => (
                        <th
                          key={col}
                          className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {KEYWORDS.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 text-sm font-semibold text-ink">{row.keyword}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-ink">{row.position}</td>
                        <td className={`px-5 py-3.5 text-sm font-semibold ${row.changeColor}`}>{row.change}</td>
                        <td className="px-5 py-3.5 text-sm text-muted">{row.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ranking Distribution */}
              <div className="bg-white border border-line rounded-xl p-5 w-[320px] flex-shrink-0">
                <p className="text-base font-bold text-ink mb-4">Ranking Distribution</p>

                {/* Donut Chart */}
                <div className="relative flex items-center justify-center mb-4">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 mx-auto">
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#e5e7eb" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#10b981" strokeDasharray="24 76" strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#3b82f6" strokeDasharray="38 62" strokeDashoffset="1" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#f59e0b" strokeDasharray="25 75" strokeDashoffset="63" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" stroke="#ef4444" strokeDasharray="13 87" strokeDashoffset="38" />
                    <text x="18" y="17" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold" style={{ fontSize: "5px", fontWeight: "700", fill: "#1e293b" }}>1,245</text>
                    <text x="18" y="22" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "2.5px", fill: "#94a3b8", letterSpacing: "0.5px" }}>KEYWORDS</text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {LEGEND_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-ink">{item.label}</span>
                      <span className="text-xs font-semibold ml-auto">{item.pct}</span>
                    </div>
                  ))}
                </div>
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
