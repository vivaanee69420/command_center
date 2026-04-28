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

const OPS_DATA = {
  Ashford:       { waitTime: 8,  noShow: 4.2, chairUtil: 87, staffEff: 92 },
  Rochester:     { waitTime: 12, noShow: 7.1, chairUtil: 71, staffEff: 78 },
  Barnet:        { waitTime: 10, noShow: 5.5, chairUtil: 83, staffEff: 85 },
  Bexleyheath:   { waitTime: 9,  noShow: 4.8, chairUtil: 85, staffEff: 88 },
  "Warwick Lodge":{ waitTime: 14, noShow: 8.3, chairUtil: 68, staffEff: 74 },
  "Rye Dental":  { waitTime: 11, noShow: 6.2, chairUtil: 75, staffEff: 80 },
  Academy:       { waitTime: 6,  noShow: 3.1, chairUtil: 91, staffEff: 95 },
  Lab:           { waitTime: 5,  noShow: 2.0, chairUtil: 94, staffEff: 97 },
  Accounts:      { waitTime: 4,  noShow: 1.5, chairUtil: 96, staffEff: 98 },
};

const LEADS_DATA = {
  Ashford:       { total: 29, qualified: 21, appts: 12, conversions: 8  },
  Rochester:     { total: 12, qualified: 8,  appts: 6,  conversions: 5  },
  Barnet:        { total: 22, qualified: 16, appts: 13, conversions: 11 },
  Bexleyheath:   { total: 38, qualified: 27, appts: 12, conversions: 8  },
  "Warwick Lodge":{ total: 35, qualified: 24, appts: 14, conversions: 11 },
  "Rye Dental":  { total: 36, qualified: 22, appts: 9,  conversions: 6  },
  Academy:       { total: 35, qualified: 28, appts: 15, conversions: 10 },
  Lab:           { total: 21, qualified: 14, appts: 10, conversions: 8  },
  Accounts:      { total: 13, qualified: 9,  appts: 9,  conversions: 8  },
};

const PREV_REVENUE = {
  Ashford: 109600, Rochester: 68800, Barnet: 112300,
  Bexleyheath: 122100, "Warwick Lodge": 119200, "Rye Dental": 117600,
  Academy: 90300, Lab: 88800, Accounts: 129000,
};

const SERVICE_MIX = [
  { label: "Implants",    pct: 28, color: "#7c3aed" },
  { label: "Invisalign",  pct: 22, color: "#3b82f6" },
  { label: "General",     pct: 25, color: "#10b981" },
  { label: "Cosmetic",    pct: 15, color: "#f59e0b" },
  { label: "Emergency",   pct: 10, color: "#ef4444" },
];

const LEAD_SOURCES = [
  { label: "Google Ads", pct: 38, color: "#3b82f6" },
  { label: "Facebook",   pct: 24, color: "#7c3aed" },
  { label: "Website",    pct: 18, color: "#10b981" },
  { label: "Referral",   pct: 14, color: "#f59e0b" },
  { label: "Walk-in",    pct: 6,  color: "#ef4444" },
];

const TRENDS = [
  { name: "Group Revenue",    value: "£884k",  dir: "up",   change: "+12.5%", spark: [60,65,70,68,75,84] },
  { name: "Lead Volume",      value: "241",    dir: "up",   change: "+8.3%",  spark: [40,42,45,44,48,55] },
  { name: "Avg Booking Rate", value: "38.5%",  dir: "up",   change: "+3.1%",  spark: [30,32,35,34,36,38] },
  { name: "No-Show Rate",     value: "5.3%",   dir: "down", change: "-0.8%",  spark: [8,7.5,7,6.5,6,5.3] },
  { name: "Chair Utilisation","value": "83%",  dir: "up",   change: "+4.2%",  spark: [70,72,75,78,80,83] },
  { name: "Ad ROI",           value: "9.2x",   dir: "down", change: "-1.1x",  spark: [12,11,10.5,10,9.5,9.2] },
];

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

      {/* MoM comparison + service mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Month-over-month */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">Month-over-Month Comparison</h3>
          <div className="space-y-2.5">
            {rows.map(b => {
              const prev = PREV_REVENUE[b.name] || b.revenue;
              const diff = b.revenue - prev;
              const pos = diff >= 0;
              return (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-muted truncate">{b.name}</span>
                  <div className="flex-1 relative h-6 bg-bg-soft rounded overflow-hidden flex">
                    <div
                      className="h-full bg-slate-300 rounded-l"
                      style={{ width: `${Math.min(100, (prev / maxRev) * 100)}%` }}
                    />
                  </div>
                  <div className="flex-1 relative h-6 bg-bg-soft rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(100, (b.revenue / maxRev) * 100)}%`,
                        backgroundColor: pos ? "#10b981" : "#ef4444"
                      }}
                    />
                  </div>
                  <span className={cn("text-xs font-semibold w-16 text-right", pos ? "text-green-600" : "text-red-500")}>
                    {pos ? "+" : ""}{formatCurrency(Math.abs(diff))}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-3 pt-1 border-t border-line text-[10px] text-muted">
              <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-slate-300" /> Last Month</div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-green-400" /> This Month</div>
            </div>
          </div>
        </div>

        {/* Revenue by service type */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">Revenue by Service Type</h3>
          <div className="space-y-3">
            {SERVICE_MIX.map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-ink">{s.label}</span>
                  <span className="font-semibold text-muted">{s.pct}%</span>
                </div>
                <div className="h-2.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-4">Based on group-level treatment revenue split, Apr 2026</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Leads ───────────────────────────────────────────────────────────

function LeadsTab({ businesses, filterPractice }) {
  const rows = businesses.filter(b => filterPractice === "All" || b.name === filterPractice);

  const totals = rows.reduce(
    (acc, b) => {
      const d = LEADS_DATA[b.name] || { total:0, qualified:0, appts:0, conversions:0 };
      return { total: acc.total+d.total, qualified: acc.qualified+d.qualified, appts: acc.appts+d.appts, conversions: acc.conversions+d.conversions };
    },
    { total:0, qualified:0, appts:0, conversions:0 }
  );

  const funnel = [
    { label: "Total Leads",  value: totals.total,       color: "#3b82f6", bg: "#eff6ff" },
    { label: "Qualified",    value: totals.qualified,    color: "#7c3aed", bg: "#ede9fe" },
    { label: "Appointments", value: totals.appts,        color: "#f59e0b", bg: "#fffbeb" },
    { label: "Conversions",  value: totals.conversions,  color: "#10b981", bg: "#f0fdf4" },
  ];

  return (
    <div className="space-y-5">
      {/* Funnel */}
      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-5">Leads Funnel</h3>
        <div className="flex flex-col items-center gap-0">
          {funnel.map((stage, i) => {
            const widthPct = 100 - i * 15;
            const convRate = i === 0 ? 100 : Math.round((stage.value / funnel[0].value) * 100);
            return (
              <div key={stage.label} className="w-full flex flex-col items-center">
                <div
                  className="flex items-center justify-between px-6 py-3 rounded-lg"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: stage.bg,
                    border: `1.5px solid ${stage.color}20`,
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                  <div className="text-right">
                    <span className="text-xl font-bold" style={{ color: stage.color }}>{formatNumber(stage.value)}</span>
                    {i > 0 && <span className="text-xs text-muted ml-2">({convRate}% of total)</span>}
                  </div>
                </div>
                {i < funnel.length - 1 && (
                  <div className="w-0.5 h-4 bg-line" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Source breakdown + leads by practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lead source pie (CSS segments) */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">Lead Source Breakdown</h3>
          <div className="space-y-3">
            {LEAD_SOURCES.map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-medium text-ink">{s.label}</span>
                  </div>
                  <span className="font-semibold text-muted">{s.pct}%</span>
                </div>
                <div className="h-2.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads by practice table */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h3 className="text-sm font-bold text-ink mb-4">Leads by Practice</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line">
                  {["Practice","Total","Qualified","Appts","Conv.","Conv. %"].map(h => (
                    <th key={h} className="py-2 px-2 text-left font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(b => {
                  const d = LEADS_DATA[b.name] || { total:0, qualified:0, appts:0, conversions:0 };
                  const convPct = d.total > 0 ? Math.round((d.conversions / d.total) * 100) : 0;
                  return (
                    <tr key={b.name} className="border-b border-line hover:bg-bg-soft">
                      <td className="py-2 px-2 font-semibold text-ink">{b.emoji} {b.name}</td>
                      <td className="py-2 px-2 text-ink">{d.total}</td>
                      <td className="py-2 px-2 text-ink">{d.qualified}</td>
                      <td className="py-2 px-2 text-ink">{d.appts}</td>
                      <td className="py-2 px-2 font-semibold text-green-700">{d.conversions}</td>
                      <td className="py-2 px-2">
                        <span className={cn("font-semibold", convPct >= 30 ? "text-green-600" : convPct >= 20 ? "text-yellow-600" : "text-red-500")}>
                          {convPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Operations ──────────────────────────────────────────────────────

function OperationsTab({ businesses, filterPractice }) {
  const rows = businesses.filter(b => filterPractice === "All" || b.name === filterPractice);

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h3 className="text-sm font-bold text-ink">Practice Operations Metrics</h3>
        <p className="text-xs text-muted mt-0.5">Apr 2026 · Targets: wait &lt;10min, no-show &lt;5%, chair util &gt;85%, staff eff &gt;90%</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-soft border-b border-line">
              {["Practice","Avg Wait (min)","No-Show Rate","Chair Utilisation","Staff Efficiency"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => {
              const d = OPS_DATA[b.name] || { waitTime:10, noShow:5, chairUtil:80, staffEff:85 };
              const waitOk = d.waitTime <= 10;
              const noShowOk = d.noShow <= 5;
              const chairOk = d.chairUtil >= 85;
              const staffOk = d.staffEff >= 90;

              function Pill({ ok, val, unit }) {
                return (
                  <span className={cn("px-2 py-0.5 rounded-full font-semibold text-[11px]", ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600")}>
                    {val}{unit}
                  </span>
                );
              }

              return (
                <tr key={b.name} className={cn("border-b border-line hover:bg-bg-soft transition", i % 2 === 0 ? "" : "bg-bg-soft/40")}>
                  <td className="px-4 py-3 font-semibold text-ink">{b.emoji} {b.name}</td>
                  <td className="px-4 py-3"><Pill ok={waitOk}   val={d.waitTime} unit=" min" /></td>
                  <td className="px-4 py-3"><Pill ok={noShowOk} val={d.noShow}   unit="%"    /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-line rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.chairUtil}%`, backgroundColor: chairOk ? "#10b981" : "#f59e0b" }} />
                      </div>
                      <span className={cn("font-semibold", chairOk ? "text-green-700" : "text-yellow-700")}>{d.chairUtil}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-line rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.staffEff}%`, backgroundColor: staffOk ? "#10b981" : "#f59e0b" }} />
                      </div>
                      <span className={cn("font-semibold", staffOk ? "text-green-700" : "text-yellow-700")}>{d.staffEff}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Trends ──────────────────────────────────────────────────────────

function TrendsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TRENDS.map(t => (
        <div key={t.name} className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">{t.name}</p>
            <TrendIcon dir={t.dir} />
          </div>
          <p className="text-2xl font-bold text-ink mb-1">{t.value}</p>
          <p className={cn("text-xs font-semibold mb-4", t.dir === "up" ? "text-green-600" : "text-red-500")}>
            {t.change} last 30 days
          </p>
          <Sparkline data={t.spark} color={t.dir === "up" ? "#10b981" : "#ef4444"} />
        </div>
      ))}
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
            {activeTab === "Overview"    && <OverviewTab    businesses={businesses} filterPractice={filterPractice} />}
            {activeTab === "Revenue"     && <RevenueTab     businesses={businesses} filterPractice={filterPractice} />}
            {activeTab === "Leads"       && <LeadsTab       businesses={businesses} filterPractice={filterPractice} />}
            {activeTab === "Operations"  && <OperationsTab  businesses={businesses} filterPractice={filterPractice} />}
            {activeTab === "Trends"      && <TrendsTab />}
          </>
        )}
      </main>
    </>
  );
}
