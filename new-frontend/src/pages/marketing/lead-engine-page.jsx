import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import {
  RefreshCw, TrendingUp, TrendingDown, Zap, Users,
  Search, ExternalLink, Star, Loader2, Phone, Mail,
} from "lucide-react";
import { api } from "@/api/client";

// ─── Stage → quality mapping ──────────────────────────────────────────────────
const STAGE_QUALITY = {
  lead:      "Cold",
  contacted: "Warm",
  booked:    "Hot",
  proposal:  "Hot",
  won:       "Hot",
  lost:      "Cold",
};

const STATUS_STYLE = {
  Hot:  "bg-red-50 text-red-600",
  Warm: "bg-amber-50 text-amber-600",
  Cold: "bg-slate-100 text-slate-500",
};

const SOURCE_ICONS = {
  "Meta":    { icon: "f", bg: "#1877F2" },
  "Google":  { icon: "G", bg: "#4285F4" },
  "GHL":     { icon: "G", bg: "#7c3aed" },
  "Website": { icon: "W", bg: "#7c3aed" },
  "Referral":{ icon: "R", bg: "#10b981" },
  "Walk-in": { icon: "W", bg: "#f59e0b" },
};

function getSourceMeta(source) {
  if (!source) return { icon: "?", bg: "#94a3b8" };
  const key = Object.keys(SOURCE_ICONS).find(k => source.toLowerCase().includes(k.toLowerCase()));
  return key ? SOURCE_ICONS[key] : { icon: source[0]?.toUpperCase() || "?", bg: "#94a3b8" };
}

function relativeTime(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Static funnel (no impression/click data yet) ────────────────────────────
const FUNNEL_LABELS = ["Impressions", "Clicks", "Leads", "Qualified", "Booked"];

export default function LeadEnginePage() {
  const [leads, setLeads] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bizFilter, setBizFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [contactsRes, oppsRes] = await Promise.allSettled([
        api.liveGhlContacts(),
        api.liveGhlOpportunities(),
      ]);
      const contacts = contactsRes.status === "fulfilled" ? (contactsRes.value?.contacts || []) : [];
      const opps = oppsRes.status === "fulfilled" ? (oppsRes.value?.opportunities || []) : [];

      // Index first opportunity per contact
      const oppByContact = {};
      for (const opp of opps) {
        if (opp.contact_id && !oppByContact[opp.contact_id]) oppByContact[opp.contact_id] = opp;
      }

      const merged = contacts.map((c) => {
        const opp = oppByContact[c.id] || {};
        return {
          id: c.id,
          name: c.name || "Unknown",
          email: c.email || "",
          phone: c.phone || "",
          source: c.source || "",
          stage: opp.stage || c.stage || "lead",
          business: c.business || c.slug || "",
          value_est: opp.value || 0,
          persona: c.tags?.length ? c.tags[0] : "",
          created_at: c.created_at || "",
        };
      });

      setLeads(merged);
      // Derive unique practices from live contacts
      const bizNames = [...new Set(merged.map((l) => l.business).filter(Boolean))].sort();
      setBusinesses(bizNames.map((name) => ({ id: name, name })));
    } catch (err) {
      console.error("Lead Engine load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // All unique sources from real data
  const allSources = useMemo(() =>
    [...new Set(leads.map(l => l.source).filter(Boolean))].sort(),
    [leads]
  );

  // Filtered leads
  const filtered = useMemo(() => leads.filter((l) => {
    const matchBiz    = bizFilter === "all" || l.business === bizFilter;
    const matchSource = sourceFilter === "all" || l.source === sourceFilter;
    const matchSearch = !search ||
      (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.persona || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.source || "").toLowerCase().includes(search.toLowerCase());
    return matchBiz && matchSource && matchSearch;
  }), [leads, bizFilter, sourceFilter, search]);

  // ─── KPIs from real data ────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsToday = leads.filter(l => new Date(l.created_at) >= today).length;
  const leadsWeek  = leads.filter(l => Date.now() - new Date(l.created_at) < 7 * 86400000).length;
  const totalValue = leads.reduce((s, l) => s + (Number(l.value_est) || 0), 0);
  const wonLeads   = leads.filter(l => l.stage === "won").length;
  const convRate   = leads.length ? ((wonLeads / leads.length) * 100).toFixed(1) : "0.0";

  // ─── Source breakdown ───────────────────────────────────────────────────────
  const sourceGroups = useMemo(() => {
    const g = {};
    leads.forEach((l) => {
      const s = l.source || "Unknown";
      if (!g[s]) g[s] = { name: s, leads: 0, value: 0 };
      g[s].leads++;
      g[s].value += Number(l.value_est) || 0;
    });
    return Object.values(g).sort((a, b) => b.leads - a.leads);
  }, [leads]);

  // ─── Quality distribution ───────────────────────────────────────────────────
  const qualityGroups = useMemo(() => {
    const g = { Hot: 0, Warm: 0, Cold: 0 };
    leads.forEach(l => { g[STAGE_QUALITY[l.stage] || "Cold"]++; });
    return [
      { label: "Hot",  count: g.Hot,  bg: "bg-red-500" },
      { label: "Warm", count: g.Warm, bg: "bg-amber-400" },
      { label: "Cold", count: g.Cold, bg: "bg-slate-300" },
    ];
  }, [leads]);
  const qualityTotal = qualityGroups.reduce((s, q) => s + q.count, 0);

  // ─── Funnel — computed where possible, rest static ─────────────────────────
  const funnel = [
    { label: "Total Leads",   value: leads.length,                      pct: 100 },
    { label: "Contacted",     value: leads.filter(l => ["contacted","booked","proposal","won"].includes(l.stage)).length, pct: 75 },
    { label: "Booked",        value: leads.filter(l => ["booked","proposal","won"].includes(l.stage)).length, pct: 50 },
    { label: "Proposal",      value: leads.filter(l => ["proposal","won"].includes(l.stage)).length, pct: 30 },
    { label: "Won",           value: wonLeads,                           pct: 15 },
  ];

  return (
    <>
      <Topbar title="Lead Engine" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎯"
          title="Lead Engine"
          subtitle="Multi-source lead generation — GHL, Google, Meta, Referrals"
          actions={[
            { label: "Refresh", icon: <RefreshCw size={14} />, variant: "outline", onClick: load },
          ]}
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Leads Today",   value: leadsToday,             icon: <Zap size={15} />,        sub: "new today" },
                { label: "Leads This Week", value: leadsWeek,            icon: <Users size={15} />,      sub: "last 7 days" },
                { label: "Pipeline Value",  value: `£${Math.round(totalValue).toLocaleString()}`, icon: <TrendingUp size={15} />, sub: "est. total" },
                { label: "Won Deals",       value: wonLeads,             icon: <Star size={15} />,       sub: "converted" },
                { label: "Conv. Rate",      value: `${convRate}%`,       icon: <TrendingUp size={15} />, sub: "lead → won" },
              ].map((k) => (
                <div key={k.label} className="bg-white border border-line rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-muted mb-2">
                    {k.icon}
                    <span className="text-[10px] font-semibold uppercase tracking-wide">{k.label}</span>
                  </div>
                  <div className="text-xl font-bold text-ink mb-0.5">{k.value}</div>
                  <div className="text-[10px] text-muted font-medium">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Source Cards */}
            {sourceGroups.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-ink mb-3">Lead Sources</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {sourceGroups.map((src) => {
                    const meta = getSourceMeta(src.name);
                    return (
                      <div key={src.name} className="bg-white border border-line rounded-xl p-4 hover:shadow-sm transition">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: meta.bg }}>
                            {meta.icon}
                          </div>
                          <span className="text-xs font-bold text-ink leading-tight">{src.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-ink mb-1">{src.leads}</div>
                        <div className="text-[10px] text-muted">
                          {src.value > 0 ? `£${Math.round(src.value).toLocaleString()} est.` : "No value set"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Funnel + Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Pipeline Funnel */}
              <div className="bg-white border border-line rounded-xl p-5">
                <h3 className="text-sm font-bold text-ink mb-4">Pipeline Funnel</h3>
                <div className="space-y-3">
                  {funnel.map((stage, i) => {
                    const pct = funnel[0].value > 0
                      ? Math.round((stage.value / funnel[0].value) * 100)
                      : 0;
                    const colors = ["#ede9fe","#ddd6fe","#c4b5fd","#a78bfa","#7c3aed"];
                    return (
                      <div key={stage.label} className="flex items-center gap-3">
                        <div className="w-20 text-[11px] font-semibold text-muted text-right shrink-0">{stage.label}</div>
                        <div className="flex-1 bg-bg-shell rounded-full h-7 relative overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-3 transition-all"
                            style={{ width: `${Math.max(pct, 8)}%`, background: colors[i] }}
                          >
                            <span className="text-[10px] font-bold" style={{ color: i > 2 ? "#fff" : "#4c1d95" }}>
                              {stage.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality Distribution */}
              <div className="bg-white border border-line rounded-xl p-5">
                <h3 className="text-sm font-bold text-ink mb-4">Lead Quality Distribution</h3>
                {qualityTotal === 0 ? (
                  <p className="text-sm text-muted text-center py-8">No leads yet</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {qualityGroups.map((q) => {
                        const pct = qualityTotal ? Math.round((q.count / qualityTotal) * 100) : 0;
                        return (
                          <div key={q.label}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", q.bg)} />
                                <span className="text-xs font-semibold text-ink">{q.label} Leads</span>
                              </div>
                              <div className="text-xs text-muted">
                                <strong className="text-ink">{q.count}</strong> ({pct}%)
                              </div>
                            </div>
                            <div className="w-full bg-bg-shell rounded-full h-2.5">
                              <div className={cn("h-2.5 rounded-full", q.bg)} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-line grid grid-cols-3 gap-2 text-center">
                      {qualityGroups.map((q) => (
                        <div key={q.label} className="bg-bg-soft rounded-lg p-2.5">
                          <div className="text-lg font-bold text-ink">{q.count}</div>
                          <div className="text-[10px] text-muted font-medium">{q.label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Leads Table */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
                <h3 className="text-sm font-bold text-ink">All Leads</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-bg-soft w-48">
                    <Search size={13} className="text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
                    />
                  </div>
                  <select
                    value={bizFilter}
                    onChange={(e) => setBizFilter(e.target.value)}
                    className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white"
                  >
                    <option value="all">All Practices</option>
                    {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white"
                  >
                    <option value="all">All Sources</option>
                    {allSources.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-bg-soft border-b border-line">
                    <tr>
                      {["Name", "Source", "Practice", "Interest", "Value", "Contact", "Stage", "Time"].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 font-semibold text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-10 text-muted">
                        {leads.length === 0 ? "No leads yet — GHL sync pending" : "No leads match filters"}
                      </td></tr>
                    ) : filtered.map((lead) => {
                      const quality = STAGE_QUALITY[lead.stage] || "Cold";
                      return (
                        <tr key={lead.id} className="hover:bg-bg-soft transition">
                          <td className="px-4 py-3 font-semibold text-ink">{lead.name || "—"}</td>
                          <td className="px-4 py-3 text-muted">{lead.source || "—"}</td>
                          <td className="px-4 py-3 text-muted whitespace-nowrap">{lead.business || "—"}</td>
                          <td className="px-4 py-3 text-ink">{lead.persona || "—"}</td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            {lead.value_est ? `£${Number(lead.value_est).toLocaleString()}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`} className="text-muted hover:text-primary transition">
                                  <Phone size={11} />
                                </a>
                              )}
                              {lead.email && (
                                <a href={`mailto:${lead.email}`} className="text-muted hover:text-primary transition">
                                  <Mail size={11} />
                                </a>
                              )}
                              {!lead.phone && !lead.email && <span className="text-muted">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_STYLE[quality])}>
                              {quality}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted whitespace-nowrap">
                            {relativeTime(lead.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 border-t border-line flex items-center justify-between">
                <span className="text-xs text-muted">Showing {filtered.length} of {leads.length} leads</span>
                <span className="text-xs text-muted">Auto-syncs from GHL every 5 min</span>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
