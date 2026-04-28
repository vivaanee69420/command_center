import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

const ROUTINES = [
  {
    title: "Daily Cash Flash",
    badge: "DAILY · 07:00",
    badgeClass: "bg-green-50 text-green-700",
    steps: [
      "Yesterday's cash collected, per practice",
      "Today's diary value (booked production)",
      "Debtor calls made + cash recovered yesterday",
      "New deposits taken yesterday",
      "Red flags — FTAs, big cancellations, finance declines",
    ],
  },
  {
    title: "Weekly Cash Huddle",
    badge: "FRIDAY · 16:00",
    badgeClass: "bg-blue-50 text-blue-700",
    steps: [
      "Week's cash collected vs target",
      "Next week's diary value vs target",
      "Pipeline: consults booked, TPs presented, conversion %",
      "Top 3 blockers, named owners, deadline",
    ],
  },
  {
    title: "Cash Position Review",
    badge: "SUNDAY · 30 MIN",
    badgeClass: "bg-amber-50 text-amber-700",
    steps: [
      "Bank balance across all entities",
      "Next 30 days payables (rent, salaries, lab, VAT, PAYE)",
      "Next 30 days forecast receivables",
      "Net position — Green / Amber / Red call",
    ],
  },
  {
    title: "Forecast Roll-Forward",
    badge: "LAST FRIDAY/MONTH",
    badgeClass: "bg-purple-50 text-purple-700",
    steps: [
      "Stream-by-stream actual vs forecast cash",
      "Reallocate effort to underperforming streams",
      "Update next 60-day forecast",
      "Decide: drop / double / hold per workstream",
    ],
  },
];

function RoutineCard({ title, badge, badgeClass, steps }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${badgeClass}`}
        >
          {badge}
        </span>
      </div>
      <div>
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-2.5 border-b border-line last:border-0"
          >
            <div className="w-6 h-6 rounded-full bg-bg-soft flex items-center justify-center text-[11px] font-bold text-muted shrink-0">
              {String(i + 1).padStart(2, "0")}
            </div>
            <p className="text-sm text-ink">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DailyRoutinesPage() {
  const [mode, setMode] = useState(null);

  return (
    <>
      <Topbar title="Daily Routines" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Daily Routines</h1>
          <p className="text-sm text-muted mt-1">The cadence that holds it together</p>
        </div>

        <ModeFilter value={mode} onChange={setMode} />

        <div className="flex gap-6 mt-6">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-6">
              {ROUTINES.map((routine, i) => (
                <RoutineCard
                  key={i}
                  title={routine.title}
                  badge={routine.badge}
                  badgeClass={routine.badgeClass}
                  steps={routine.steps}
                />
              ))}
            </div>
          </div>
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
