import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { api } from "@/api/client";

export default function BusinessPnlPage() {
  const [mode, setMode] = useState("all");
  const [revenue, setRevenue] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.revenue(), api.businesses()])
      .then(([rev, biz]) => { setRevenue(rev); setBusinesses(biz); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // MTD aggregates
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const mtdRevenue = revenue.filter((r) => r.date >= monthStart);
  const actualMTD = mtdRevenue.reduce((sum, r) => sum + r.gross, 0);
  const totalTarget = businesses.reduce((sum, b) => sum + (b.target_monthly || 0), 0);
  const pctOfTarget = totalTarget > 0 ? Math.round((actualMTD / totalTarget) * 100) : 0;
  const variance = actualMTD - totalTarget;

  const fmt = (n) => `£${Math.abs(Math.round(n)).toLocaleString()}`;

  const KPI_CARDS = [
    { emoji: "💰", iconBg: "bg-green-50", label: "TARGET MTD", value: fmt(totalTarget), delta: "monthly target", deltaColor: "text-muted" },
    { emoji: "📈", iconBg: "bg-blue-50", label: "ACTUAL MTD", value: fmt(actualMTD), delta: `${mtdRevenue.length} snapshots`, deltaColor: "text-muted" },
    { emoji: "🎯", iconBg: "bg-amber-50", label: "% OF TARGET", value: `${pctOfTarget}%`, delta: pctOfTarget >= 100 ? "On track" : `${100 - pctOfTarget}% behind`, deltaColor: pctOfTarget >= 80 ? "text-green-600" : "text-red-500" },
    { emoji: "📉", iconBg: "bg-red-50", label: "VARIANCE", value: (variance >= 0 ? "+" : "-") + fmt(variance), delta: variance >= 0 ? "above target" : "below target", deltaColor: variance >= 0 ? "text-green-600" : "text-red-500" },
  ];

  // Weekly bar chart: group revenue by week number
  const weeklyMap = {};
  revenue.forEach((r) => {
    const d = new Date(r.date);
    const weekLabel = `W${String(Math.ceil(d.getDate() / 7)).padStart(2, "0")}/${d.getMonth() + 1}`;
    weeklyMap[weekLabel] = (weeklyMap[weekLabel] || 0) + r.gross;
  });
  const weeklyEntries = Object.entries(weeklyMap).slice(-8);
  const maxWeekly = Math.max(...weeklyEntries.map(([, v]) => v), 1);
  const BAR_DATA = weeklyEntries.map(([k, v]) => ({
    week: k.split("/")[0],
    value: Math.round(v / 1000),
    heightPct: Math.round((v / maxWeekly) * 100),
  }));

  return (
    <>
      <Topbar title="Revenue & Finance" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-ink">Revenue & Finance</h1>
          <p className="text-xs text-muted mt-0.5">MTD vs target · per business</p>
        </div>

        <ModeFilter value={mode} onChange={setMode} className="mb-6" />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-sm text-muted py-8 text-center">Loading revenue data...</div>
            ) : (
              <>
                {/* KPI Strip */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {KPI_CARDS.map((card) => (
                    <div key={card.label} className="bg-white border border-line rounded-xl p-5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.iconBg}`}>
                        <span className="text-base leading-none">{card.emoji}</span>
                      </div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{card.label}</p>
                      <p className="text-2xl font-bold text-ink leading-tight">{card.value}</p>
                      <p className={`text-xs mt-1 ${card.deltaColor}`}>{card.delta}</p>
                    </div>
                  ))}
                </div>

                {/* Weekly Revenue Bar Chart */}
                {BAR_DATA.length > 0 ? (
                  <div className="bg-white border border-line rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-base font-bold text-ink">Weekly revenue</span>
                      <span className="text-xs text-muted">last 8 weeks · all businesses · £k</span>
                    </div>
                    <div className="flex gap-3 items-end h-[200px]">
                      {BAR_DATA.map((bar) => (
                        <div key={bar.week} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-xs font-semibold text-ink mb-1">£{bar.value}k</span>
                          <div className="w-full rounded-t-lg bg-[#14b8a6]" style={{ height: `${bar.heightPct}%` }} />
                          <span className="text-xs text-muted mt-2">{bar.week}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-line rounded-xl p-8 text-center text-sm text-muted">
                    No revenue snapshots yet. Add revenue data via the API.
                  </div>
                )}
              </>
            )}
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
