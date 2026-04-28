import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

// ─── Static Data ──────────────────────────────────────────────────────────────

const TASKS = [
  { id: 1,  title: "Create Facebook Ad Campaign", priority: "P0", business: "Warwick", owner: "NK", due: "22 May" },
  { id: 2,  title: "SEO Audit & Fixes",            priority: "P1", business: "Maidstone", owner: "RU", due: "23 May" },
  { id: 3,  title: "Content Calendar — June",      priority: "P1", business: "FTS",      owner: "NK", due: "25 May" },
  { id: 4,  title: "Google Ads Optimisation",      priority: "P0", business: "Warwick",  owner: "RU", due: "20 May" },
  { id: 5,  title: "Website Redesign",             priority: "P0", business: "P4G",      owner: "MM", due: "24 May" },
  { id: 6,  title: "Email Automation Setup",       priority: "P1", business: "Maidstone", owner: "NK", due: "26 May" },
  { id: 7,  title: "Landing Page Review",          priority: "P1", business: "FTS",      owner: "NR", due: "19 May" },
  { id: 8,  title: "Ad Copy Review",               priority: "P1", business: "Warwick",  owner: "NK", due: "18 May" },
  { id: 9,  title: "Monthly Report — May",         priority: "P2", business: "All",      owner: "NR", due: "16 May" },
  { id: 10, title: "Social Media Strategy",        priority: "P2", business: "P4G",      owner: "NK", due: "15 May" },
  { id: 11, title: "Competitor Analysis",          priority: "P2", business: "All",      owner: "GM", due: "14 May" },
];

const PRIORITY_BG = {
  P0: "bg-red-500",
  P1: "bg-amber-500",
  P2: "bg-blue-500",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimpleTasksPage() {
  return (
    <>
      <Topbar title="All Tasks" subtitle="Everything assigned · sortable" />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* ModeFilter */}
        <ModeFilter />

        {/* Content + Sidebar */}
        <div className="flex gap-6 mt-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tasks Card */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">Tasks</span>
                <span className="text-xs text-muted">11 total</span>
              </div>

              {/* Task List */}
              <div className="divide-y divide-line">
                {TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="px-5 py-3.5 hover:bg-bg-soft/50 transition"
                  >
                    {/* Title */}
                    <p className="text-sm font-semibold text-ink border-l-[3px] border-l-primary pl-3">
                      {task.title}
                    </p>

                    {/* Meta Row */}
                    <div className="flex items-center gap-2 mt-1.5 pl-3">
                      {/* Priority Badge */}
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                          PRIORITY_BG[task.priority]
                        )}
                      >
                        {task.priority}
                      </span>

                      {/* Business Pill */}
                      <span className="text-[10px] bg-bg-soft border border-line px-2 py-0.5 rounded-full text-muted">
                        🏢 {task.business}
                      </span>

                      {/* Owner */}
                      <span className="text-[10px] text-muted">
                        👤 {task.owner}
                      </span>

                      {/* Due Date */}
                      <span className="text-[10px] text-muted">
                        · due {task.due}
                      </span>
                    </div>
                  </div>
                ))}
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
