import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";

const ENTITY_TYPES = [
  { label: "Practices", color: "#10b981", bg: "#f0fdf4", border: "#10b981", target: 5 },
  { label: "Lab", color: "#3b82f6", bg: "#eff6ff", border: "#3b82f6", target: 5 },
  { label: "Academy", color: "#f97316", bg: "#fff7ed", border: "#f97316", target: 5 },
  { label: "Accounts", color: "#ec4899", bg: "#fdf2f8", border: "#ec4899", target: 5 },
];

// Week: 26 Apr - 2 May 2026 (Sun=27 Apr ... wait, spec says Sun-Sat)
// Today is Tue 28 Apr 2026
const WEEK_DAYS = [
  { day: "Sun", date: 26, month: "Apr", isToday: false },
  { day: "Mon", date: 27, month: "Apr", isToday: false },
  { day: "Tue", date: 28, month: "Apr", isToday: true },
  { day: "Wed", date: 29, month: "Apr", isToday: false },
  { day: "Thu", date: 30, month: "Apr", isToday: false },
  { day: "Fri", date: 1, month: "May", isToday: false },
  { day: "Sat", date: 2, month: "May", isToday: false },
];

const VIEWS = ["Daily", "Weekly", "Monthly"];

export default function ContentCalendarPage() {
  const [activeView, setActiveView] = useState("Weekly");
  const [weekLabel] = useState("26 Apr - 2 May 2026");

  return (
    <>
      <Topbar title="Content Calendar" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          title="Content Calendar"
          subtitle="Schedule and track content across all businesses"
          right={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                <Sparkles size={14} />
                AI Generate
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition">
                <Plus size={14} />
                Add Content
              </button>
            </div>
          }
        />

        {/* Today's Content Target */}
        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-ink">Today's Content Target</h2>
            <span className="text-2xl font-bold text-red-500">0 / 20</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ENTITY_TYPES.map((entity) => (
              <div
                key={entity.label}
                className="rounded-xl p-4 border-t-4"
                style={{ backgroundColor: entity.bg, borderTopColor: entity.border }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: entity.color }}>{entity.label}</span>
                  <span className="text-xs font-bold text-muted">0/{entity.target}</span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden border border-line">
                  <div className="h-full rounded-full" style={{ width: "0%", backgroundColor: entity.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Week navigation + view toggle */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button className="p-1.5 border border-line rounded-lg hover:bg-bg-soft transition">
                <ChevronLeft size={14} className="text-muted" />
              </button>
              <button className="p-1.5 border border-line rounded-lg hover:bg-bg-soft transition">
                <ChevronRight size={14} className="text-muted" />
              </button>
            </div>
            <span className="text-sm font-semibold text-ink">{weekLabel}</span>
            <button className="px-3 py-1.5 border border-line rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-bg-soft transition">
              Today
            </button>
          </div>
          <div className="flex items-center bg-bg-soft border border-line rounded-lg p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                  activeView === v ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="bg-white border border-line rounded-xl overflow-hidden mb-6">
          <div className="grid grid-cols-7">
            {WEEK_DAYS.map((day) => (
              <div
                key={day.day + day.date}
                className={cn(
                  "border-r border-line last:border-r-0 p-3 min-h-[200px] flex flex-col",
                  day.isToday ? "ring-2 ring-inset ring-teal-400 bg-teal-50/30" : "bg-white"
                )}
              >
                {/* Header */}
                <div className="text-center mb-2">
                  <p className={cn("text-[10px] font-semibold uppercase tracking-wide", day.isToday ? "text-teal-600" : "text-muted")}>
                    {day.day}
                  </p>
                  <p className={cn("text-2xl font-bold leading-tight", day.isToday ? "text-teal-600" : "text-ink")}>
                    {day.date}
                  </p>
                  <p className={cn("text-[10px] font-semibold mt-1", day.isToday ? "text-red-500" : "text-muted")}>
                    0/20
                  </p>
                </div>

                {/* Entity dots */}
                <div className="space-y-1.5 mb-3">
                  {ENTITY_TYPES.map((entity) => (
                    <div key={entity.label} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entity.color }} />
                      <span className="text-[9px] text-muted font-medium">0/{entity.target}</span>
                    </div>
                  ))}
                </div>

                {/* Add button */}
                <button className="mt-auto flex items-center justify-center gap-1 w-full py-1.5 border border-dashed border-line rounded-lg text-[10px] font-medium text-muted hover:border-primary hover:text-primary transition">
                  <Plus size={10} />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 flex-wrap">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">Legend:</span>
          {ENTITY_TYPES.map((entity) => (
            <div key={entity.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entity.color }} />
              <span className="text-xs text-muted font-medium">{entity.label}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
