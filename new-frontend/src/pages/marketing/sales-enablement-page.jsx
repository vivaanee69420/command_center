import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { Search, Sparkles, ChevronRight } from "lucide-react";

const OBJECTIONS = [
  {
    category: "Price",
    text: '"It\'s too expensive"',
    tags: ["#pricing", "#budget", "#cost"],
    score: 85,
    color: "#ef4444",
    bgColor: "bg-danger-soft text-danger",
  },
  {
    category: "Price",
    text: '"I need to think about the finances"',
    tags: ["#finance", "#payment", "#budget"],
    score: 82,
    color: "#ef4444",
    bgColor: "bg-danger-soft text-danger",
  },
  {
    category: "Timing",
    text: '"I need to think about it"',
    tags: ["#timing", "#delay", "#decision"],
    score: 78,
    color: "#f59e0b",
    bgColor: "bg-warning-soft text-warning",
  },
  {
    category: "Timing",
    text: '"Not the right time"',
    tags: ["#timing", "#busy", "#later"],
    score: 75,
    color: "#f59e0b",
    bgColor: "bg-warning-soft text-warning",
  },
  {
    category: "Third Party",
    text: '"I need to talk to my spouse/partner"',
    tags: ["#spouse", "#partner", "#family"],
    score: 80,
    color: "#64748b",
    bgColor: "bg-bg-soft text-muted",
  },
  {
    category: "Trust",
    text: '"I\'ve heard horror stories / I\'m nervous"',
    tags: ["#nervous", "#scared", "#trust", "#horror"],
    score: 88,
    color: "#7c3aed",
    bgColor: "bg-purple-soft text-purple",
  },
  {
    category: "Competition",
    text: '"I\'m looking at other options / [Competitor] is cheaper"',
    tags: ["#competitor", "#comparison", "#cheaper"],
    score: 82,
    color: "#3b82f6",
    bgColor: "bg-info-soft text-info",
  },
  {
    category: "ROI",
    text: '"What if I can\'t get patients after the course?"',
    tags: ["#roi", "#patients", "#marketing", "#guarantee"],
    score: 90,
    color: "#fb923c",
    bgColor: "bg-orange-soft text-orange",
  },
];

const CATEGORY_FILTERS = ["All", "Price", "Timing", "Third Party", "Trust", "Competition", "ROI"];

const TABS = [
  { key: "objections", label: "Objection Handlers" },
  { key: "scripts", label: "SDR Scripts" },
  { key: "sequences", label: "Follow-up Sequences" },
];

export default function SalesEnablementPage() {
  const [activeTab, setActiveTab] = useState("objections");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredObjections = OBJECTIONS.filter((o) => {
    const matchSearch =
      o.text.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase()) ||
      o.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === "All" || o.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Topbar title="Sales Enablement" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎯"
          title="Sales Enablement"
          subtitle="Objection handlers, SDR scripts, and follow-up sequences"
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                activeTab === tab.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "objections" && (
          <>
            {/* Search + Category Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 bg-white w-64">
                <Search size={14} className="text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search objections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition",
                      categoryFilter === cat
                        ? "bg-primary text-white border-primary"
                        : "border-line text-muted hover:border-primary/40 hover:text-ink bg-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Objection Cards */}
            <div className="space-y-2">
              {filteredObjections.length === 0 && (
                <div className="bg-white border border-line rounded-xl p-8 text-center text-sm text-muted">
                  No objections match your search.
                </div>
              )}
              {filteredObjections.map((obj, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-line rounded-xl flex items-center overflow-hidden hover:shadow-sm transition"
                  style={{ borderLeftWidth: 4, borderLeftColor: obj.color }}
                >
                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", obj.bgColor)}>
                        {obj.category}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-ink mb-2">{obj.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {obj.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-bg-shell text-muted px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 shrink-0">
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <Sparkles size={13} />
                      {obj.score}%
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab !== "objections" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Sparkles size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">Coming Soon</p>
            <p className="text-xs text-muted">This section will be available shortly.</p>
          </div>
        )}
      </main>
    </>
  );
}
