import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronRight } from "lucide-react";

const SEO_BUSINESSES = [
  { name: "GM Dental Group", domain: "gm-dental.co.uk", score: 66 },
  { name: "GM Dental Ashford", domain: "gmdentalashford.co.uk", score: 67 },
  { name: "GM Dental Rochester", domain: "gmdentalrochester.co.uk", score: 61 },
  { name: "GM Dental Barnet", domain: "gmdentalbarnet.co.uk", score: 68 },
  { name: "Fixed Teeth Solutions", domain: "fixedteethsolutions.co.uk", score: 67 },
  { name: "Warwick Lodge Dental", domain: "warwicklodgedental.co.uk", score: 69 },
  { name: "Rye Dental Practice", domain: "ryedental.co.uk", score: 63 },
  { name: "GM Dental Lab", domain: "gmdentallab.co.uk", score: 64 },
  { name: "Plan4Growth Academy", domain: "plan4growth.uk", score: 45 },
  { name: "Elevate Accounts", domain: "elevateaccounts.uk", score: 53 },
];

const TABS = ["Overview", "Rankings", "Local SEO", "Content Health", "Backlinks", "Technical", "AI Insights"];

const KPI_CARDS = [
  { label: "AVG SEO SCORE", value: "62", sub: null, color: "#10b981", borderColor: "#10b981", textColor: "#15803d" },
  { label: "TOTAL KEYWORDS", value: "130", sub: "23 in Top 10", color: "#3b82f6", borderColor: "#3b82f6", textColor: "#1d4ed8" },
  { label: "ORGANIC TRAFFIC", value: "21,967", sub: "monthly visits", color: "#10b981", borderColor: "#10b981", textColor: "#15803d" },
  { label: "BUSINESSES", value: "10", sub: "being tracked", color: "#f97316", borderColor: "#f97316", textColor: "#c2410c" },
];

function getScoreColor(score) {
  if (score >= 60) return { ring: "#10b981", text: "#15803d", bg: "#f0fdf4" };
  if (score >= 50) return { ring: "#f59e0b", text: "#b45309", bg: "#fffbeb" };
  return { ring: "#ef4444", text: "#dc2626", bg: "#fef2f2" };
}

export default function SeoTrackingPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <>
      <Topbar title="SEO Command Center" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🔎"
          title="SEO Command Center"
          subtitle="Comprehensive SEO tracking for all 10 businesses"
          right={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg text-xs font-medium text-ink hover:bg-bg-soft transition">
                Manus Research
              </button>
              <select className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none">
                <option>All Businesses</option>
                {SEO_BUSINESSES.map((b) => (
                  <option key={b.domain}>{b.name}</option>
                ))}
              </select>
              <button className="p-2 border border-line rounded-lg hover:bg-bg-soft transition">
                <RefreshCw size={14} className="text-muted" />
              </button>
            </div>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className="bg-white border border-line rounded-xl p-5" style={{ borderLeftWidth: 4, borderLeftColor: card.borderColor }}>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">{card.label}</p>
              <p className="text-3xl font-bold" style={{ color: card.textColor }}>{card.value}</p>
              {card.sub && <p className="text-xs text-muted mt-1">{card.sub}</p>}
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

        {/* Business SEO Score Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SEO_BUSINESSES.map((biz) => {
            const colors = getScoreColor(biz.score);
            return (
              <div key={biz.domain} className="bg-white border border-line rounded-xl p-5 hover:shadow-md transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl border-4"
                    style={{ borderColor: colors.ring, color: colors.text, backgroundColor: colors.bg }}
                  >
                    {biz.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink leading-tight">{biz.name}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">{biz.domain}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
