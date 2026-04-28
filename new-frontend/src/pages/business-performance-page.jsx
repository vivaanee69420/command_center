import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import { Edit, Activity, CheckCircle, AlertTriangle, Target, DollarSign, Building2 } from "lucide-react";

const BIZ_UNITS = [
  { name: "GM2 Ashford", type: "Practice", target: 200000, actual: 0, color: "#10b981" },
  { name: "GM1 Rochester", type: "Practice", target: 180000, actual: 0, color: "#3b82f6" },
  { name: "GM4 WLDental", type: "Practice", target: 166700, actual: 0, color: "#f59e0b" },
  { name: "GM3 Barnet", type: "Practice", target: 124600, actual: 0, color: "#7c3aed" },
  { name: "GM Lab", type: "Lab", target: 80000, actual: 0, color: "#3b82f6" },
  { name: "Elevate Dental Academy", type: "Academy - Business Programs", target: 80000, actual: 0, color: "#fb923c" },
  { name: "GM6 BEX", type: "Practice", target: 50000, actual: 0, color: "#ef4444" },
  { name: "Elevate Accounts", type: "Service", target: 20000, actual: 0, color: "#7c3aed" },
];

const MONTHLY_TARGET = 1000000;
const DAILY_TARGET = 50000;
const TOTAL_MARKETING = 120100;
const CURRENT_TOTAL = 0;
const TOTAL_GAP = MONTHLY_TARGET - CURRENT_TOTAL;

const STATUS_CARDS = [
  { label: "Active Businesses", value: 8, icon: Building2, color: "#3b82f6", bg: "#eff6ff" },
  { label: "On Track", value: 0, icon: CheckCircle, color: "#10b981", bg: "#f0fdf4" },
  { label: "Needs Attention", value: 8, icon: AlertTriangle, color: "#f59e0b", bg: "#fffbeb" },
  { label: "Total Gap", value: formatCurrency(TOTAL_GAP), icon: Target, color: "#ef4444", bg: "#fef2f2" },
  { label: "Marketing Budget", value: formatCurrency(TOTAL_MARKETING), icon: DollarSign, color: "#f97316", bg: "#fff7ed" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = ["2025", "2026", "2027"];

export default function BusinessPerformancePage() {
  const [activeView, setActiveView] = useState("Performance");
  const [showBudgets, setShowBudgets] = useState(false);
  const [month, setMonth] = useState("Apr");
  const [year, setYear] = useState("2026");

  const pct = CURRENT_TOTAL / MONTHLY_TARGET * 100;

  return (
    <>
      <Topbar title="Business Performance" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          title="Business Performance"
          subtitle="Track revenue targets and marketing spend allocation"
          right={
            <div className="flex items-center gap-3 flex-wrap">
              {/* View toggle */}
              <div className="flex items-center bg-bg-soft border border-line rounded-lg p-0.5">
                {["Performance", "Marketing Rules"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                      activeView === v ? "bg-white shadow-sm text-ink" : "text-muted hover:text-ink"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBudgets}
                  onChange={(e) => setShowBudgets(e.target.checked)}
                  className="rounded"
                />
                Show budgets
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg text-xs font-medium text-ink hover:bg-bg-soft transition">
                <Edit size={14} />
                Edit
              </button>
            </div>
          }
        />

        {/* Dark Banner */}
        <div className="rounded-xl p-6 mb-6 text-white" style={{ background: "#1e293b" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-1">Group Revenue Target</p>
              <p className="text-xs text-slate-400">{formatCurrency(DAILY_TARGET)}/day × 20 working days = {formatCurrency(MONTHLY_TARGET)}/month</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">0.0%</p>
              <p className="text-xs font-semibold text-red-400 mt-1">Behind Target</p>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.max(0.5, pct)}%` }} />
          </div>

          {/* 5 metric boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            {[
              { label: "Monthly Target", value: formatCurrency(MONTHLY_TARGET), color: "text-white" },
              { label: "Current Total", value: formatCurrency(CURRENT_TOTAL), color: "text-white" },
              { label: "Gap to Target", value: formatCurrency(TOTAL_GAP), color: "text-red-400" },
              { label: "Daily Target", value: formatCurrency(DAILY_TARGET), color: "text-white" },
              { label: "Total Marketing", value: formatCurrency(TOTAL_MARKETING), color: "text-orange-400" },
            ].map((m) => (
              <div key={m.label} className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{m.label}</p>
                <p className={cn("text-sm font-bold", m.color)}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Daily average row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400">Current Daily Average <span className="text-white font-semibold">{formatCurrency(0)}/day</span></p>
            <p className="text-xs text-red-400 font-medium">£{formatCurrency(DAILY_TARGET)}/day required — £{formatCurrency(DAILY_TARGET)} gap/day</p>
            <p className="text-xs text-green-400 font-semibold">Required Daily Average {formatCurrency(DAILY_TARGET)}/day</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {STATUS_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white border border-line rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.bg }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wide font-semibold">{card.label}</p>
                  <p className="text-base font-bold text-ink">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Business Units */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h2 className="text-sm font-bold text-ink mb-4">Business Units</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BIZ_UNITS.map((biz) => {
              const gap = biz.target - biz.actual;
              const pct = biz.actual / biz.target * 100;
              return (
                <div key={biz.name} className="border border-line rounded-xl p-4 hover:bg-bg-soft transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: biz.color }} />
                      <span className="text-sm font-bold text-ink">{biz.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-bg-soft rounded-full text-muted font-medium border border-line">{biz.type}</span>
                    </div>
                    <span className="text-xs font-bold text-muted">0%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted">Target: <span className="text-ink font-semibold">{formatCurrency(biz.target)}</span></span>
                    <span className="text-muted">Actual: <span className="text-ink font-semibold">{formatCurrency(biz.actual)}</span></span>
                  </div>
                  <div className="h-1.5 bg-line rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(0.5, pct)}%`, backgroundColor: biz.color }} />
                  </div>
                  <p className="text-xs text-red-500 font-medium">Gap: {formatCurrency(gap)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
