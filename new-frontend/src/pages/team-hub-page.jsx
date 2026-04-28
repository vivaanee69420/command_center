import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, getInitials } from "@/lib/utils";
import { Plus, Trash2, Sparkles, LayoutGrid, List, ChevronDown, ClipboardList } from "lucide-react";

const TEAM = [
  { name: "Gaurav", color: "#0e2a47" },
  { name: "Fatima", color: "#ef4444" },
  { name: "Abhishek", color: "#10b981" },
  { name: "Nikhil", color: "#f59e0b" },
  { name: "Maryam", color: "#16a34a" },
  { name: "Veena", color: "#5b9f61" },
  { name: "Sona", color: "#3b82f6" },
  { name: "Ruhith", color: "#2e75b6" },
];

const TABS = [
  { key: "tasks", label: "Tasks" },
  { key: "automations", label: "Automations" },
  { key: "content", label: "Content" },
  { key: "scripts", label: "Scripts" },
  { key: "documents", label: "Documents" },
  { key: "communication", label: "Communication" },
  { key: "report", label: "Report to Dev" },
];

const KANBAN_COLUMNS = [
  { key: "todo", label: "Todo", count: 0, borderColor: "#3b82f6", bgColor: "bg-info-soft", textColor: "text-info" },
  { key: "in_progress", label: "In Progress", count: 0, borderColor: "#f59e0b", bgColor: "bg-warning-soft", textColor: "text-warning" },
  { key: "done", label: "Done", count: 0, borderColor: "#10b981", bgColor: "bg-primary-soft", textColor: "text-primary" },
];

export default function TeamHubPage() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedMember, setSelectedMember] = useState("All Members");
  const [selectedBusiness, setSelectedBusiness] = useState("All Businesses");
  const [selectedDay, setSelectedDay] = useState("All Days");

  return (
    <>
      <Topbar title="Team Hub" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="👥"
          title="Team Hub"
          subtitle="Unified task management, scripts, and communication"
          actions={[
            {
              label: "Clear All Tasks",
              variant: "danger-outline",
              icon: <Trash2 size={13} />,
            },
            {
              label: "AI Generate Tasks (25 per person)",
              variant: "purple",
              icon: <Sparkles size={13} />,
            },
          ]}
          right={
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-danger text-danger rounded-lg text-xs font-semibold hover:bg-danger-soft transition">
                <Trash2 size={13} />
                Clear All Tasks
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                <Sparkles size={13} />
                AI Generate Tasks (25 per person)
              </button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-5 w-fit flex-wrap">
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

        {activeTab === "tasks" && (
          <>
            {/* Main Task Banner */}
            <div className="mb-5 bg-white border border-line rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                  <ClipboardList size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Main Task → Micro-Tasks</p>
                  <p className="text-xs text-muted">Enter a main objective and AI will break it down</p>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 shrink-0"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <Plus size={13} />
                Create Main Task
              </button>
            </div>

            {/* Team Member Avatars */}
            <div className="mb-5 bg-white border border-line rounded-xl p-4">
              <div className="flex items-center gap-3 flex-wrap">
                {TEAM.map((member) => (
                  <div key={member.name} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer hover:opacity-80 transition"
                      style={{ background: member.color }}
                      title={member.name}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-ink leading-none">{member.name}</p>
                      <p className="text-[9px] text-muted mt-0.5">0/0</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Member Filter */}
              <div className="relative">
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="appearance-none border border-line rounded-lg px-3 py-2 pr-7 text-xs font-medium text-ink outline-none focus:border-primary transition bg-white cursor-pointer"
                >
                  <option>All Members</option>
                  {TEAM.map((m) => <option key={m.name}>{m.name}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Business Filter */}
              <div className="relative">
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="appearance-none border border-line rounded-lg px-3 py-2 pr-7 text-xs font-medium text-ink outline-none focus:border-primary transition bg-white cursor-pointer"
                >
                  <option>All Businesses</option>
                  <option>GM Dental Practices</option>
                  <option>Plan4Growth Academy</option>
                  <option>GM Lab</option>
                  <option>Elevate Accounts</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Day Filter */}
              <div className="relative">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="appearance-none border border-line rounded-lg px-3 py-2 pr-7 text-xs font-medium text-ink outline-none focus:border-primary transition bg-white cursor-pointer"
                >
                  <option>All Days</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition",
                    viewMode === "kanban" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  )}
                >
                  <LayoutGrid size={13} />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition",
                    viewMode === "list" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  )}
                >
                  <List size={13} />
                  List
                </button>
              </div>

              {/* Add Task */}
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <Plus size={13} />
                Add Task
              </button>
            </div>

            {/* Kanban Board */}
            {viewMode === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {KANBAN_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className="bg-white border border-line rounded-xl overflow-hidden"
                    style={{ borderTopWidth: 3, borderTopColor: col.borderColor }}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">{col.label}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", col.bgColor, col.textColor)}>
                          {col.count}
                        </span>
                      </div>
                      <button className="w-6 h-6 rounded-md border border-line flex items-center justify-center text-muted hover:bg-bg-soft transition">
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Empty State */}
                    <div className="p-4 min-h-[200px] flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-bg-shell flex items-center justify-center mb-2">
                        <ClipboardList size={16} className="text-muted" strokeWidth={1.5} />
                      </div>
                      <p className="text-[11px] text-muted font-medium">No tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
                <ClipboardList size={36} className="text-line mb-3" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-ink mb-1">No tasks yet</p>
                <p className="text-xs text-muted">Add tasks or generate them with AI</p>
              </div>
            )}
          </>
        )}

        {activeTab !== "tasks" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Sparkles size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">
              {TABS.find((t) => t.key === activeTab)?.label}
            </p>
            <p className="text-xs text-muted">This section is coming soon.</p>
          </div>
        )}
      </main>
    </>
  );
}
