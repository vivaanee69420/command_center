import { useState, useEffect } from "react";
import { api } from "@/api/client";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { BUSINESSES, USERS_DEFAULT } from "@/lib/data";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Calendar,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

// LEADS_QUEUE removed — leads fetched from api.leads("lead") below.

const STATUS_FLOW = ["Not Called", "Called", "Connected", "Appointment Set", "Follow Up", "Not Interested"];

// CALL_LOG removed — requires backend call_log table. Add model + POST /api/calls endpoint.

// SCRIPTS removed — requires backend scripts table. Add model + CRUD endpoints to manage call scripts.

// PERFORMANCE_DATA removed — computed from call_log backend (pending).

const OUTCOME_COLORS = {
  "Appointment Set": "text-green-600 font-semibold",
  "Follow Up": "text-amber-600",
  "Not Interested": "text-red-500",
  "No Answer": "text-muted",
  Connected: "text-blue-600",
};

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const STATUS_COLORS = {
  "Not Called": "bg-bg-shell text-muted",
  Called: "bg-blue-100 text-blue-700",
  Connected: "bg-indigo-100 text-indigo-700",
  "Appointment Set": "bg-green-100 text-green-700",
  "Follow Up": "bg-amber-100 text-amber-700",
  "Not Interested": "bg-red-100 text-red-700",
};

const TABS = ["Today's Queue", "Call Log", "Scripts", "Performance"];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5" style={{ borderLeftWidth: 4, borderLeftColor: color || "#7c3aed" }}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-bold text-ink mb-0.5">{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

function QueueTab({ leads, setLeads, filterPractice }) {
  const filtered = filterPractice === "All"
    ? leads
    : leads.filter((l) => l.practice === filterPractice);

  function cycleStatus(id) {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = STATUS_FLOW.indexOf(l.status);
        const next = STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
        return { ...l, status: next };
      })
    );
  }

  function updateNote(id, val) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: val } : l)));
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((lead) => (
        <div
          key={lead.id}
          className="bg-white border border-line rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-3"
        >
          {/* Priority indicator */}
          <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", PRIORITY_COLORS[lead.priority])}>
              {lead.priority.toUpperCase()}
            </span>
          </div>

          {/* Lead info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
              <span className="text-sm font-bold text-ink">{lead.name}</span>
              <span className="text-xs text-muted">{lead.practice}</span>
              <span className="text-[11px] bg-bg-soft border border-line rounded px-1.5 py-0.5 text-muted">{lead.source}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted mb-2">
              <Clock size={11} />
              Best time: {lead.bestTime}
            </div>
            <input
              type="text"
              placeholder="Add notes…"
              value={lead.notes}
              onChange={(e) => updateNote(lead.id, e.target.value)}
              className="w-full border border-line rounded-lg px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary transition bg-bg-soft"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <a
              href={`tel:${lead.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-[#6d28d9] transition"
            >
              <PhoneCall size={13} />
              {lead.phone}
            </a>
            <button
              onClick={() => cycleStatus(lead.id)}
              className={cn(
                "text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition",
                STATUS_COLORS[lead.status]
              )}
            >
              {lead.status}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CallLogTab() {
  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-sm font-bold text-ink mb-4">Call Log</h3>
      <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Call Logging Backend</p>
          <p className="text-xs text-amber-600 leading-relaxed">Call log requires a backend <code className="font-mono bg-amber-100 px-1 rounded">call_log</code> table linked to leads. Add the model, migration, and <code className="font-mono bg-amber-100 px-1 rounded">POST /api/calls</code> endpoint. SDRs will log calls via that endpoint; this tab will read from it.</p>
        </div>
      </div>
    </div>
  );
}

// ScriptCard removed — requires backend scripts table.

function PerformanceTab() {
  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-sm font-bold text-ink mb-4">Setter Performance</h3>
      <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Call Log Backend</p>
          <p className="text-xs text-amber-600 leading-relaxed">SDR performance metrics (calls made, connect rate, appointments set, show rate) are computed from the call log. Build the <code className="font-mono bg-amber-100 px-1 rounded">call_log</code> backend model first, then this tab will aggregate real data from it.</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SetterDashboardPage() {
  const [activeTab, setActiveTab] = useState("Today's Queue");
  const [leads, setLeads] = useState([]);
  const [filterPractice, setFilterPractice] = useState("All");

  // Load real leads from API and merge with queue format
  useEffect(() => {
    api.leads("lead")
      .then((apiLeads) => {
        const mapped = apiLeads.map((l, i) => ({
          id: l.id || i + 1,
          name: l.name || "Unknown",
          phone: l.phone || "—",
          practice: l.business_id || "Unknown",
          source: l.source || "Unknown",
          bestTime: "—",
          priority: l.value_est && l.value_est > 5000 ? "high" : l.value_est && l.value_est > 2000 ? "medium" : "low",
          status: "Not Called",
          notes: l.persona || "",
        }));
        setLeads(mapped);
      })
      .catch(() => {}); // keep static fallback on error
  }, []);

  // KPIs depend on call_log backend (pending) — showing placeholder values until backend exists
  const practiceOptions = ["All", ...BUSINESSES.map((b) => b.name)];

  const KPIS = [
    { label: "Calls Today", value: "—", sub: "Pending call log backend", color: "#7c3aed" },
    { label: "Connected", value: "—", sub: "Pending call log backend", color: "#3b82f6" },
    { label: "Appointments Set", value: leads.filter((l) => l.status === "Appointment Set").length, sub: "From today's queue", color: "#10b981" },
    { label: "Show Rate", value: "—", sub: "Pending call log backend", color: "#f59e0b" },
    { label: "Pipeline Value", value: "—", sub: "Pending call log backend", color: "#7c3aed" },
  ];

  return (
    <>
      <Topbar title="Setter / SDR Dashboard" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📞"
          title="Setter / SDR Dashboard"
          subtitle="Call queue · Scripts · Performance tracking"
        />

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {KPIS.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Filters + Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap",
                  activeTab === tab ? "bg-primary text-white" : "text-muted hover:text-ink"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted" />
            <select
              value={filterPractice}
              onChange={(e) => setFilterPractice(e.target.value)}
              className="border border-line rounded-lg px-2 py-1.5 text-xs text-ink bg-white outline-none focus:border-primary transition"
            >
              {practiceOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "Today's Queue" && (
          <QueueTab leads={leads} setLeads={setLeads} filterPractice={filterPractice} />
        )}

        {activeTab === "Call Log" && (
          <CallLogTab filterPractice={filterPractice} />
        )}

        {activeTab === "Scripts" && (
          <div className="bg-white border border-line rounded-xl p-6">
            <h3 className="text-sm font-bold text-ink mb-4">Call Scripts</h3>
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Scripts Backend</p>
                <p className="text-xs text-amber-600 leading-relaxed">Call scripts require a backend <code className="font-mono bg-amber-100 px-1 rounded">script</code> table. Add the model, migration, and CRUD endpoints so scripts can be managed from an admin panel and served here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Performance" && <PerformanceTab />}
      </main>
    </>
  );
}
