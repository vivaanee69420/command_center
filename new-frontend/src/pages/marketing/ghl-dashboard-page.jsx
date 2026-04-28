import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import KpiCard from "@/components/shared/kpi-card";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";
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

const CONTACTS = [
  { id: 1, name: "James Holloway", email: "j.holloway@email.com", phone: "+44 7700 900001", practice: "Ashford", stage: "Appointment Set", lastContact: "2h ago", tags: ["Implants", "High Value"], value: 3500 },
  { id: 2, name: "Priya Sharma", email: "priya.s@email.com", phone: "+44 7700 900002", practice: "Rochester", stage: "New Lead", lastContact: "4h ago", tags: ["Invisalign"], value: 2800 },
  { id: 3, name: "Mohammed Al-Hassan", email: "m.alhassan@email.com", phone: "+44 7700 900003", practice: "Barnet", stage: "Showed Up", lastContact: "1d ago", tags: ["General", "NHS"], value: 450 },
  { id: 4, name: "Sarah McPherson", email: "sarah.mc@email.com", phone: "+44 7700 900004", practice: "Bexleyheath", stage: "Treatment Presented", lastContact: "3h ago", tags: ["Whitening", "Implants"], value: 4200 },
  { id: 5, name: "Daniel Okonkwo", email: "d.okonkwo@email.com", phone: "+44 7700 900005", practice: "Warwick Lodge", stage: "Won", lastContact: "2d ago", tags: ["Braces"], value: 3100 },
  { id: 6, name: "Emma Richardson", email: "emma.r@email.com", phone: "+44 7700 900006", practice: "Rye Dental", stage: "New Lead", lastContact: "30m ago", tags: ["Emergency"], value: 290 },
  { id: 7, name: "Liu Wei", email: "liu.wei@email.com", phone: "+44 7700 900007", practice: "Ashford", stage: "Appointment Set", lastContact: "5h ago", tags: ["Implants"], value: 3800 },
  { id: 8, name: "Fatima Malik", email: "f.malik@email.com", phone: "+44 7700 900008", practice: "Barnet", stage: "Won", lastContact: "1d ago", tags: ["Invisalign", "High Value"], value: 5200 },
  { id: 9, name: "Thomas Brennan", email: "t.brennan@email.com", phone: "+44 7700 900009", practice: "Rochester", stage: "Lost", lastContact: "3d ago", tags: ["General"], value: 0 },
  { id: 10, name: "Aisha Patel", email: "aisha.p@email.com", phone: "+44 7700 900010", practice: "Bexleyheath", stage: "Treatment Presented", lastContact: "6h ago", tags: ["Veneers", "High Value"], value: 6000 },
  { id: 11, name: "George Stavros", email: "g.stavros@email.com", phone: "+44 7700 900011", practice: "Warwick Lodge", stage: "Showed Up", lastContact: "8h ago", tags: ["Whitening"], value: 380 },
  { id: 12, name: "Nkechi Obi", email: "nkechi.o@email.com", phone: "+44 7700 900012", practice: "Ashford", stage: "New Lead", lastContact: "1h ago", tags: ["Implants"], value: 3500 },
  { id: 13, name: "Ryan Patel", email: "ryan.p@email.com", phone: "+44 7700 900013", practice: "Rye Dental", stage: "Appointment Set", lastContact: "45m ago", tags: ["Emergency", "NHS"], value: 150 },
  { id: 14, name: "Olivia Chen", email: "olivia.c@email.com", phone: "+44 7700 900014", practice: "Barnet", stage: "Treatment Presented", lastContact: "2h ago", tags: ["Braces", "Invisalign"], value: 4800 },
  { id: 15, name: "Samuel Adeyemi", email: "s.adeyemi@email.com", phone: "+44 7700 900015", practice: "Rochester", stage: "Appointment Set", lastContact: "3h ago", tags: ["General"], value: 620 },
];

const APPOINTMENTS = [
  { id: 1, time: "09:00", patient: "James Holloway", practice: "Ashford", type: "Implant Consultation", status: "Confirmed", duration: "60 min" },
  { id: 2, time: "09:30", patient: "Priya Sharma", practice: "Rochester", type: "Invisalign Assessment", status: "Confirmed", duration: "45 min" },
  { id: 3, time: "10:15", patient: "Sarah McPherson", practice: "Bexleyheath", type: "Treatment Planning", status: "Confirmed", duration: "90 min" },
  { id: 4, time: "11:00", patient: "Emma Richardson", practice: "Rye Dental", type: "Emergency Appointment", status: "Pending", duration: "30 min" },
  { id: 5, time: "11:30", patient: "George Stavros", practice: "Warwick Lodge", type: "Whitening Consult", status: "No-show", duration: "30 min" },
  { id: 6, time: "13:00", patient: "Liu Wei", practice: "Ashford", type: "Implant Review", status: "Confirmed", duration: "60 min" },
  { id: 7, time: "14:00", patient: "Ryan Patel", practice: "Rye Dental", type: "NHS Checkup", status: "Confirmed", duration: "30 min" },
  { id: 8, time: "15:30", patient: "Olivia Chen", practice: "Barnet", type: "Braces Consultation", status: "Pending", duration: "60 min" },
];

const CAMPAIGNS = [
  { id: 1, name: "Implant Lead Nurture", type: "Both", enrolled: 142, active: 89, conv: 24.6, status: "Active", practice: "All" },
  { id: 2, name: "Invisalign Awareness Drip", type: "Email", enrolled: 98, active: 72, conv: 18.2, status: "Active", practice: "Rochester" },
  { id: 3, name: "No-Show Re-engagement", type: "SMS", enrolled: 45, active: 31, conv: 33.3, status: "Active", practice: "All" },
  { id: 4, name: "Post-Treatment Follow-up", type: "Both", enrolled: 210, active: 58, conv: 41.0, status: "Active", practice: "Ashford" },
  { id: 5, name: "Whitening Promo Blast", type: "SMS", enrolled: 320, active: 0, conv: 12.5, status: "Ended", practice: "All" },
];

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

  const filteredContacts = useMemo(() => {
    return CONTACTS.filter((c) => {
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
  }, [practiceFilter, search]);

  const filteredAppointments = useMemo(() => {
    return APPOINTMENTS.filter((a) => practiceFilter === "All Practices" || a.practice === practiceFilter);
  }, [practiceFilter]);

  const filteredCampaigns = useMemo(() => {
    return CAMPAIGNS.filter((c) => practiceFilter === "All Practices" || c.practice === "All" || c.practice === practiceFilter);
  }, [practiceFilter]);

  const totalContacts = CONTACTS.length;
  const pipelineValue = CONTACTS.filter((c) => !["Won", "Lost"].includes(c.stage)).reduce((s, c) => s + c.value, 0);
  const openOpps = CONTACTS.filter((c) => !["Won", "Lost"].includes(c.stage)).length;
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
          <div className="space-y-4">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink">Today's Appointments</h3>
                  <p className="text-xs text-muted mt-0.5">28 April 2026</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {Object.entries(APPT_STATUS_STYLES).map(([s, st]) => {
                    const count = filteredAppointments.filter((a) => a.status === s).length;
                    return (
                      <span key={s} className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {count} {s}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="divide-y divide-line">
                {filteredAppointments.map((a) => {
                  const s = APPT_STATUS_STYLES[a.status] || APPT_STATUS_STYLES.Pending;
                  const Icon = s.icon;
                  return (
                    <div key={a.id} className="px-5 py-4 flex items-center gap-5 hover:bg-bg-soft transition-colors">
                      <div className="w-14 shrink-0 text-center">
                        <div className="text-base font-bold text-ink">{a.time}</div>
                        <div className="text-[10px] text-muted">{a.duration}</div>
                      </div>
                      <div className="w-px h-10 bg-line shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink text-sm">{a.patient}</div>
                        <div className="text-xs text-muted mt-0.5">{a.type}</div>
                      </div>
                      <div
                        className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: "#ede9fe", color: "#7c3aed" }}
                      >
                        {a.practice}
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <Icon size={11} /> {a.status}
                      </div>
                      <button className="ml-2 p-2 rounded-lg hover:bg-bg-soft border border-line text-muted hover:text-ink transition-colors shrink-0">
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  );
                })}
                {filteredAppointments.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-muted">No appointments for this practice today.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS TAB ────────────────────────────────────── */}
        {activeTab === "Campaigns" && (
          <div className="space-y-4">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Automation Campaigns</h3>
                <span className="text-xs text-muted">{filteredCampaigns.filter((c) => c.status === "Active").length} active</span>
              </div>
              <div className="divide-y divide-line">
                {filteredCampaigns.map((c) => {
                  const typeStyle = CAMPAIGN_TYPE_STYLES[c.type] || CAMPAIGN_TYPE_STYLES.Both;
                  const enrolledPct = Math.round((c.active / Math.max(c.enrolled, 1)) * 100);
                  return (
                    <div key={c.id} className="px-5 py-5 hover:bg-bg-soft transition-colors">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: typeStyle.bg }}
                        >
                          <MessageSquare size={16} style={{ color: typeStyle.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-semibold text-ink text-sm">{c.name}</span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={typeStyle}
                            >
                              {c.type}
                            </span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: c.status === "Active" ? "#ecfdf5" : "#f1f5f9",
                                color: c.status === "Active" ? "#10b981" : "#64748b",
                              }}
                            >
                              {c.status}
                            </span>
                            {c.practice !== "All" && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg-soft text-muted">
                                {c.practice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-xs text-muted mb-3">
                            <span><span className="font-semibold text-ink">{c.enrolled}</span> enrolled</span>
                            <span><span className="font-semibold text-ink">{c.active}</span> active</span>
                            <span><span className="font-semibold text-green-600">{c.conv}%</span> conversion</span>
                          </div>
                          {/* Progress bar: active / enrolled */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${enrolledPct}%`, background: typeStyle.color }}
                              />
                            </div>
                            <span className="text-[10px] text-muted shrink-0">{enrolledPct}% active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredCampaigns.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-muted">No campaigns for this practice.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
