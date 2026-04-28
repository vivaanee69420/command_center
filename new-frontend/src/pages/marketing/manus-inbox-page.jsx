import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { RefreshCw, Eye, Play, Info, AlertCircle } from "lucide-react";

const RESEARCH_ITEMS = [
  {
    id: 1,
    title: "Automation Research: Automation Benchmarks",
    status: "running",
    entity: "GM Dental",
    type: "automation automation_benchmarks",
    tags: ["#ghl_automation", "#sequences", "#automation_benchmarks"],
  },
  {
    id: 2,
    title: "Competitor Offer Research — Gm Lab",
    status: "running",
    entity: "GM Lab",
    type: "offer competitor_research",
    tags: ["#offer_library", "#competitor_pricing", "#gm_lab"],
  },
  {
    id: 3,
    title: "Test Research Task",
    status: "pending",
    entity: "GM Dental",
    type: "competitor analysis",
    tags: [],
  },
  {
    id: 4,
    title: "Test Research Task",
    status: "pending",
    entity: "GM Dental",
    type: "competitor analysis",
    tags: [],
  },
  {
    id: 5,
    title: "Competitor Offer Research — Gm Dental",
    status: "processed",
    entity: "GM Dental",
    type: "offer competitor_research",
    tags: ["#offer_library", "#competitor_pricing", "#gm_dental"],
  },
  {
    id: 6,
    title: "Quick Kent Competitor Check",
    status: "processed",
    entity: "GM Dental",
    type: "competitor analysis",
    tags: [],
  },
  {
    id: 7,
    title: "Content Research: Viral Angles (gm_dental)",
    status: "pending",
    entity: "GM Dental",
    type: "content research",
    tags: [],
  },
];

const STATUS_STYLES = {
  running: { label: "Running", className: "bg-info-soft text-info" },
  pending: { label: "Pending", className: "bg-warning-soft text-warning" },
  processed: { label: "Processed", className: "bg-primary-soft text-primary" },
};

const ENTITY_STYLES = {
  "GM Dental": "bg-primary-soft text-primary",
  "GM Lab": "bg-orange-soft text-orange",
};

const TABS = [
  { key: "inbox", label: "Inbox", count: 4 },
  { key: "outputs", label: "Claude Outputs", count: 15 },
];

export default function ManusInboxPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedItem, setSelectedItem] = useState(null);
  const [entityFilter, setEntityFilter] = useState("All Entities");

  const filteredItems = RESEARCH_ITEMS.filter((item) =>
    entityFilter === "All Entities" || item.entity === entityFilter
  );

  const inboxItems = filteredItems.filter((i) => i.status !== "processed");
  const displayItems = activeTab === "inbox" ? filteredItems.filter((i) => i.status !== "processed") : filteredItems.filter((i) => i.status === "processed");

  return (
    <>
      <Topbar title="Manus Inbox" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="⚙️"
          title="Manus ↔ Claude Bridge"
          subtitle="Process Manus research with Claude AI and route to correct module"
          actions={[
            { label: "Run Manus Research", icon: <Play size={14} />, variant: "primary" },
            { label: "Refresh", icon: <RefreshCw size={14} />, variant: "outline" },
          ]}
        />

        {/* Status Banners */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 bg-info-soft border border-info rounded-xl px-4 py-3">
            <Info size={14} className="text-info shrink-0" />
            <p className="text-xs font-medium text-info">2 research tasks running in Manus — auto-checking every 30s</p>
          </div>
          <div className="flex items-center gap-2 bg-warning-soft border border-warning rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-warning shrink-0" />
            <p className="text-xs font-medium text-warning">4 research items pending Claude processing</p>
          </div>
        </div>

        {/* Tabs + Filter Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-muted hover:text-ink"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="border border-line rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary transition bg-white"
          >
            <option>All Entities</option>
            <option>GM Dental</option>
            <option>GM Lab</option>
          </select>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Research item list */}
          <div className="space-y-2">
            {displayItems.length === 0 && (
              <div className="bg-white border border-line rounded-xl p-8 text-center">
                <Eye size={32} className="text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">No items in this tab</p>
              </div>
            )}
            {displayItems.map((item) => {
              const statusStyle = STATUS_STYLES[item.status];
              const entityStyle = ENTITY_STYLES[item.entity] || "bg-bg-soft text-muted";
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "bg-white border rounded-xl p-4 cursor-pointer transition",
                    isSelected ? "border-primary shadow-sm" : "border-line hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-ink leading-snug">{item.title}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0", statusStyle.className)}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", entityStyle)}>
                      {item.entity}
                    </span>
                    <span className="text-[10px] text-muted">{item.type}</span>
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-muted bg-bg-shell px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Detail / Empty state */}
          <div>
            {selectedItem ? (
              <div className="bg-white border border-line rounded-xl p-5 sticky top-20">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h3 className="text-sm font-bold text-ink">{selectedItem.title}</h3>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", STATUS_STYLES[selectedItem.status].className)}>
                    {STATUS_STYLES[selectedItem.status].label}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Entity</span>
                    <span className={cn("font-semibold px-2 py-0.5 rounded-full text-[10px]", ENTITY_STYLES[selectedItem.entity])}>{selectedItem.entity}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Type</span>
                    <span className="font-medium text-ink">{selectedItem.type}</span>
                  </div>
                </div>
                {selectedItem.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-bg-shell text-muted px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.status === "pending" && (
                  <button className="w-full py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition">
                    Process with Claude
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-line rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <Eye size={40} className="text-line mb-3" />
                <p className="text-sm font-semibold text-ink mb-1">Select a research item</p>
                <p className="text-xs text-muted mb-6 max-w-[220px]">
                  Click any research item on the left to view details and process with Claude
                </p>
                <div className="flex flex-col items-start gap-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
                    Pending — awaiting Claude processing
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    Processed — Claude output ready
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How the Bridge Works */}
        <div className="mt-6 bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">How the Bridge Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: 1,
                title: "Manus Research",
                desc: "You trigger research tasks in Manus. Manus browses the web and compiles structured research reports.",
              },
              {
                step: 2,
                title: "Claude Processing",
                desc: "Claude AI reads Manus output, extracts insights, and formats data into structured JSON for each module.",
              },
              {
                step: 3,
                title: "Auto-Route",
                desc: "Data is automatically routed to the correct module — Offer Library, Competitor AI, Content Factory, or Lead Engine.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink mb-1">{s.title}</p>
                  <p className="text-xs text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
