import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static data ────────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    emoji: "💰",
    iconBg: "bg-green-50",
    label: "TARGET MTD",
    value: "£535,000",
    delta: "+12% vs last month",
    deltaColor: "text-green-600",
    sparkPoints: "0,18 10,12 20,14 30,8 40,10 50,4 60,2",
    sparkColor: "#16a34a",
  },
  {
    emoji: "📈",
    iconBg: "bg-blue-50",
    label: "ACTUAL MTD",
    value: "£396,100",
    delta: "+8.4% vs last month",
    deltaColor: "text-green-600",
    sparkPoints: "0,18 10,14 20,16 30,10 40,8 50,6 60,3",
    sparkColor: "#2563eb",
  },
  {
    emoji: "🎯",
    iconBg: "bg-amber-50",
    label: "% OF TARGET",
    value: "74%",
    delta: "-3% behind plan",
    deltaColor: "text-red-500",
    sparkPoints: "0,8 10,10 20,9 30,12 40,14 50,16 60,18",
    sparkColor: "#d97706",
  },
  {
    emoji: "📉",
    iconBg: "bg-red-50",
    label: "VARIANCE",
    value: "-£138,900",
    delta: "-3% vs target",
    deltaColor: "text-red-500",
    sparkPoints: "0,4 10,6 20,8 30,10 40,12 50,14 60,18",
    sparkColor: "#dc2626",
  },
];

const BAR_DATA = [
  { week: "W14", value: 42, heightPct: 60 },
  { week: "W15", value: 48, heightPct: 69 },
  { week: "W16", value: 51, heightPct: 73 },
  { week: "W17", value: 54, heightPct: 77 },
  { week: "W18", value: 49, heightPct: 70 },
  { week: "W19", value: 55, heightPct: 79 },
  { week: "W20", value: 62, heightPct: 89 },
  { week: "W21", value: 68, heightPct: 97 },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BusinessPnlPage() {
  const [mode, setMode] = useState("all");

  return (
    <>
      <Topbar title="Revenue & Finance" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page heading */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-ink">Revenue & Finance</h1>
          <p className="text-xs text-muted mt-0.5">MTD vs target · per business</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter value={mode} onChange={setMode} className="mb-6" />

        {/* Body: main content + sidebar */}
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {KPI_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="bg-white border border-line rounded-xl p-5"
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.iconBg}`}
                  >
                    <span className="text-base leading-none">{card.emoji}</span>
                  </div>

                  {/* Label */}
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    {card.label}
                  </p>

                  {/* Value */}
                  <p className="text-2xl font-bold text-ink leading-tight">
                    {card.value}
                  </p>

                  {/* Delta */}
                  <p className={`text-xs mt-1 ${card.deltaColor}`}>
                    {card.delta}
                  </p>

                  {/* Sparkline */}
                  <div className="mt-3">
                    <svg
                      width="60"
                      height="20"
                      viewBox="0 0 60 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points={card.sparkPoints}
                        fill="none"
                        stroke={card.sparkColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Revenue Bar Chart */}
            <div className="bg-white border border-line rounded-xl p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-base font-bold text-ink">
                  Weekly revenue
                </span>
                <span className="text-xs text-muted">
                  last 8 weeks · all businesses · £k
                </span>
              </div>

              {/* Chart */}
              <div className="flex gap-3 items-end h-[200px]">
                {BAR_DATA.map((bar) => (
                  <div
                    key={bar.week}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    {/* Value label above bar */}
                    <span className="text-xs font-semibold text-ink mb-1">
                      £{bar.value}k
                    </span>
                    {/* Bar */}
                    <div
                      className="w-full rounded-t-lg bg-[#14b8a6]"
                      style={{ height: `${bar.heightPct}%` }}
                    />
                    {/* Week label */}
                    <span className="text-xs text-muted mt-2">{bar.week}</span>
                  </div>
                ))}
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
