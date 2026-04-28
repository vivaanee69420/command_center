import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static Data ──────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key: "todo",
    label: "TO DO",
    cards: [
      { id: 1, title: "Create Facebook Ad Campaign", business: "Warwick", initials: "NK", color: "#f59e0b", date: "22 May" },
      { id: 2, title: "SEO Audit & Fixes", business: "Maidstone", initials: "RU", color: "#2e75b6", date: "23 May" },
      { id: 3, title: "Content Calendar — June", business: "FTS", initials: "NK", color: "#f59e0b", date: "25 May" },
    ],
  },
  {
    key: "in_progress",
    label: "IN PROGRESS",
    cards: [
      { id: 4, title: "Google Ads Optimisation", business: "Warwick", initials: "RU", color: "#2e75b6", date: "20 May" },
      { id: 5, title: "Website Redesign", business: "P4G", initials: "MM", color: "#16a34a", date: "24 May" },
      { id: 6, title: "Email Automation Setup", business: "Maidstone", initials: "NK", color: "#f59e0b", date: "26 May" },
    ],
  },
  {
    key: "review",
    label: "REVIEW",
    cards: [
      { id: 7, title: "Landing Page Review", business: "FTS", initials: "NR", color: "#7c3aed", date: "19 May" },
      { id: 8, title: "Ad Copy Review", business: "Warwick", initials: "NK", color: "#f59e0b", date: "18 May" },
    ],
  },
  {
    key: "done",
    label: "DONE",
    cards: [
      { id: 9, title: "Monthly Report — May", business: "All", initials: "NR", color: "#7c3aed", date: "16 May" },
      { id: 10, title: "Social Media Strategy", business: "P4G", initials: "NK", color: "#f59e0b", date: "15 May" },
      { id: 11, title: "Competitor Analysis", business: "All", initials: "GM", color: "#0e2a47", date: "14 May" },
    ],
  },
];

// ─── Card Component ────────────────────────────────────────────────────────────

function KanbanCard({ card }) {
  return (
    <div className="bg-white border border-line rounded-xl p-4 hover:shadow-sm transition">
      <p className="text-sm font-semibold text-ink">{card.title}</p>
      <p className="text-xs text-muted mt-1">{card.business}</p>
      <div className="flex items-center gap-2 mt-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ backgroundColor: card.color }}
        >
          {card.initials}
        </span>
        <span className="text-[11px] text-muted">{card.date}</span>
      </div>
    </div>
  );
}

// ─── Column Component ──────────────────────────────────────────────────────────

function KanbanColumn({ column }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          {column.label}
        </span>
        <span className="text-xs text-muted">{column.cards.length}</span>
      </div>
      <div className="space-y-3">
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KanbanBoardPage() {
  return (
    <>
      <Topbar title="Kanban Board" subtitle="Drag tasks across columns" />

      <main className="p-6 max-w-[1800px] mx-auto w-full">
        <ModeFilter />

        <div className="flex gap-6 mt-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-4">
              {COLUMNS.map((column) => (
                <KanbanColumn key={column.key} column={column} />
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
