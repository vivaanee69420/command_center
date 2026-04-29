import { useState, useMemo, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import KpiCard from "@/components/shared/kpi-card";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";
import { api } from "@/api/client";
import {
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Tag,
} from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const STAGE_MAP = {
  lead: "New Lead",
  new: "New Lead",
  contacted: "New Lead",
  booked: "Appointment Set",
  proposal: "Treatment Presented",
  won: "Won",
  lost: "Lost",
};

function timeAgo(ts) {
  if (!ts) return "—";
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// APPOINTMENTS, CAMPAIGNS removed — requires GHL appointments/campaigns API integration.
const APPOINTMENTS = [];
const CAMPAIGNS = [];

// Pipeline stages and their order
const PIPELINE_STAGES = [
  { key: "New Lead", color: "#3b82f6", bg: "#eff6ff" },
  { key: "Appointment Set", color: "#8b5cf6", bg: "#f5f3ff" },
  { key: "Showed Up", color: "#f59e0b", bg: "#fffbeb" },
  { key: "Treatment Presented", color: "#0ea5e9", bg: "#f0f9ff" },
  { key: "Won", color: "#10b981", bg: "#ecfdf5" },
  { key: "Lost", color: "#ef4444", bg: "#fef2f2" },
];

const APPT_STATUS_STYLES = {
  Confirmed: { bg: "#ecfdf5", color: "#10b981", icon: CheckCircle },
  Pending: { bg: "#fffbeb", color: "#f59e0b", icon: AlertCircle },
  "No-show": { bg: "#fef2f2", color: "#ef4444", icon: XCircle },
};

const CAMPAIGN_TYPE_STYLES = {
  Both: { bg: "#ede9fe", color: "#7c3aed" },
  Email: { bg: "#eff6ff", color: "#3b82f6" },
  SMS: { bg: "#ecfdf5", color: "#10b981" },
};

const PRACTICES_FILTER = ["All Practices", ...BUSINESSES.map((b) => b.name)];

const TABS = ["Pipeline", "Contacts", "Appointments", "Campaigns"];

// ─── Contact Avatar ────────────────────────────────────────────────────────────
function Avatar({ name, color = "#7c3aed" }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
      style={{ background: color }}
    >
      {getInitials(name)}
    </div>
  );
}

const AVATAR_COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#14b8a6", "#8b5cf6", "#0ea5e9"];
function avatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

// ─── Pipeline Kanban ──────────────────────────────────────────────────────────
function PipelineBoard({ contacts }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const cards = contacts.filter((c) => c.stage === stage.key);
        const stageValue = cards.reduce((s, c) => s + c.value, 0);
        return (
          <div key={stage.key} className="flex-1 min-w-[200px] max-w-[240px]">
            <div
              className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
              style={{ background: stage.bg }}
            >
              <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.key}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: stage.color }}
              >
                {cards.length}
              </span>
            </div>
            {stageValue > 0 && (
              <div className="text-[10px] text-muted mb-2 px-1">{formatCurrency(stageValue)} pipeline</div>
            )}
            <div className="space-y-2">
              {cards.map((c) => {
                const daysSince = ["30m ago", "1h ago", "2h ago", "3h ago", "4h ago", "5h ago", "6h ago", "8h ago"].includes(c.lastContact) ? 0 : 1;
                return (
                  <div
                    key={c.id}
                    className="bg-white border border-line rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Avatar name={c.name} color={avatarColor(c.id)} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-ink truncate">{c.name}</div>
                        <div className="text-[10px] text-muted">{c.practice}</div>
                      </div>
                    </div>
                    {c.value > 0 && (
                      <div className="text-[11px] font-bold text-ink mb-1">{formatCurrency(c.value)}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 1).map((t) => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-soft text-muted font-medium">{t}</span>
                        ))}
                      </div>
                      <span className="text-[9px] text-muted flex items-center gap-0.5">
                        <Clock size={8} /> {c.lastContact}
                      </span>
                    </div>
                  </div>
                );
              })}
              {cards.length === 0 && (
                <div className="border-2 border-dashed border-line rounded-xl py-6 text-center text-[10px] text-muted">
                  No contacts
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GhlDashboardPage() {
  const [activeTab, setActiveTab] = useState("Pipeline");
  const [practiceFilter, setPracticeFilter] = useState("All Practices");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Fetch contacts + opportunities live from GHL API
    Promise.allSettled([
      api.liveGhlContacts(),
      api.liveGhlOpportunities(),
    ]).then(([contactsRes, oppsRes]) => {
      const liveContacts = contactsRes.status === "fulfilled"
        ? (contactsRes.value?.contacts || [])
        : [];
      const liveOpps = oppsRes.status === "fulfilled"
        ? (oppsRes.value?.opportunities || [])
        : [];

      // Build value/stage map from opportunities keyed by contact_id
      const oppByContact = {};
      for (const opp of liveOpps) {
        if (opp.contact_id) {
          oppByContact[opp.contact_id] = opp;
        }
      }

      setContacts(liveContacts.map((c, i) => {
        const opp = oppByContact[c.id] || {};
        return {
          id: c.id || i,
          name: c.name || "Unknown",
          email: c.email || "",
          phone: c.phone || "",
          practice: c.business || c.slug || "Unknown",
          stage: opp.stage || STAGE_MAP[c.stage?.toLowerCase()] || "New Lead",
          lastContact: c.last_activity ? timeAgo(c.last_activity) : "—",
          tags: c.tags?.length ? c.tags : (c.source ? [c.source] : []),
          value: opp.value || 0,
        };
      }));
    }).catch(console.error);
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (practiceFilter !== "All Practices" && c.practice !== practiceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.practice.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contacts, practiceFilter, search]);

  const filteredAppointments = useMemo(() => {
    return APPOINTMENTS.filter((a) => practiceFilter === "All Practices" || a.practice === practiceFilter);
  }, [practiceFilter]);

  const filteredCampaigns = useMemo(() => {
    return CAMPAIGNS.filter((c) => practiceFilter === "All Practices" || c.practice === "All" || c.practice === practiceFilter);
  }, [practiceFilter]);

  const totalContacts = contacts.length;
  const pipelineValue = contacts.filter((c) => !["Won", "Lost"].includes(c.stage)).reduce((s, c) => s + c.value, 0);
  const openOpps = contacts.filter((c) => !["Won", "Lost"].includes(c.stage)).length;
  const apptToday = APPOINTMENTS.length;
  const smsSent = 148;

  const confirmedCount = APPOINTMENTS.filter((a) => a.status === "Confirmed").length;
  const noShowCount = APPOINTMENTS.filter((a) => a.status === "No-show").length;

  return (
    <>
      <Topbar title="GHL Dashboard" subtitle="GoHighLevel CRM — pipeline, contacts & appointments" />
      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-6">

        <PageHeader icon="🔗" title="GHL Dashboard" subtitle="GoHighLevel CRM — contacts, pipeline, appointments, and campaigns" />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard label="Total Contacts" value={totalContacts} icon="people" delta={12.5} subtitle="All practices" borderColor="#7c3aed" />
          <KpiCard label="Pipeline Value" value={pipelineValue} icon="$" delta={null} extra="Active opps" subtitle="Excl. Won/Lost" borderColor="#10b981" />
          <KpiCard label="Open Opportunities" value={openOpps} icon="people" delta={8.3} subtitle="In active stages" borderColor="#3b82f6" />
          <KpiCard label="Appointments Today" value={apptToday} icon="calendar" delta={null} extra={`${confirmedCount} confirmed`} subtitle={`${noShowCount} no-show`} borderColor="#f59e0b" />
          <KpiCard label="SMS Sent Today" value={smsSent} icon="check" delta={null} extra="3 campaigns" subtitle="Across all practices" borderColor="#ef4444" />
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-line rounded-xl px-5 py-3 flex flex-wrap items-center gap-4">
          <Filter size={14} className="text-muted shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Practice:</span>
            <select
              value={practiceFilter}
              onChange={(e) => setPracticeFilter(e.target.value)}
              className="text-xs border border-line rounded-lg px-3 py-1.5 text-ink bg-white focus:outline-none focus:border-purple-400"
            >
              {PRACTICES_FILTER.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          {(activeTab === "Contacts" || activeTab === "Pipeline") && (
            <div className="flex items-center gap-2 ml-auto">
              <Search size={13} className="text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="text-xs border border-line rounded-lg px-3 py-1.5 text-ink bg-white focus:outline-none focus:border-purple-400 w-48"
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-line">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-muted hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── PIPELINE TAB ────────────────────────────────────── */}
        {activeTab === "Pipeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="font-semibold text-ink">{filteredContacts.length} contacts</span>
                <span>Total value: <span className="font-semibold text-ink">{formatCurrency(filteredContacts.reduce((s, c) => s + c.value, 0))}</span></span>
              </div>
            </div>
            <PipelineBoard contacts={filteredContacts} />
          </div>
        )}

        {/* ── CONTACTS TAB ─────────────────────────────────────── */}
        {activeTab === "Contacts" && (
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Contacts</h3>
              <span className="text-xs text-muted">{filteredContacts.length} of {CONTACTS.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bg-soft border-b border-line">
                    <th className="text-left px-5 py-3 text-muted font-semibold uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold uppercase tracking-wide">Practice</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold uppercase tracking-wide">Stage</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold uppercase tracking-wide">Tags</th>
                    <th className="text-right px-4 py-3 text-muted font-semibold uppercase tracking-wide">Value</th>
                    <th className="text-right px-5 py-3 text-muted font-semibold uppercase tracking-wide">Last Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c, i) => {
                    const stage = PIPELINE_STAGES.find((s) => s.key === c.stage) || { color: "#64748b", bg: "#f1f5f9" };
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          "border-b border-line last:border-0 hover:bg-bg-soft transition-colors cursor-pointer",
                          i % 2 === 0 ? "bg-white" : "bg-bg-soft/30"
                        )}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} color={avatarColor(c.id)} />
                            <div>
                              <div className="font-semibold text-ink">{c.name}</div>
                              <div className="text-muted flex items-center gap-2 mt-0.5">
                                <Mail size={9} className="shrink-0" />
                                <span className="truncate max-w-[150px]">{c.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink">{c.practice}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: stage.bg, color: stage.color }}
                          >
                            {c.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.tags.map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded-full bg-bg-soft text-muted font-medium text-[10px] flex items-center gap-0.5">
                                <Tag size={7} /> {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink">
                          {c.value > 0 ? formatCurrency(c.value) : <span className="text-muted">—</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-muted flex items-center justify-end gap-1">
                          <Clock size={9} /> {c.lastContact}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">No contacts match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ─────────────────────────────────── */}
        {activeTab === "Appointments" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — GHL Appointments Integration</p>
              <p className="text-xs text-amber-600 leading-relaxed">Appointments require a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/ghl/appointments</code> endpoint that fetches today's bookings from the GHL calendar API per sub-account. Each record needs time, patient name, appointment type, practice, status, and duration.</p>
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS TAB ────────────────────────────────────── */}
        {activeTab === "Campaigns" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — GHL Campaigns Integration</p>
              <p className="text-xs text-amber-600 leading-relaxed">Campaigns require a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/ghl/campaigns</code> endpoint fetching automation workflows from GHL per sub-account. Each campaign needs name, type (Email/SMS/Both), enrolled count, active count, conversion rate, status, and practice.</p>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
