import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import {
  RefreshCw, Download, TrendingUp, TrendingDown, Zap, Users,
  Search, Filter, ChevronDown, ExternalLink, Star
} from "lucide-react";
import { api } from "@/api/client";

const PRACTICES = ["All Practices", "GM Dental - Luton", "GM Dental - Watford", "GM Dental - Harrow", "GM Dental - Wembley"];
const SOURCES = ["All Sources", "Google Ads", "Facebook Ads", "Website Forms", "Referrals", "Walk-ins"];
const DATE_RANGES = ["Today", "This Week", "This Month", "Last 30 Days"];

const SOURCE_CARDS = [
  {
    name: "Google Ads",
    icon: "G",
    iconBg: "#4285F4",
    leads: 84,
    cpl: 42,
    trend: +12,
    conversions: 18,
  },
  {
    name: "Facebook Ads",
    icon: "f",
    iconBg: "#1877F2",
    leads: 61,
    cpl: 31,
    trend: -5,
    conversions: 11,
  },
  {
    name: "Website Forms",
    icon: "W",
    iconBg: "#7c3aed",
    leads: 37,
    cpl: 0,
    trend: +8,
    conversions: 14,
  },
  {
    name: "Referrals",
    icon: "R",
    iconBg: "#10b981",
    leads: 29,
    cpl: 0,
    trend: +21,
    conversions: 19,
  },
  {
    name: "Walk-ins",
    icon: "W",
    iconBg: "#f59e0b",
    leads: 14,
    cpl: 0,
    trend: -3,
    conversions: 9,
  },
];

const STATIC_LEADS = [
  { id: 1, name: "Sarah Mitchell", source: "Google Ads", practice: "GM Dental - Luton", interest: "Dental Implants", value: 2999, time: "9m ago", status: "Hot" },
  { id: 2, name: "James Okoye", source: "Facebook Ads", practice: "GM Dental - Watford", interest: "Invisalign", value: 3500, time: "22m ago", status: "Warm" },
  { id: 3, name: "Priya Sharma", source: "Website Forms", practice: "GM Dental - Harrow", interest: "Whitening", value: 399, time: "41m ago", status: "Cold" },
  { id: 4, name: "Tom Brennan", source: "Referrals", practice: "GM Dental - Wembley", interest: "Check-up + Scale", value: 120, time: "1h ago", status: "Warm" },
  { id: 5, name: "Elena Vasquez", source: "Google Ads", practice: "GM Dental - Luton", interest: "All-on-4", value: 14995, time: "1h 15m ago", status: "Hot" },
  { id: 6, name: "David Huang", source: "Facebook Ads", practice: "GM Dental - Harrow", interest: "Dental Implants", value: 2999, time: "2h ago", status: "Warm" },
  { id: 7, name: "Amara Diallo", source: "Walk-ins", practice: "GM Dental - Watford", interest: "Emergency Appt", value: 95, time: "2h 30m ago", status: "Cold" },
  { id: 8, name: "Chris Patel", source: "Referrals", practice: "GM Dental - Luton", interest: "Invisalign", value: 3800, time: "3h ago", status: "Hot" },
  { id: 9, name: "Lucy Thornton", source: "Website Forms", practice: "GM Dental - Wembley", interest: "Veneers", value: 5200, time: "3h 45m ago", status: "Warm" },
  { id: 10, name: "Marcus Williams", source: "Google Ads", practice: "GM Dental - Harrow", interest: "Dental Implants", value: 2999, time: "4h ago", status: "Cold" },
  { id: 11, name: "Fatima Al-Hassan", source: "Facebook Ads", practice: "GM Dental - Luton", interest: "Teeth Whitening", value: 299, time: "5h ago", status: "Hot" },
  { id: 12, name: "Ryan O'Connor", source: "Walk-ins", practice: "GM Dental - Watford", interest: "Composite Bonding", value: 1200, time: "6h ago", status: "Warm" },
];

const STATUS_STYLE = {
  Hot: "bg-red-50 text-red-600",
  Warm: "bg-amber-50 text-amber-600",
  Cold: "bg-slate-100 text-slate-500",
};

const FUNNEL = [
  { label: "Impressions", value: "142,800", width: "100%", color: "#ede9fe" },
  { label: "Clicks", value: "4,284", width: "85%", color: "#ddd6fe" },
  { label: "Leads", value: "225", width: "65%", color: "#c4b5fd" },
  { label: "Qualified", value: "89", width: "45%", color: "#a78bfa" },
  { label: "Booked", value: "41", width: "28%", color: "#7c3aed" },
];

const QUALITY = [
  { label: "Hot", count: 52, color: "#ef4444", bg: "bg-red-500" },
  { label: "Warm", count: 98, color: "#f59e0b", bg: "bg-amber-400" },
  { label: "Cold", count: 75, color: "#94a3b8", bg: "bg-slate-300" },
];
const QUALITY_TOTAL = QUALITY.reduce((a, b) => a + b.count, 0);

export default function LeadEnginePage() {
  const [leads, setLeads] = useState(STATIC_LEADS);
  const [practiceFilter, setPracticeFilter] = useState("All Practices");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [dateRange, setDateRange] = useState("This Week");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.leads?.()
      .then((data) => { if (data?.length) setLeads(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    leads.filter((l) => {
      const matchPractice = practiceFilter === "All Practices" || l.practice === practiceFilter;
      const matchSource = sourceFilter === "All Sources" || l.source === sourceFilter;
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.interest.toLowerCase().includes(search.toLowerCase());
      return matchPractice && matchSource && matchSearch;
    }), [leads, practiceFilter, sourceFilter, search]);

  const leadsToday = leads.filter((l) => l.time.includes("m ago") || l.time.includes("h ago")).length;
  const avgCPL = Math.round(SOURCE_CARDS.filter(s => s.cpl > 0).reduce((a, b) => a + b.cpl, 0) / SOURCE_CARDS.filter(s => s.cpl > 0).length);
  const bestSource = SOURCE_CARDS.slice().sort((a, b) => b.leads - a.leads)[0];
  const convRate = ((QUALITY[0].count / QUALITY_TOTAL) * 100).toFixed(1);

  const KPI = [
    { label: "Leads Today", value: leadsToday, sub: "+4 vs yesterday", up: true, icon: <Zap size={15} /> },
    { label: "Leads This Week", value: 225, sub: "+18% vs last week", up: true, icon: <Users size={15} /> },
    { label: "CPL Average", value: `£${avgCPL}`, sub: "-£3 vs last week", up: true, icon: <TrendingDown size={15} /> },
    { label: "Best Source", value: bestSource.name, sub: `${bestSource.leads} leads`, up: true, icon: <Star size={15} /> },
    { label: "Conversion Rate", value: `${convRate}%`, sub: "Hot leads / total", up: true, icon: <TrendingUp size={15} /> },
  ];

  return (
    <>
      <Topbar title="Lead Engine" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎯"
          title="Lead Engine"
          subtitle="Multi-source lead generation dashboard — Google, Facebook, Forms, Referrals"
          actions={[
            { label: "Refresh", icon: <RefreshCw size={14} />, variant: "outline" },
            { label: "Export CSV", icon: <Download size={14} />, variant: "primary" },
          ]}
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {KPI.map((k) => (
            <div key={k.label} className="bg-white border border-line rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted mb-2">
                {k.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wide">{k.label}</span>
              </div>
              <div className="text-xl font-bold text-ink mb-0.5">{k.value}</div>
              <div className={cn("text-[10px] font-medium", k.up ? "text-green-600" : "text-danger")}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Lead Sources */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-ink mb-3">Lead Sources Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SOURCE_CARDS.map((src) => (
              <div key={src.name} className="bg-white border border-line rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: src.iconBg }}>
                    {src.icon}
                  </div>
                  <span className="text-xs font-bold text-ink leading-tight">{src.name}</span>
                </div>
                <div className="text-2xl font-bold text-ink mb-1">{src.leads}</div>
                <div className="text-[10px] text-muted mb-2">
                  {src.cpl > 0 ? `CPL: £${src.cpl}` : "Organic"}
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-semibold", src.trend > 0 ? "text-green-600" : "text-danger")}>
                  {src.trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {src.trend > 0 ? "+" : ""}{src.trend}% vs last week
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-col: Funnel + Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Funnel */}
          <div className="bg-white border border-line rounded-xl p-5">
            <h3 className="text-sm font-bold text-ink mb-4">Lead Funnel</h3>
            <div className="space-y-3">
              {FUNNEL.map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className="w-20 text-[11px] font-semibold text-muted text-right shrink-0">{stage.label}</div>
                  <div className="flex-1 bg-bg-shell rounded-full h-7 relative overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: stage.width, background: stage.color }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: i > 2 ? "#fff" : "#4c1d95" }}>
                        {stage.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-line flex justify-between text-xs text-muted">
              <span>Click-to-Lead: <strong className="text-ink">5.3%</strong></span>
              <span>Lead-to-Booked: <strong className="text-ink">18.2%</strong></span>
              <span>Overall CVR: <strong className="text-ink">0.96%</strong></span>
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="bg-white border border-line rounded-xl p-5">
            <h3 className="text-sm font-bold text-ink mb-4">Lead Quality Distribution</h3>
            <div className="space-y-4">
              {QUALITY.map((q) => {
                const pct = Math.round((q.count / QUALITY_TOTAL) * 100);
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
            <div className="mt-4 pt-4 border-t border-line">
              <div className="grid grid-cols-3 gap-2 text-center">
                {QUALITY.map((q) => (
                  <div key={q.label} className="bg-bg-soft rounded-lg p-2.5">
                    <div className="text-lg font-bold text-ink">{q.count}</div>
                    <div className="text-[10px] text-muted font-medium">{q.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
            <h3 className="text-sm font-bold text-ink">Recent Leads</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
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
              {/* Practice filter */}
              <select
                value={practiceFilter}
                onChange={(e) => setPracticeFilter(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white"
              >
                {PRACTICES.map((p) => <option key={p}>{p}</option>)}
              </select>
              {/* Source filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white"
              >
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {/* Date range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white"
              >
                {DATE_RANGES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-bg-soft border-b border-line">
                <tr>
                  {["Name", "Source", "Practice", "Interest", "Value", "Time", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted">No leads match your filters</td></tr>
                ) : filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-bg-soft transition">
                    <td className="px-4 py-3 font-semibold text-ink">{lead.name}</td>
                    <td className="px-4 py-3 text-muted">{lead.source}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{lead.practice}</td>
                    <td className="px-4 py-3 text-ink">{lead.interest}</td>
                    <td className="px-4 py-3 font-semibold text-primary">£{lead.value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{lead.time}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_STYLE[lead.status])}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-muted hover:text-primary transition">
                        <ExternalLink size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-line flex items-center justify-between">
            <span className="text-xs text-muted">Showing {filtered.length} of {leads.length} leads</span>
            <button className="text-xs font-semibold text-primary hover:underline">View all leads</button>
          </div>
        </div>
      </main>
    </>
  );
}
