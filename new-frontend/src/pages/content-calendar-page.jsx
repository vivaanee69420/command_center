import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

// ─── Static Data ─────────────────────────────────────────────────────────────

// DAYS, HOURS, EVENTS removed — calendar requires a backend calendar/events endpoint.

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

            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Calendar Backend</p>
                <p className="text-xs text-amber-600 leading-relaxed">The content calendar requires a backend <code className="font-mono bg-amber-100 px-1 rounded">calendar_event</code> model and <code className="font-mono bg-amber-100 px-1 rounded">GET /api/calendar/events</code> endpoint. Connect to Google Calendar or build a native events table.</p>
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
