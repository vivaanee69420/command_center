import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { Sparkles, Play, Cpu, Wifi, WifiOff } from "lucide-react";

const AUTOMATIONS = [
  {
    category: "Nurture",
    title: "New Lead Nurture Sequence",
    desc: "Automated 7-day email/SMS sequence for new leads",
    trigger: "new_contact",
    steps: 6,
    color: "#3b82f6",
  },
  {
    category: "Recovery",
    title: "Missed Call Follow-up",
    desc: "Instant SMS + voicemail drop when call is missed",
    trigger: "missed_call",
    steps: 2,
    color: "#fb923c",
  },
  {
    category: "Reminders",
    title: "Appointment Reminder Sequence",
    desc: "3-stage reminder before appointment",
    trigger: "appointment_booked",
    steps: 3,
    color: "#10b981",
  },
  {
    category: "Reputation",
    title: "Review Request Automation",
    desc: "Request Google review after successful appointment",
    trigger: "appointment_completed",
    steps: 2,
    color: "#22c55e",
  },
  {
    category: "Nurture",
    title: "P4G Course Interest Nurture",
    desc: "Nurture sequence for dentists interested in implant training",
    trigger: "form_submitted",
    steps: 6,
    color: "#3b82f6",
  },
  {
    category: "Recovery",
    title: "Stale Lead Reactivation",
    desc: "Re-engage leads that have gone cold for 30+ days",
    trigger: "lead_stale_30_days",
    steps: 3,
    color: "#fb923c",
  },
];

const TABS = [
  { key: "automations", label: "Automations" },
  { key: "pipelines", label: "Pipelines" },
  { key: "builder", label: "+ Automation Builder" },
];

const FILTERS = ["All", "Nurture", "Recovery", "Reminders", "Reputation", "Custom"];

export default function GhlAutomationPage() {
  const [activeTab, setActiveTab] = useState("automations");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? AUTOMATIONS
      : AUTOMATIONS.filter((a) => a.category === activeFilter);

  return (
    <>
      <Topbar title="GHL Automation Control Centre" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          title="GHL Automation Control Centre"
          subtitle="Manage workflows, triggers, and nurture sequences"
          right={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg text-xs font-medium text-ink hover:bg-bg-soft transition">
                <Cpu size={13} />
                AI Research
              </button>
              <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 bg-white text-xs">
                <span className="w-2 h-2 rounded-full bg-danger inline-block" />
                <span className="font-semibold text-ink">GHL Disconnected</span>
                <span className="text-muted">·</span>
                <span className="text-muted">7/9 Locations</span>
                <span className="text-muted">·</span>
                <span className="text-primary font-semibold">6 Active</span>
              </div>
            </div>
          }
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

        {activeTab === "automations" && (
          <>
            {/* Category Filters */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition border",
                    activeFilter === f
                      ? "bg-primary text-white border-primary"
                      : "border-line text-muted hover:text-ink hover:border-primary/40"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Automation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((automation, idx) => (
                <div key={idx} className="bg-white border border-line rounded-xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: automation.color }}
                      >
                        {automation.category[0]}
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: automation.color + "22",
                          color: automation.color,
                        }}
                      >
                        {automation.category}
                      </span>
                    </div>
                    <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary-hover transition shrink-0">
                      <Play size={11} className="text-white ml-0.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-ink mb-1 leading-snug">{automation.title}</h3>
                  <p className="text-xs text-muted mb-4 leading-relaxed">{automation.desc}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted bg-bg-soft border border-line rounded-full px-2.5 py-1">
                      <Sparkles size={11} className="text-warning" />
                      <span className="font-mono">{automation.trigger}</span>
                    </div>
                    <span className="text-[11px] text-muted font-medium">{automation.steps} steps</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "pipelines" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <WifiOff size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">Pipelines</p>
            <p className="text-xs text-muted">Connect GHL to view and manage your pipelines.</p>
          </div>
        )}

        {activeTab === "builder" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Sparkles size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">Automation Builder</p>
            <p className="text-xs text-muted">Build custom automation workflows using the drag-and-drop builder.</p>
          </div>
        )}
      </main>
    </>
  );
}
