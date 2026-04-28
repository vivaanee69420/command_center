import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

// ─── Static Data ──────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: "phase-1",
    title: "Phase 1 · Days 1-30",
    owners: "Gaurav + Nadia",
    focusLabel: "Cash + Backlog",
    items: [
      "Lock deposit policy + cancellation policy across all 5 practices",
      "Pull all unconverted implant enquiries · filter to simple cases",
      "Block 2 surgical half-days/week (Bexleyheath Mon · Rochester Tue)",
      "Identify strongest TCO · assign to consult days",
      "Aged debtors blitz · phone every >30 day debtor",
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2 · Days 31-60",
    owners: "Maryam + Nikhil",
    focusLabel: "Convert + Activate",
    items: [
      "Run 6-8 consult slots/week from backlog",
      "Launch academy patient Meta campaign · £1,500/m",
      "Routine internal referrals · 8/PM/month into academy",
      "Lapsed patient blast · 12-24m no-shows reactivated",
      "Hygiene → 40-min slots tested with whitening upsell",
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3 · Days 61-90",
    owners: "Full team",
    focusLabel: "Operate + Scale",
    items: [
      "60+ academy implants placed · cohort fully booked",
      "Restorative work routed back to GM Dental · 50 cases x £1k",
      "Weekly cash flash + Friday huddle running on rails",
      "Forecast roll-forward · drop/double/hold per workstream",
      "Bright Smile counter-positioning campaign live",
    ],
  },
];

// ─── Phase Card ───────────────────────────────────────────────────────────────

function PhaseCard({ phase }) {
  const [focusWord, ...focusRest] = phase.focusLabel.split(" + ");

  return (
    <div className="bg-white border border-line rounded-xl p-5 flex-1">
      {/* Header row */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-base font-bold text-ink">{phase.title}</span>
        <span className="text-xs text-muted flex items-center gap-1">
          {"👤"} {phase.owners}
        </span>
      </div>

      {/* Focus line */}
      <p className="text-xs text-muted mb-4">
        Focus:{" "}
        <span className="font-semibold text-ink">{phase.focusLabel}</span>
      </p>

      {/* Numbered action items */}
      <div>
        {phase.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 py-2.5 border-b border-line last:border-0"
          >
            <span className="w-6 h-6 rounded-full bg-bg-soft flex items-center justify-center text-[11px] font-bold text-muted shrink-0">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-ink leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  return (
    <>
      <Topbar title="90-Day Plan" />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page heading */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-ink">90-Day Plan</h1>
          <p className="text-xs text-muted mt-0.5">Phase 1 → 2 → 3 · group-wide</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter />

        {/* Body: main content + sidebar */}
        <div className="flex gap-6 mt-6">
          {/* Phase columns */}
          <div className="flex gap-6 flex-1">
            {PHASES.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} />
            ))}
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
