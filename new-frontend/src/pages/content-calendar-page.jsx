import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

// ─── Static Data ─────────────────────────────────────────────────────────────

const DAYS = [
  { label: "MON 19", key: "mon" },
  { label: "TUE 20", key: "tue" },
  { label: "WED 21", key: "wed" },
  { label: "THU 22", key: "thu" },
  { label: "FRI 23", key: "fri" },
  { label: "SAT 24", key: "sat" },
  { label: "SUN 25", key: "sun" },
];

const HOURS = [
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
];

// Events keyed by [hourIndex][dayIndex]
// hourIndex: 0=9AM, 1=10AM, 2=11AM, 3=12PM, 4=1PM, 5=2PM, 6=3PM, 7=4PM
// dayIndex:  0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
const EVENTS = {
  "0-0": { title: "Team Standup", color: "bg-green-500" },
  "0-3": { title: "Content Meeting", color: "bg-green-500" },
  "1-1": { title: "Facebook Ads Review", color: "bg-amber-500" },
  "1-5": { title: "Sat Open Day", color: "bg-blue-500" },
  "2-2": { title: "Project Review", color: "bg-green-500" },
  "2-4": { title: "Team Training", color: "bg-blue-500" },
  "3-0": { title: "Client Edit · Ascend", color: "bg-green-500" },
  "3-3": { title: "Webinar Run-thru", color: "bg-green-500" },
  "4-1": { title: "Strategy Call", color: "bg-green-500" },
  "5-2": { title: "Google Ads Sync", color: "bg-green-500" },
  "5-4": { title: "Monthly Report", color: "bg-blue-500" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentCalendarPage() {
  const [view, setView] = useState("week");

  return (
    <>
      <Topbar title="Calendar" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-ink">Calendar</h1>
          <p className="text-sm text-muted mt-0.5">View all events, tasks and meetings</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter />

        {/* Content */}
        <div className="flex gap-6 mt-6 items-start">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-4">
              {/* Left side */}
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white">
                  Today
                </button>
                <button className="w-7 h-7 rounded-lg border border-line text-muted hover:bg-bg-soft text-sm flex items-center justify-center">
                  ‹
                </button>
                <button className="w-7 h-7 rounded-lg border border-line text-muted hover:bg-bg-soft text-sm flex items-center justify-center">
                  ›
                </button>
                <span className="text-sm font-bold text-ink ml-2">May 19 — May 25, 2025</span>
              </div>

              {/* Right side: view switcher */}
              <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1">
                <button
                  onClick={() => setView("week")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-semibold",
                    view === "week" ? "bg-primary text-white" : "text-muted"
                  )}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("month")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-semibold",
                    view === "month" ? "bg-primary text-white" : "text-muted"
                  )}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Week Grid */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {/* Day Headers */}
              <div className="grid border-b border-line" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
                <div className="border-line" />
                {DAYS.map((day) => (
                  <div
                    key={day.key}
                    className="text-center py-3 text-[10px] font-bold text-muted uppercase tracking-wider border-l border-line"
                  >
                    {day.label}
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              {HOURS.map((hour, hIdx) => (
                <div
                  key={hour}
                  className={cn(
                    "grid border-line",
                    hIdx < HOURS.length - 1 ? "border-b" : ""
                  )}
                  style={{ gridTemplateColumns: "60px repeat(7, 1fr)", minHeight: "44px" }}
                >
                  {/* Time Label */}
                  <div className="text-xs text-muted text-right pr-3 py-2 flex-shrink-0">
                    {hour}
                  </div>

                  {/* Day Cells */}
                  {DAYS.map((day, dIdx) => {
                    const event = EVENTS[`${hIdx}-${dIdx}`];
                    return (
                      <div
                        key={day.key}
                        className="border-l border-line relative"
                        style={{ minHeight: "44px" }}
                      >
                        {event && (
                          <div
                            className={cn(
                              "absolute inset-x-1 top-1 bottom-1 px-2 py-1 rounded text-[11px] font-semibold text-white truncate",
                              event.color
                            )}
                          >
                            {event.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
