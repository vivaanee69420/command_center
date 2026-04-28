import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { Plus } from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const TOP_KPIS = [
  {
    emoji: "📋",
    emojiBg: "bg-purple-50",
    label: "TOTAL LEADS",
    value: "4,320",
    delta: "+12.5% new this month",
  },
  {
    emoji: "📞",
    emojiBg: "bg-blue-50",
    label: "CONTACTED",
    value: "2,150",
    delta: "+8.3% this month",
  },
  {
    emoji: "📅",
    emojiBg: "bg-green-50",
    label: "BOOKED",
    value: "1,024",
    delta: "+15.7% this month",
  },
  {
    emoji: "✅",
    emojiBg: "bg-amber-50",
    label: "CLOSED",
    value: "648",
    delta: "+22.4% explicit +15.0%",
  },
];

const KANBAN_COLUMNS = [
  {
    stage: "NEW",
    value: "£15,600",
    cards: [
      { name: "Sarah Johnson", detail: "Ascend Dental · £4,500" },
      { name: "Michael Brown", detail: "Elite Aesthetics · £5,100" },
      { name: "Jessica Davis", detail: "Prime Wellness · £3,800" },
      { name: "David Wilson", detail: "Nexus Clinics · £2,200" },
    ],
  },
  {
    stage: "CONTACTED",
    value: "£23,900",
    cards: [
      { name: "James Smith", detail: "Future Smiles · £6,800" },
      { name: "Emily Taylor", detail: "Ascend Dental · £5,500" },
      { name: "Chris Lee", detail: "Elite Aesthetics · £8,200" },
      { name: "Amanda White", detail: "Prime Wellness · £3,400" },
    ],
  },
  {
    stage: "BOOKED",
    value: "£13,400",
    cards: [
      { name: "Daniel Clark", detail: "Future Smiles · £3,200" },
      { name: "Olivia Martinez", detail: "Ascend Dental · £4,400" },
      { name: "Ryan Anderson", detail: "£5,800" },
    ],
  },
  {
    stage: "PROPOSAL",
    value: "£23,300",
    cards: [
      { name: "Sophia Thomas", detail: "Prime Wellness · £9,200" },
      { name: "Matthew Harris", detail: "Future Smiles · £6,300" },
      { name: "Isabella Martin", detail: "Nexus Clinics · £7,800" },
    ],
  },
  {
    stage: "CLOSED",
    value: "£18,700",
    cards: [
      { name: "Jack Mensah", detail: "Ascend Dental · £7,500" },
      { name: "Ravi Kumar", detail: "Future Smiles · £11,200" },
    ],
  },
];

const BOTTOM_KPIS = [
  {
    label: "CONVERSION RATE",
    value: "23.7%",
    delta: "+6.2%",
    deltaPositive: true,
  },
  {
    label: "AVG. DEAL VALUE",
    value: "£2,875",
    delta: "+8.5%",
    deltaPositive: true,
  },
  {
    label: "WIN RATE",
    value: "62.3%",
    delta: "+7.1%",
    deltaPositive: true,
  },
  {
    label: "SALES CYCLE",
    value: "18 Days",
    delta: "-2.5%",
    deltaPositive: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [mode, setMode] = useState(null);

  return (
    <>
      <Topbar title="CRM" />

      <main className="p-6 max-w-[1800px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-ink">CRM / Sales Pipeline</h1>
            <p className="text-sm text-muted mt-0.5">Track all your leads and deals</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 transition shadow-sm">
            <Plus size={16} />
            + Add Lead
          </button>
        </div>

        {/* Mode Filter */}
        <ModeFilter value={mode} onChange={setMode} />

        {/* Main layout: content + sidebar */}
        <div className="flex gap-6 mt-5">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {TOP_KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white border border-line rounded-xl p-5"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.emojiBg}`}
                  >
                    <span className="text-lg leading-none">{kpi.emoji}</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-ink">{kpi.value}</p>
                  <p className="text-xs text-green-600 mt-1">{kpi.delta}</p>
                </div>
              ))}
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {KANBAN_COLUMNS.map((col) => (
                <div key={col.stage} className="flex-1 min-w-0">
                  {/* Column header */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">
                      {col.stage}
                    </span>
                    <span className="text-sm font-bold text-ink">{col.value}</span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {col.cards.map((card) => (
                      <div
                        key={card.name}
                        className="bg-white border border-line rounded-lg p-3"
                      >
                        <p className="text-sm font-semibold text-ink">{card.name}</p>
                        <p className="text-xs text-muted">{card.detail}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add lead button */}
                  <button className="text-xs text-muted hover:text-primary mt-2 block">
                    + Add Lead
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom KPI Strip */}
            <div className="grid grid-cols-4 gap-4">
              {BOTTOM_KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white border border-line rounded-xl p-5"
                >
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-ink">{kpi.value}</p>
                  <p
                    className={`text-xs mt-1 ${
                      kpi.deltaPositive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {kpi.delta}
                  </p>
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
