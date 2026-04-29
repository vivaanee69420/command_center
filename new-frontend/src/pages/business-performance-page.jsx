import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import KpiCard from "@/components/shared/kpi-card";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";
import { api } from "@/api/client";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Activity,
} from "lucide-react";

// ─── Static enrichment data ────────────────────────────────────────────────

const TARGETS = {
  Ashford: 140000,
  Rochester: 80000,
  Barnet: 125000,
  Bexleyheath: 130000,
  "Warwick Lodge": 115000,
  "Rye Dental": 110000,
  Academy: 90000,
  Lab: 85000,
  Accounts: 130000,
};

// OPS_DATA, LEADS_DATA, PREV_REVENUE, SERVICE_MIX, LEAD_SOURCES, TRENDS removed.
// Operations/trends need Dentally API. Lead sources need GHL API. Service mix needs Dentally treatment data.

const TABS = ["Overview", "Revenue", "Leads", "Operations", "Trends"];
const PERIODS = ["This Month", "Last Month", "Quarter", "Year"];

// ─── Helpers ───────────────────────────────────────────────────────────────

function attainmentPct(rev, name) {
  const t = TARGETS[name] || 100000;
  return Math.round((rev / t) * 100);
}

function statusBadge(pct) {
  if (pct >= 90) return { label: "On Track",  bg: "#f0fdf4", color: "#16a34a" };
  if (pct >= 70) return { label: "At Risk",   bg: "#fffbeb", color: "#b45309" };
  return              { label: "Behind",     bg: "#fef2f2", color: "#dc2626" };
}

function trafficLight(pct) {
  if (pct >= 90) return "#10b981";
  if (pct >= 70) return "#f59e0b";
  return "#ef4444";
}

function TrendIcon({ dir }) {
  if (dir === "up")   return <TrendingUp  size={14} className="text-green-500" />;
  if (dir === "down") return <TrendingDown size={14} className="text-red-400"  />;
  return <Minus size={14} className="text-muted" />;
}

function Sparkline({ data, color = "#7c3aed" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32, pts = data.length;
  const points = data
    .map((v, i) => `${(i / (pts - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────

function OverviewTab({ businesses, filterPractice }) {
  const rows = businesses.filter(b => filterPractice === "All" || b.name === filterPractice);
  const totals = rows.reduce(
    (acc, b) => ({
      revenue: acc.revenue + b.revenue,
      leads: acc.leads + b.leads,
      bookings: acc.bookings + b.bookings,
      adSpend: acc.adSpend + b.adSpend,
    }),
    { revenue: 0, leads: 0, bookings: 0, adSpend: 0 }
  );

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h3 className="text-sm font-bold text-ink">Performance Scoreboard</h3>
        <p className="text-xs text-muted mt-0.5">Traffic light: green &gt;90% target · yellow 70–90% · red &lt;70%</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-soft border-b border-line">
              {["Practice","Revenue","Target","Attainment","Leads","Bookings","Ad Spend","ROI","Trend","Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => {
              const pct = attainmentPct(b.revenue, b.name);
              const badge = statusBadge(pct);
              const tl = trafficLight(pct);
              const roi = b.adSpend > 0 ? (b.revenue / b.adSpend).toFixed(1) : "–";
              return (
                <tr key={b.name} className={cn("border-b border-line hover:bg-bg-soft transition", i % 2 === 0 ? "" : "bg-bg-soft/40")}>
                  <td className="px-4 py-3 font-semibold text-ink flex items-center gap-2">
                    <span className="text-base">{b.emoji}</span>
                    {b.name}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">{formatCurrency(b.revenue)}</td>
                  <td className="px-4 py-3 text-muted">{formatCurrency(TARGETS[b.name] || 100000)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tl }} />
                      <span className="font-semibold" style={{ color: tl }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{formatNumber(b.leads)}</td>
                  <td className="px-4 py-3 text-ink">{formatNumber(b.bookings)}</td>
                  <td className="px-4 py-3 text-ink">{formatCurrency(b.adSpend)}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{roi}x</td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold", b.trend > 0 ? "text-green-600" : "text-red-500")}>
                      {b.trend > 0 ? "+" : ""}{b.trend}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-800 text-white">
              <td className="px-4 py-3 font-bold text-sm">Group Total</td>
              <td className="px-4 py-3 font-bold text-green-400">{formatCurrency(totals.revenue)}</td>
              <td className="px-4 py-3 font-semibold text-slate-300">{formatCurrency(Object.values(TARGETS).reduce((a, b) => a + b, 0))}</td>
              <td className="px-4 py-3 font-bold text-yellow-400">
                {Math.round((totals.revenue / Object.values(TARGETS).reduce((a,b)=>a+b,0))*100)}%
              </td>
              <td className="px-4 py-3 font-semibold">{formatNumber(totals.leads)}</td>
              <td className="px-4 py-3 font-semibold">{formatNumber(totals.bookings)}</td>
              <td className="px-4 py-3 font-semibold">{formatCurrency(totals.adSpend)}</td>
              <td className="px-4 py-3 font-semibold text-green-400">
                {totals.adSpend > 0 ? (totals.revenue / totals.adSpend).toFixed(1) : "–"}x
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Revenue ─────────────────────────────────────────────────────────

function RevenueTab({ businesses, filterPractice }) {
  const rows = businesses.filter(b => filterPractice === "All" || b.name === filterPractice);
  const maxRev = Math.max(...rows.map(b => b.revenue));

  return (
    <div className="space-y-5">
      {/* Horizontal bars */}
      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-4">Revenue by Practice</h3>
        <div className="space-y-3">
          {rows.sort((a,b) => b.revenue - a.revenue).map(b => {
            const barPct = (b.revenue / maxRev) * 100;
            const mom = b.revenue - (PREV_REVENUE[b.name] || b.revenue);
            const momPct = PREV_REVENUE[b.name] ? ((mom / PREV_REVENUE[b.name]) * 100).toFixed(1) : "0.0";
            return (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <span>{b.emoji}</span> {b.name}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={cn("font-semibold", parseFloat(momPct) >= 0 ? "text-green-600" : "text-red-500")}>
                      {parseFloat(momPct) >= 0 ? "+" : ""}{momPct}% MoM
                    </span>
                    <span className="font-bold text-ink w-24 text-right">{formatCurrency(b.revenue)}</span>
                  </div>
                </div>
                <div className="h-2 bg-line rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${barPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MoM comparison + service mix — pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">Month-over-Month Comparison</h3>
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Historical Revenue Snapshots</p>
              <p className="text-xs text-amber-600 leading-relaxed">MoM comparison requires storing last-month revenue snapshots. The revenue model records daily snapshots — add a monthly aggregation endpoint to enable this view.</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">Revenue by Service Type</h3>
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Dentally Treatment Data</p>
              <p className="text-xs text-amber-600 leading-relaxed">Service mix (implants, Invisalign, general, cosmetic) requires Dentally API integration to pull treatment-level revenue breakdown.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Leads ───────────────────────────────────────────────────────────

function LeadsTab({ filterPractice }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leads().then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filterPractice === "All" ? leads : leads.filter(l => l.persona === filterPractice);
  const total = filtered.length;
  const qualified = filtered.filter(l => ["booked","proposal","won"].includes(l.stage)).length;
  const appts = filtered.filter(l => ["booked","proposal"].includes(l.stage)).length;
  const conversions = filtered.filter(l => l.stage === "won").length;

  const funnel = [
    { label: "Total Leads",  value: total,       color: "#3b82f6", bg: "#eff6ff" },
    { label: "Qualified",    value: qualified,    color: "#7c3aed", bg: "#ede9fe" },
    { label: "Appointments", value: appts,        color: "#f59e0b", bg: "#fffbeb" },
    { label: "Conversions",  value: conversions,  color: "#10b981", bg: "#f0fdf4" },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-5">Leads Funnel</h3>
        {loading ? (
          <div className="text-sm text-muted py-4">Loading leads...</div>
        ) : (
          <div className="flex flex-col items-center gap-0">
            {funnel.map((stage, i) => {
              const widthPct = 100 - i * 15;
              const convRate = i === 0 ? 100 : (funnel[0].value > 0 ? Math.round((stage.value / funnel[0].value) * 100) : 0);
              return (
                <div key={stage.label} className="w-full flex flex-col items-center">
                  <div
                    className="flex items-center justify-between px-6 py-3 rounded-lg"
                    style={{ width: `${widthPct}%`, backgroundColor: stage.bg, border: `1.5px solid ${stage.color}20` }}
                  >
                    <span className="text-sm font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                    <div className="text-right">
                      <span className="text-xl font-bold" style={{ color: stage.color }}>{formatNumber(stage.value)}</span>
                      {i > 0 && <span className="text-xs text-muted ml-2">({convRate}% of total)</span>}
                    </div>
                  </div>
                  {i < funnel.length - 1 && <div className="w-0.5 h-4 bg-line" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-4">Lead Source Breakdown</h3>
        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — GHL + Ads Source Tracking</p>
            <p className="text-xs text-amber-600 leading-relaxed">Lead source breakdown (Google Ads, Facebook, Referral, Walk-in) requires GHL pipeline source fields and Ads API integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Operations ──────────────────────────────────────────────────────

function OperationsTab() {
  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-sm font-bold text-ink mb-4">Practice Operations Metrics</h3>
      <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Dentally API Integration</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            Wait times, no-show rates, chair utilisation, and staff efficiency metrics require the Dentally practice management API.
            Add DENTALLY_API_KEY to .env and complete the Dentally worker HTTP calls to enable this tab.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Trends ──────────────────────────────────────────────────────────

function TrendsTab() {
  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-sm font-bold text-ink mb-4">Group Trends</h3>
      <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Multi-source Trend Aggregation</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            Group trends (revenue trajectory, lead volume, booking rate, no-show rate, chair utilisation, ad ROI) require
            historical snapshots from Dentally, GHL, and Ads APIs. Wire all provider workers first, then add a
            time-series aggregation endpoint to power this tab.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function BusinessPerformancePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [period, setPeriod] = useState("This Month");
  const [filterPractice, setFilterPractice] = useState("All");
  const [businesses, setBusinesses] = useState(BUSINESSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [biz] = await Promise.all([api.businesses()]);
        if (!cancelled && biz?.length) setBusinesses(biz);
      } catch {
        // silently fall back to BUSINESSES
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const groupRevenue = useMemo(() => businesses.reduce((s, b) => s + b.revenue, 0), [businesses]);
  const groupTarget  = useMemo(() => Object.values(TARGETS).reduce((s, v) => s + v, 0), []);
  const attainment   = useMemo(() => Math.round((groupRevenue / groupTarget) * 100), [groupRevenue, groupTarget]);
  const groupLeads   = useMemo(() => businesses.reduce((s, b) => s + b.leads, 0), [businesses]);
  const bestPractice = useMemo(() => [...businesses].sort((a,b) => b.revenue - a.revenue)[0], [businesses]);
  const yoyGrowth    = 11.4;

  const practiceNames = ["All", ...businesses.map(b => b.name)];

  return (
    <>
      <Topbar title="Business Performance" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📊"
          title="Business Performance"
          subtitle="Group-wide analytics — revenue, leads, operations and trends"
          right={
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterPractice}
                onChange={e => setFilterPractice(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {practiceNames.map(p => <option key={p}>{p}</option>)}
              </select>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg text-xs font-medium text-ink hover:bg-bg-soft transition">
                <Download size={13} />
                Export
              </button>
            </div>
          }
        />

        {/* KPI Strip */}
        {loading ? (
          <div className="flex items-center justify-center h-24 text-muted text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <KpiCard
              label="Group Revenue"
              value={groupRevenue}
              icon="$"
              delta={yoyGrowth}
              subtitle={`${period}`}
              borderColor="#7c3aed"
            />
            <KpiCard
              label="Revenue Target"
              value={groupTarget}
              icon="$"
              subtitle="Combined practice targets"
              borderColor="#3b82f6"
            />
            <KpiCard
              label="Attainment"
              value={`${attainment}%`}
              icon="check"
              subtitle={attainment >= 90 ? "On Track" : attainment >= 70 ? "At Risk" : "Behind Target"}
              borderColor={attainment >= 90 ? "#10b981" : attainment >= 70 ? "#f59e0b" : "#ef4444"}
            />
            <KpiCard
              label="YoY Growth"
              value={`+${yoyGrowth}%`}
              icon="sparkle"
              subtitle="vs Apr 2025"
              borderColor="#10b981"
            />
            <KpiCard
              label="Best Performer"
              value={bestPractice?.name ?? "–"}
              icon="check"
              subtitle={bestPractice ? formatCurrency(bestPractice.revenue) : ""}
              borderColor="#f59e0b"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-line overflow-x-auto pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition -mb-px",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {!loading && (
          <>
            {activeTab === "Overview"    && <OverviewTab   businesses={businesses} filterPractice={filterPractice} />}
            {activeTab === "Revenue"     && <RevenueTab    businesses={businesses} filterPractice={filterPractice} />}
            {activeTab === "Leads"       && <LeadsTab      filterPractice={filterPractice} />}
            {activeTab === "Operations"  && <OperationsTab />}
            {activeTab === "Trends"      && <TrendsTab />}
          </>
        )}
      </main>
    </>
  );
}
