import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const TABS = ["All Campaigns", "Google Ads", "Facebook Ads"];

const KPI_CARDS = [
  {
    emoji: "💰",
    emojiBg: "bg-green-50",
    label: "TOTAL SPEND",
    value: "£17,750",
    delta: "-11.2% vs last 30 days",
    deltaColor: "text-red-500",
    sparkline: [30, 28, 35, 25, 20, 22, 18],
    sparkColor: "#ef4444",
  },
  {
    emoji: "👆",
    emojiBg: "bg-blue-50",
    label: "TOTAL CLICKS",
    value: "13,540",
    delta: "+14.8% vs last 30 days",
    deltaColor: "text-green-600",
    sparkline: [10, 15, 12, 18, 20, 22, 25],
    sparkColor: "#16a34a",
  },
  {
    emoji: "🎯",
    emojiBg: "bg-purple-50",
    label: "TOTAL CONVERSIONS",
    value: "550",
    delta: "+19.7% vs last 30 days",
    deltaColor: "text-green-600",
    sparkline: [8, 12, 11, 16, 18, 22, 24],
    sparkColor: "#16a34a",
  },
  {
    emoji: "📈",
    emojiBg: "bg-amber-50",
    label: "AVERAGE ROAS",
    value: "3.9x",
    delta: "+8.5% vs last 30 days",
    deltaColor: "text-green-600",
    sparkline: [20, 22, 21, 24, 26, 25, 28],
    sparkColor: "#16a34a",
  },
];

const ALL_CAMPAIGNS = [
  { id: 1, name: "Facebook Ads — Brand",       platform: "Facebook", spend: "£4,250", clicks: "1,156", conversions: 54,  roas: "5.4x", status: "Active" },
  { id: 2, name: "Facebook Ads — Leads",       platform: "Facebook", spend: "£6,230", clicks: "1,842", conversions: 89,  roas: "4.1x", status: "Active" },
  { id: 3, name: "Facebook Ads — Retargeting", platform: "Facebook", spend: "£2,750", clicks: "758",   conversions: 62,  roas: "6.2x", status: "Active" },
  { id: 4, name: "Google Ads — Brand",         platform: "Google",   spend: "£5,200", clicks: "1,480", conversions: 88,  roas: "4.8x", status: "Active" },
  { id: 5, name: "Google Ads — Search",        platform: "Google",   spend: "£3,850", clicks: "1,140", conversions: 52,  roas: "3.4x", status: "Active" },
  { id: 6, name: "Google Ads — Retargeting",   platform: "Google",   spend: "£2,450", clicks: "980",   conversions: 41,  roas: "3.7x", status: "Active" },
  { id: 7, name: "Google Ads — Display",       platform: "Google",   spend: "£1,890", clicks: "430",   conversions: 18,  roas: "2.1x", status: "Paused" },
];

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ points, color }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - ((v - min) / range) * (h - 4) - 2);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdsDashboardPage() {
  const [activeTab, setActiveTab] = useState("All Campaigns");

  const filteredCampaigns = ALL_CAMPAIGNS.filter((c) => {
    if (activeTab === "Google Ads") return c.platform === "Google";
    if (activeTab === "Facebook Ads") return c.platform === "Facebook";
    return true;
  });

  return (
    <>
      <Topbar
        title="Ads Manager"
        subtitle="Manage all your advertising campaigns"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
            <Plus size={15} />
            New Campaign
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-5">
        {/* Mode Filter */}
        <ModeFilter />

        {/* Content */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Tab Filter */}
            <div className="flex items-center gap-1 mb-5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-2 px-3 text-sm transition-colors",
                    activeTab === tab
                      ? "font-semibold text-primary border-b-2 border-primary"
                      : "font-medium text-muted hover:text-ink"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {KPI_CARDS.map((card) => (
                <div key={card.label} className="bg-white border border-line rounded-xl p-5">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg", card.emojiBg)}>
                    {card.emoji}
                  </div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">
                    {card.label}
                  </div>
                  <div className="text-2xl font-bold text-ink mt-1">{card.value}</div>
                  <div className={cn("text-xs mt-1", card.deltaColor)}>{card.delta}</div>
                  <div className="mt-2">
                    <Sparkline points={card.sparkline} color={card.sparkColor} />
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Performance Table */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">Campaign Performance</span>
                <span className="text-xs text-muted">{filteredCampaigns.length} campaigns</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line bg-bg-soft">
                      {["CAMPAIGN", "PLATFORM", "SPEND", "CLICKS", "CONVERSIONS", "ROAS", "STATUS"].map((col) => (
                        <th
                          key={col}
                          className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((c, i) => (
                      <tr
                        key={c.id}
                        className={cn(
                          "border-b border-line last:border-0 hover:bg-bg-soft transition-colors",
                          i % 2 === 0 ? "bg-white" : "bg-bg-soft/30"
                        )}
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-ink">{c.name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted">{c.platform}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted">{c.spend}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted">{c.clicks}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted">{c.conversions}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-ink">{c.roas}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
                              c.status === "Active"
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-500"
                            )}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
