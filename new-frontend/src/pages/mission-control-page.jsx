import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/topbar";
import { BUSINESSES, USERS_DEFAULT } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/api/client";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wifi,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Activity,
  Users,
  Brain,
  BarChart3,
  Megaphone,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

// ─── Static Fallback ──────────────────────────────────────────────────────────

const BIZ_STATUS = {
  ashford:       "green",
  rochester:     "amber",
  barnet:        "green",
  bexleyheath:   "green",
  "warwick-lodge": "red",
  "rye-dental":  "amber",
  academy:       "amber",
  lab:           "green",
  accounts:      "green",
};

const FALLBACK_WARNINGS = [
  { id: "w1", business: "Warwick Lodge", message: "Lead volume 38% below target — 3 consecutive days", severity: "danger", time: "2h ago" },
  { id: "w2", business: "Rochester", message: "Booking conversion rate dropped to 12% (target 35%+)", severity: "danger", time: "4h ago" },
  { id: "w3", business: "Rye Dental", message: "CPL £128 — above £90 threshold. Review ad targeting", severity: "warning", time: "6h ago" },
  { id: "w4", business: "Academy", message: "Ad spend £3,434 — ROI below 5x for the week", severity: "warning", time: "8h ago" },
  { id: "w5", business: "All Practices", message: "2 tasks overdue with no owner assigned", severity: "info", time: "12h ago" },
];

const QUICK_ACTIONS = [
  { label: "Regenerate AI Brain", icon: Brain, color: "#7c3aed", bg: "bg-purple-50 hover:bg-purple-100 border-purple-200", textCls: "text-purple-700", action: "regenerate" },
  { label: "View All Tasks", icon: ClipboardList, color: "#3b82f6", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200", textCls: "text-blue-700", action: "tasks" },
  { label: "Check Ads", icon: Megaphone, color: "#f59e0b", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200", textCls: "text-amber-700", action: "ads" },
  { label: "Team Hub", icon: Users, color: "#10b981", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", textCls: "text-emerald-700", action: "team" },
];

const STATUS_META = {
  green: { label: "Healthy",  dot: "bg-emerald-500", bar: "bg-emerald-500", ring: "ring-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  amber: { label: "Watch",    dot: "bg-amber-400",   bar: "bg-amber-400",   ring: "ring-amber-200",  badge: "bg-amber-100 text-amber-700" },
  red:   { label: "At Risk",  dot: "bg-red-500",     bar: "bg-red-500",     ring: "ring-red-200",    badge: "bg-red-100 text-red-700" },
};

const SEVERITY_META = {
  danger:  { cls: "bg-red-50 border-red-200",    dot: "bg-red-500",     badge: "bg-red-100 text-red-700",     icon: AlertTriangle },
  warning: { cls: "bg-amber-50 border-amber-200", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700",  icon: AlertTriangle },
  info:    { cls: "bg-blue-50 border-blue-200",   dot: "bg-blue-500",  badge: "bg-blue-100 text-blue-700",    icon: Activity },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime() {
  return new Date().toLocaleString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}

// ─── Practice Health Card ─────────────────────────────────────────────────────

function PracticeCard({ biz, alertCount }) {
  const status = BIZ_STATUS[biz.slug] || "green";
  const meta = STATUS_META[status];
  const maxRev = 130000;
  const pct = Math.min(100, Math.round((biz.revenue / maxRev) * 100));

  return (
    <div className={cn("bg-white border border-line rounded-xl p-4 shadow-sm ring-1", meta.ring)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{biz.emoji}</span>
          <div>
            <p className="text-xs font-bold text-ink">{biz.name}</p>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", meta.badge)}>
              {meta.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", meta.dot)} />
          {alertCount > 0 && (
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
              {alertCount} alert{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Revenue gauge */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-bold text-ink">{formatCurrency(biz.revenue)}</span>
          <span className="text-[10px] text-muted">{pct}% of target</span>
        </div>
        <div className="h-2 bg-line rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", meta.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="bg-bg-soft rounded-lg py-1.5">
          <p className="text-xs font-bold text-ink">{biz.leads}</p>
          <p className="text-[9px] text-muted">Leads</p>
        </div>
        <div className="bg-bg-soft rounded-lg py-1.5">
          <p className="text-xs font-bold text-ink">{biz.bookings}</p>
          <p className="text-[9px] text-muted">Bookings</p>
        </div>
        <div className="bg-bg-soft rounded-lg py-1.5">
          <p className={cn("text-xs font-bold", biz.trend > 0 ? "text-emerald-600" : "text-red-500")}>
            {biz.trend > 0 ? "+" : ""}{biz.trend}%
          </p>
          <p className="text-[9px] text-muted">Trend</p>
        </div>
      </div>
    </div>
  );
}

// ─── Team Activity ────────────────────────────────────────────────────────────

const TEAM_ACTIVITY = [
  { user: "Nikhil", action: "Reviewing Ashford ad performance", since: "09:30" },
  { user: "Fatima", action: "Writing SEO blog for Rochester", since: "09:45" },
  { user: "Maryam", action: "Building GHL automation workflow", since: "10:00" },
  { user: "Sona", action: "Calling Rye Dental leads", since: "10:15" },
  { user: "Abhishek", action: "Editing Barnet Instagram Reel", since: "10:30" },
  { user: "Ruhith Pasha", action: "Fixing booking funnel bug", since: "08:00" },
];

function TeamActivity() {
  return (
    <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2">
        <Users size={14} className="text-primary" />
        <h3 className="text-sm font-bold text-ink">Team Activity</h3>
        <span className="ml-auto text-[10px] text-muted bg-bg-soft border border-line rounded px-2 py-0.5">
          {TEAM_ACTIVITY.length} active
        </span>
      </div>
      <div className="divide-y divide-line">
        {TEAM_ACTIVITY.map((item) => {
          const user = USERS_DEFAULT.find((u) => u.name === item.user);
          const color = user?.color || "#94a3b8";
          return (
            <div key={item.user} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-soft transition">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: color }}
              >
                {item.user.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink">{item.user}</p>
                <p className="text-[11px] text-muted truncate">{item.action}</p>
              </div>
              <span className="text-[10px] text-muted font-mono shrink-0">{item.since}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  const [dateTime, setDateTime] = useState(formatDateTime());
  const [summary, setSummary] = useState(null);
  const [apiTasks, setApiTasks] = useState([]);
  const [warnings, setWarnings] = useState(FALLBACK_WARNINGS);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Clock tick every minute
  useEffect(() => {
    const id = setInterval(() => setDateTime(formatDateTime()), 60000);
    return () => clearInterval(id);
  }, []);

  // Data fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, taskData, warnData] = await Promise.allSettled([
        api.dashboardSummary(),
        api.tasks(),
        api.warnings(),
      ]);
      if (sumData.status === "fulfilled") setSummary(sumData.value);
      if (taskData.status === "fulfilled") setApiTasks(taskData.value || []);
      if (warnData.status === "fulfilled" && warnData.value?.length) {
        setWarnings(warnData.value.map((w) => ({
          id: w.id,
          business: w.business_name || "All",
          message: w.message || w.title,
          severity: w.severity || "warning",
          time: w.created_at ? new Date(w.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
        })));
      }
    } catch {
      // silently fall back to seed data
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute KPIs
  const kpis = (() => {
    const groupRevenue = BUSINESSES.reduce((s, b) => s + b.revenue, 0);
    const activeAlerts = warnings.filter((w) => w.severity === "danger").length;
    const overdue = apiTasks.filter((t) => t.due_at && new Date(t.due_at) < new Date() && t.status !== "done").length;
    const done = apiTasks.filter((t) => t.status === "done").length;
    const total = apiTasks.length;
    return { groupRevenue, activeAlerts, overdue, teamOnline: 7, systemHealth: "Operational", done, total };
  })();

  async function handleQuickAction(action) {
    if (action === "regenerate") {
      setRegenerating(true);
      try { await api.regenerate(); } catch {}
      setRegenerating(false);
    } else if (action === "tasks") {
      window.location.href = "/tasks";
    } else if (action === "ads") {
      window.location.href = "/ads-manager";
    } else if (action === "team") {
      window.location.href = "/team";
    }
  }

  // System health indicator
  const healthColor = kpis.activeAlerts === 0 ? "text-emerald-600 bg-emerald-50" :
    kpis.activeAlerts <= 2 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";

  return (
    <>
      <Topbar title="Mission Control" />

      <main className="p-6 max-w-[1600px] mx-auto w-full space-y-5">

        {/* ── Top Banner ── */}
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #0e2a47 0%, #1f4470 60%, #2e3f6f 100%)" }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-white">Mission Control</h1>
                <LiveBadge />
              </div>
              <p className="text-sm text-white/60">{dateTime}</p>
              <p className="text-xs text-white/40 mt-1">
                Last refreshed {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border", healthColor)}>
                <CheckCircle size={14} />
                {kpis.systemHealth}
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Group Revenue", value: formatCurrency(kpis.groupRevenue), icon: TrendingUp, color: "#10b981", sub: "monthly" },
            { label: "Active Alerts", value: kpis.activeAlerts, icon: AlertTriangle, color: kpis.activeAlerts > 0 ? "#ef4444" : "#10b981", sub: "critical" },
            { label: "Tasks Overdue", value: kpis.overdue, icon: Clock, color: kpis.overdue > 0 ? "#f59e0b" : "#10b981", sub: "need attention" },
            { label: "Team Online", value: `${kpis.teamOnline} / ${USERS_DEFAULT.length}`, icon: Wifi, color: "#6366f1", sub: "members" },
            { label: "System Health", value: kpis.systemHealth, icon: Activity, color: "#10b981", sub: "all services up" },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white border border-line rounded-xl p-4 shadow-sm" style={{ borderLeftWidth: 3, borderLeftColor: k.color }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wide">{k.label}</span>
                  <Icon size={14} style={{ color: k.color }} />
                </div>
                <div className="text-lg font-bold text-ink">{k.value}</div>
                <p className="text-[10px] text-muted mt-0.5">{k.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.action}
                onClick={() => handleQuickAction(qa.action)}
                disabled={qa.action === "regenerate" && regenerating}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm transition",
                  qa.bg, qa.textCls
                )}
              >
                <Icon size={16} />
                <span className="font-semibold text-xs">
                  {qa.action === "regenerate" && regenerating ? "Regenerating..." : qa.label}
                </span>
                <ChevronRight size={14} className="ml-auto opacity-50" />
              </button>
            );
          })}
        </div>

        {/* ── Practice Health Grid ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={15} className="text-ink" />
            <h2 className="text-sm font-bold text-ink">Practice Health</h2>
            <span className="text-[11px] text-muted ml-1">— live metrics across all 9 businesses</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {BUSINESSES.map((biz) => {
              const alertCount = warnings.filter((w) => w.business === biz.name && w.severity === "danger").length;
              return <PracticeCard key={biz.slug} biz={biz} alertCount={alertCount} />;
            })}
          </div>
        </div>

        {/* ── Alert Feed + Team Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          {/* Alert Feed */}
          <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              <h3 className="text-sm font-bold text-ink">Alert Feed</h3>
              <span className="ml-2 text-[10px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {warnings.filter((w) => w.severity === "danger").length} critical
              </span>
              <span className="ml-auto text-[10px] text-muted">{warnings.length} total</span>
            </div>
            <div className="divide-y divide-line max-h-[480px] overflow-y-auto">
              {warnings.map((w) => {
                const meta = SEVERITY_META[w.severity] || SEVERITY_META.info;
                const Icon = meta.icon;
                return (
                  <div key={w.id} className={cn("px-4 py-3.5 flex gap-3 border-l-4", meta.cls)} style={{ borderLeftColor: w.severity === "danger" ? "#ef4444" : w.severity === "warning" ? "#f59e0b" : "#3b82f6" }}>
                    <Icon size={15} className={w.severity === "danger" ? "text-red-500" : w.severity === "warning" ? "text-amber-500" : "text-blue-500"} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", meta.badge)}>
                          {w.severity.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-semibold text-muted">{w.business}</span>
                        <span className="ml-auto text-[10px] text-muted">{w.time}</span>
                      </div>
                      <p className="text-xs text-ink font-medium leading-snug">{w.message}</p>
                    </div>
                  </div>
                );
              })}
              {warnings.length === 0 && (
                <div className="py-12 text-center">
                  <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-ink">All clear — no active alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Activity */}
          <TeamActivity />
        </div>
      </main>
    </>
  );
}
