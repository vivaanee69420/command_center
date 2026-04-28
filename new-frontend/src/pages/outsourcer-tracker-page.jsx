import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

// ─── Static Data ──────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: "ACTIVE", value: "5", valueClass: "text-ink" },
  { label: "HOURS USED (WK)", value: "73", valueClass: "text-ink" },
  { label: "BEHIND", value: "1", valueClass: "text-red-500" },
  { label: "SPEND (WK)", value: "£2,258", valueClass: "text-green-600" },
];

const ROSTER = [
  {
    name: "Aman Singh",
    role: "Video editor",
    country: "India",
    hours: "18/20h",
    rate: "£25",
    open: 2,
    status: "on_track",
    statusLabel: "on_track",
    statusClass: "bg-green-50 text-green-600",
  },
  {
    name: "Marta Kowalski",
    role: "Graphic designer",
    country: "Poland",
    hours: "8/15h",
    rate: "£30",
    open: 5,
    status: "behind",
    statusLabel: "behind",
    statusClass: "bg-red-50 text-red-600",
  },
  {
    name: "Carlos Ruiz",
    role: "SEO specialist",
    country: "Spain",
    hours: "14/15h",
    rate: "£35",
    open: 1,
    status: "on_track",
    statusLabel: "on_track",
    statusClass: "bg-green-50 text-green-600",
  },
  {
    name: "Priyanka Sharma",
    role: "Social media manager",
    country: "India",
    hours: "22/20h",
    rate: "£28",
    open: 0,
    status: "ahead",
    statusLabel: "ahead",
    statusClass: "bg-blue-50 text-blue-600",
  },
  {
    name: "Daniel Owen",
    role: "Copywriter",
    country: "UK",
    hours: "11/12h",
    rate: "£42",
    open: 3,
    status: "on_track",
    statusLabel: "on_track",
    statusClass: "bg-green-50 text-green-600",
  },
];

const TABLE_HEADERS = ["NAME", "ROLE", "COUNTRY", "HOURS / CAP", "£/HR", "OPEN", "STATUS"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OutsourcerTrackerPage() {
  const [mode, setMode] = useState("week");

  return (
    <>
      <Topbar title="Outsourcer Tracker" />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Outsourcer Tracker</h1>
          <p className="text-sm text-muted">Hours · cap · status · open tasks</p>
        </div>

        {/* Mode Filter */}
        <ModeFilter mode={mode} onChange={setMode} />

        {/* Content Row */}
        <div className="flex gap-6 mt-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {KPI_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="bg-white border border-line rounded-xl p-5"
                >
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                    {card.label}
                  </p>
                  <p className={cn("text-2xl font-bold", card.valueClass)}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Roster */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {/* Section Header */}
              <div className="px-5 py-4 border-b border-line">
                <h2 className="text-base font-bold text-ink">Roster</h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      {TABLE_HEADERS.map((col) => (
                        <th
                          key={col}
                          className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {ROSTER.map((row) => (
                      <tr key={row.name} className="hover:bg-bg-soft transition">
                        <td className="px-5 py-4 text-sm font-semibold text-ink whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted whitespace-nowrap">
                          {row.role}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted whitespace-nowrap">
                          {row.country}
                        </td>
                        <td className="px-5 py-4 text-sm text-ink whitespace-nowrap">
                          {row.hours}
                        </td>
                        <td className="px-5 py-4 text-sm text-ink whitespace-nowrap">
                          {row.rate}
                        </td>
                        <td className="px-5 py-4 text-sm text-ink whitespace-nowrap">
                          {row.open}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                              row.statusClass
                            )}
                          >
                            {row.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
