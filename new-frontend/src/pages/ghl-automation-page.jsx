import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { api } from "@/api/client";

export default function GhlAutomationPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.automations()
      .then(setAutomations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
                <span className="text-xs text-muted">{automations.length} total</span>
              </div>

              {loading ? (
                <div className="px-5 py-6 text-sm text-muted">Loading automations...</div>
              ) : automations.length === 0 ? (
                <div className="px-5 py-6 text-sm text-muted">No automation rules yet. Click New Automation to create one.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Automation Name</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Trigger</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Action</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Last Fired</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automations.map((auto) => (
                      <tr key={auto.id} className="border-b border-line last:border-b-0 hover:bg-bg-soft/50 transition">
                        <td className="px-5 py-3.5 text-sm font-semibold text-ink">{auto.name}</td>
                        <td className="px-5 py-3.5 text-sm text-muted font-mono">{auto.trigger_kind}</td>
                        <td className="px-5 py-3.5 text-sm text-muted font-mono">{auto.action_kind}</td>
                        <td className="px-5 py-3.5 text-sm text-muted">
                          {auto.last_fired_at ? new Date(auto.last_fired_at).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                            auto.enabled ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                          )}>
                            {auto.enabled ? "Active" : "Paused"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
