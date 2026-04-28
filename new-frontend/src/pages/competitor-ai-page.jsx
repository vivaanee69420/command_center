import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronDown, ChevronRight, Plus } from "lucide-react";

const COMPETITORS = [
  { rank: 1, domain: "singletondental.co.uk", da: 61, fb: "5.3K", ads: "Active" },
  { rank: 2, domain: "thedentalcentreashford.co.uk", da: 51, fb: "4.8K", ads: "Active" },
  { rank: 3, domain: "ashforddentalcare.co.uk", da: 54, fb: "8.7K", ads: "No" },
  { rank: 4, domain: "stanhopedental.co.uk", da: 33, fb: "42.9K", ads: "Active" },
  { rank: 5, domain: "willesboroughdental.co.uk", da: 26, fb: "10.6K", ads: "No" },
  { rank: 6, domain: "kenningtondental.co.uk", da: 50, fb: "15.2K", ads: "Active" },
];

const RANK_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#7c3aed", "#ef4444", "#14b8a6"];

const RECENT_ACTIVITY = [
  { initials: "SD", name: "Singleton Dental", action: "Published 3 new blog posts targeting 'invisible braces Ashford'", time: "2h ago", color: "#10b981" },
  { initials: "DC", name: "The Dental Centre Ashford", action: "Started running new Google Ads campaign — estimated £800/mo budget", time: "5h ago", color: "#3b82f6" },
  { initials: "SK", name: "Stanhope Dental", action: "Facebook page gained 320 new followers this week", time: "1d ago", color: "#7c3aed" },
];

const TABS = ["Overview", "SEO Analysis", "Social Media", "Paid Ads", "Content Strategy", "Other Marketing", "AI Insights"];

const KPI_CARDS = [
  { label: "COMPETITORS TRACKED", value: 6, color: "#10b981", bg: "#f0fdf4", textColor: "#15803d" },
  { label: "AVG DOMAIN AUTHORITY", value: 49, color: "#3b82f6", bg: "#eff6ff", textColor: "#1d4ed8" },
  { label: "ON FACEBOOK ADS", value: 5, color: "#7c3aed", bg: "#faf5ff", textColor: "#7c3aed" },
  { label: "ON GOOGLE ADS", value: 4, color: "#f97316", bg: "#fff7ed", textColor: "#c2410c" },
];

export default function CompetitorAiPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <>
      <Topbar title="Competitor Intelligence" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🔍"
          title="Competitor Intelligence"
          subtitle="Track 5-10 competitors across SEO, Social, Ads & more"
          right={
            <div className="flex items-center gap-3">
              <select className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none">
                <option>GM Dental Ashford</option>
                <option>GM Dental Rochester</option>
                <option>GM Dental Barnet</option>
              </select>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition">
                <Plus size={14} />
                Add Competitor
              </button>
              <button className="p-2 border border-line rounded-lg hover:bg-bg-soft transition">
                <RefreshCw size={14} className="text-muted" />
              </button>
            </div>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className="bg-white border border-line rounded-xl p-5" style={{ borderLeftWidth: 4, borderLeftColor: card.color }}>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">{card.label}</p>
              <p className="text-3xl font-bold" style={{ color: card.textColor }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold transition",
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-white border border-line text-muted hover:text-ink hover:bg-bg-soft"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Competitor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {COMPETITORS.map((comp) => (
            <div key={comp.domain} className="bg-white border border-line rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: RANK_COLORS[comp.rank - 1] }}
                  >
                    {comp.rank}
                  </div>
                  <span className="text-sm font-semibold text-ink truncate max-w-[180px]">{comp.domain}</span>
                </div>
                <ChevronRight size={16} className="text-muted flex-shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">DA</p>
                  <p className="text-lg font-bold text-blue-700">{comp.da}</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide mb-1">FB Followers</p>
                  <p className="text-lg font-bold text-teal-700">{comp.fb}</p>
                </div>
                <div className={cn("rounded-lg p-3 text-center", comp.ads === "Active" ? "bg-green-50" : "bg-red-50")}>
                  <p className={cn("text-[10px] font-semibold uppercase tracking-wide mb-1", comp.ads === "Active" ? "text-green-600" : "text-red-500")}>Ads</p>
                  <p className={cn("text-sm font-bold", comp.ads === "Active" ? "text-green-700" : "text-red-600")}>{comp.ads}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Competitor Activity */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h2 className="text-sm font-bold text-ink mb-4">Recent Competitor Activity</h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-bg-soft transition">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-ink">{item.name} </span>
                  <span className="text-sm text-muted">{item.action}</span>
                </div>
                <span className="text-xs text-muted flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
