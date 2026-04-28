import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static Data ──────────────────────────────────────────────────────────────

const KPI_STRIP = [
  {
    emoji: "🔗",
    iconBg: "bg-blue-50",
    label: "TOTAL BACKLINKS",
    value: "3,890",
    delta: "+5.7% vs last 30 days",
    sparkPoints: "0,28 10,22 20,18 30,14 40,10 50,6 60,2",
    sparkColor: "#3b82f6",
  },
  {
    emoji: "🌐",
    iconBg: "bg-purple-50",
    label: "REFERRING DOMAINS",
    value: "1,245",
    delta: "+8.4% vs last 30 days",
    sparkPoints: "0,30 10,25 20,20 30,16 40,11 50,7 60,3",
    sparkColor: "#8b5cf6",
  },
  {
    emoji: "🏆",
    iconBg: "bg-green-50",
    label: "DOMAIN AUTHORITY",
    value: "42",
    delta: "+3 vs last 30 days",
    sparkPoints: "0,32 10,27 20,22 30,17 40,12 50,7 60,2",
    sparkColor: "#10b981",
  },
  {
    emoji: "🛡️",
    iconBg: "bg-red-50",
    label: "SPAM SCORE",
    value: "3% Low",
    delta: "-1% vs last 30 days",
    sparkPoints: "0,30 10,26 20,22 30,18 40,14 50,10 60,6",
    sparkColor: "#ef4444",
  },
];

const BACKLINK_ROWS = [
  { domain: "dentalblog.com",         da: 48, linkType: "Follow",   status: "Active", firstSeen: "19 May" },
  { domain: "healthnews.com",         da: 62, linkType: "Follow",   status: "Active", firstSeen: "17 May" },
  { domain: "medicaldirectory.org",   da: 45, linkType: "Follow",   status: "Active", firstSeen: "15 May" },
  { domain: "wellnesshub.uk",         da: 41, linkType: "Nofollow", status: "Active", firstSeen: "14 May" },
  { domain: "beautytips.com",         da: 38, linkType: "Follow",   status: "Active", firstSeen: "12 May" },
];

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
            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {KPI_STRIP.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white border border-line rounded-xl p-5"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.iconBg}`}
                  >
                    <span className="text-base leading-none">{kpi.emoji}</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-ink">{kpi.value}</p>
                  <p className="text-xs text-green-600 mt-1">{kpi.delta}</p>
                  <Sparkline points={kpi.sparkPoints} color={kpi.sparkColor} />
                </div>
              ))}
            </div>

            {/* Backlink Sources */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {/* Section Header */}
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">Backlink Sources</span>
                <button className="text-xs text-primary font-semibold hover:underline">
                  View All Backlinks →
                </button>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    {["DOMAIN", "DA", "LINK TYPE", "STATUS", "FIRST SEEN"].map((col) => (
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
                  {BACKLINK_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-bg-soft transition">
                      <td className="px-5 py-4 text-sm font-medium text-ink">
                        {row.domain}
                      </td>
                      <td className="px-5 py-4 text-sm text-ink font-semibold">
                        {row.da}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {row.linkType}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {row.firstSeen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
