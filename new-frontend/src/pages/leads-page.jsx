import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";

const leads = [
  {
    name: "Sarah Patel",
    stage: "new",
    stageBadge: "bg-green-100 text-green-700",
    source: "Meta",
    value: "£4,500",
    phone: "07700 900123",
    note: "Implant enquiry · single tooth",
  },
  {
    name: "James O'Connor",
    stage: "contacted",
    stageBadge: "bg-blue-100 text-blue-700",
    source: "Google",
    value: "£6,800",
    phone: "07700 900456",
    note: "Composite bonding 6 teeth",
  },
  {
    name: "Aisha Khan",
    stage: "booked",
    stageBadge: "bg-purple-100 text-purple-700",
    source: "Referral",
    value: "£3,200",
    phone: "07700 900789",
    note: "Whitening + hygiene",
  },
  {
    name: "Tom Whitfield",
    stage: "new",
    stageBadge: "bg-green-100 text-green-700",
    source: "Meta",
    value: "£5,100",
    phone: "07700 900012",
    note: "Veneers consult requested",
  },
  {
    name: "Emma Robinson",
    stage: "proposal",
    stageBadge: "bg-amber-100 text-amber-700",
    source: "GHL",
    value: "£9,200",
    phone: "07700 900345",
    note: "Academy implant · 2 teeth",
  },
  {
    name: "Jack Mensah",
    stage: "won",
    stageBadge: "bg-emerald-100 text-emerald-700",
    source: "Referral",
    value: "£7,500",
    phone: "07700 900678",
    note: "Implant + crown · paid 50%",
  },
];

export default function LeadsPage() {
  const [mode, setMode] = useState("all");

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Leads"
        subtitle="All leads from GHL · 6 in last 30d"
      />

      <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
        <ModeFilter mode={mode} onChange={setMode} />

        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {/* Section header */}
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">Recent leads</span>
                <span className="text-sm text-muted">6</span>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Name</th>
                    <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Stage</th>
                    <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Source</th>
                    <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Value</th>
                    <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Phone</th>
                    <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr
                      key={index}
                      className="border-b border-line last:border-0 hover:bg-bg-soft/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-ink">{lead.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${lead.stageBadge}`}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted">{lead.source}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted">{lead.value}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted font-mono">{lead.phone}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted">{lead.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
