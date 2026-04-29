import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { api } from "@/api/client";

// Canonical integration list — status merged from backend
const INTEGRATION_CATALOG = [
  { name: "GoHighLevel", provider: "ghl_static", desc: "CRM, automations, pipelines", color: "#f59e0b" },
  { name: "Google Ads", provider: "google", desc: "Ad spend and campaign performance", color: "#3b82f6" },
  { name: "Meta Ads", provider: "meta_system_user", desc: "Facebook and Instagram campaigns", color: "#6366f1" },
  { name: "Google Search Console", provider: "google", desc: "Organic search performance", color: "#10b981" },
  { name: "Google Calendar", provider: "google", desc: "Appointment scheduling sync", color: "#0ea5e9" },
  { name: "Gmail", provider: "google", desc: "Email tracking and follow-ups", color: "#ef4444" },
  { name: "Dentally", provider: "dentally", desc: "Practice management system", color: "#7c3aed" },
  { name: "WhatsApp", provider: "twilio_whatsapp", desc: "Patient messaging", color: "#10b981" },
  { name: "AI Brain", provider: "anthropic", desc: "Claude AI directives and brain", color: "#9333ea" },
];

export default function IntegrationsPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [connectedProviders, setConnectedProviders] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const loadStatus = () => {
    setLoading(true);
    api.integStatus()
      .then((statuses) => {
        setConnectedProviders(new Set(statuses.map((s) => s.provider)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStatus(); }, []);

  const integrations = INTEGRATION_CATALOG.map((i) => ({
    ...i,
    status: connectedProviders.has(i.provider) ? "connected" : "off",
  }));

  const connected = integrations.filter((i) => i.status === "connected").length;
  const disconnected = integrations.filter((i) => i.status === "off").length;

  return (
    <>
      <Topbar title="Integrations" subtitle="Manage connected services" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter
          mode={mode}
          setMode={setMode}
          activeBiz={activeBiz}
          setActiveBiz={setActiveBiz}
          rightAction={
            <button
              onClick={loadStatus}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh All
            </button>
          }
        />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Connected", value: connected, color: "#7c3aed" },
                { label: "Disconnected", value: disconnected, color: "#7c3aed" },
                { label: "Sync Events 24H", value: 1284, color: "#7c3aed" },
                { label: "Errors", value: 0, color: "#7c3aed" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white border border-line rounded-xl p-5">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Integration Cards Grid */}
            <div className="grid grid-cols-3 gap-4">
              {integrations.map((integ) => (
                <div key={integ.name} className="bg-white border border-line rounded-xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: integ.color }}
                      />
                      <div>
                        <p className="text-sm font-bold text-ink">{integ.name}</p>
                        <p className="text-xs text-muted mt-0.5">{integ.desc}</p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      integ.status === "connected"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {integ.status === "connected" ? "Connected" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
