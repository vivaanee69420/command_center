import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

const KPI_ROWS = [
  [
    { label: "Speed to Lead", value: "No data", valueColor: "text-danger", target: "5 mins" },
    { label: "Dials Today", value: "0", valueColor: "text-primary", target: "100" },
    { label: "Lead → Consult Rate", value: "0.2%", valueColor: "text-warning", target: "30%" },
    { label: "No-Show Rate", value: "200%", valueColor: "text-danger", target: "15%" },
  ],
  [
    { label: "Follow-Up Touches", value: "0", valueColor: "text-ink", target: "7" },
    { label: "New Leads Today", value: "0", valueColor: "text-primary", target: "—" },
    { label: "Contacted Today", value: "0", valueColor: "text-primary", target: "0" },
    { label: "Booked Today", value: "0", valueColor: "text-primary", target: "—" },
  ],
];

const TABS = [
  { key: "kpis", label: "KPIs" },
  { key: "objection", label: "Objection Scripts" },
  { key: "noshow", label: "No-Show Recovery" },
];

export default function SetterDashboardPage() {
  const [activeTab, setActiveTab] = useState("kpis");

  return (
    <>
      <Topbar title="Setter / Lead Firewall" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📞"
          title="Setter / Lead Firewall"
          subtitle="Speed-to-lead SLA · No-show recovery · Objection scripts"
          right={
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger bg-danger-soft text-danger text-xs font-semibold">
              <AlertTriangle size={13} />
              No setter hired — est. £42,000/month loss
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-6 w-fit">
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

        {activeTab === "kpis" && (
          <div className="space-y-4">
            {KPI_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {row.map((card) => (
                  <div
                    key={card.label}
                    className="bg-white border border-line rounded-xl p-5"
                    style={{ borderLeftWidth: 4, borderLeftColor: "#10b981" }}
                  >
                    <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">
                      {card.label}
                    </div>
                    <div className={cn("text-3xl font-bold mb-1", card.valueColor)}>
                      {card.value}
                    </div>
                    <div className="text-[11px] text-muted">Target: {card.target}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "objection" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <p className="text-sm font-semibold text-ink mb-1">Objection Scripts</p>
            <p className="text-xs text-muted">Pre-built scripts to handle common objections will appear here.</p>
          </div>
        )}

        {activeTab === "noshow" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <p className="text-sm font-semibold text-ink mb-1">No-Show Recovery</p>
            <p className="text-xs text-muted">Automated recovery workflows for no-show appointments will appear here.</p>
          </div>
        )}
      </main>
    </>
  );
}
