import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const AUTOMATIONS = [
  { name: "No-show SMS follow-up", trigger: "appointment_noshow", action: "send_sms", status: "active" },
  { name: "New lead auto-assign", trigger: "new_lead", action: "assign_contact", status: "active" },
  { name: "Appointment reminder 24h", trigger: "appointment_24h_before", action: "send_sms_email", status: "active" },
  { name: "Review request after visit", trigger: "appointment_completed", action: "send_review_request", status: "active" },
  { name: "Birthday greeting", trigger: "contact_birthday", action: "send_sms", status: "paused" },
  { name: "Inactive patient re-engagement", trigger: "contact_inactive_180d", action: "send_email_sequence", status: "active" },
  { name: "Treatment plan follow-up", trigger: "treatment_plan_sent", action: "send_sms", status: "active" },
];

export default function GhlAutomationPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");

  return (
    <>
      <Topbar title="GHL Automation" subtitle="Manage workflows and triggers" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter
          mode={mode}
          setMode={setMode}
          activeBiz={activeBiz}
          setActiveBiz={setActiveBiz}
          rightAction={
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              <Plus size={14} />
              New Automation
            </button>
          }
        />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">All Automations</h2>
                <span className="text-xs text-muted">{AUTOMATIONS.length} total</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Automation Name</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Trigger</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Action</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {AUTOMATIONS.map((auto) => (
                    <tr key={auto.name} className="border-b border-line last:border-b-0 hover:bg-bg-soft/50 transition">
                      <td className="px-5 py-3.5 text-sm font-semibold text-ink">{auto.name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted font-mono">{auto.trigger}</td>
                      <td className="px-5 py-3.5 text-sm text-muted font-mono">{auto.action}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                            auto.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {auto.status === "active" ? "Active" : "Paused"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
