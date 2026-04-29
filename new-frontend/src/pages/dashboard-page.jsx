import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { api } from "@/api/client";
import { useAuth } from "@/contexts/auth-context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(val) {
  if (val == null) return "£0";
  return "£" + Number(val).toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function formatDelta(trend) {
  if (trend == null) return "";
  const sign = trend >= 0 ? "+" : "";
  return `${sign}${trend}%`;
}

function healthDotColor(attainmentPct) {
  if (attainmentPct >= 80) return "bg-green-500";
  if (attainmentPct >= 50) return "bg-amber-400";
  return "bg-red-400";
}

const STATUS_MAP = {
  backlog: "TO DO",
  todo: "TO DO",
  in_progress: "IN PROGRESS",
  review: "REVIEW",
  done: "DONE",
};

const AVATAR_COLORS = ["#7c3aed", "#2e75b6", "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#16a34a"];

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sparkline({ positive }) {
  const points = positive
    ? "0,28 10,22 20,26 30,18 40,14 50,20 60,10"
    : "0,10 10,14 20,12 30,18 40,22 50,20 60,28";
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" className="mt-2">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({ emoji, bg, label, value, delta, positive }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg", bg)}>
        {emoji}
      </div>
      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">{label}</div>
      <div className="text-2xl font-bold text-ink mt-0.5">{value}</div>
      <div className={cn("text-xs mt-1", positive ? "text-green-600" : "text-red-500")}>{delta}</div>
      <Sparkline positive={positive} />
    </div>
  );
}

function BusinessesOverview({ metrics, loading }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5 flex-1 min-w-0">
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-bold text-ink">Businesses Overview</span>
        <button className="text-xs text-primary font-semibold hover:underline">
          View All Businesses →
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted py-8 text-center">Loading businesses...</div>
      ) : metrics.length === 0 ? (
        <div className="text-sm text-muted py-8 text-center">No businesses found. Seed the database to get started.</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {["BUSINESS", "REVENUE (MTD)", "LEADS (WEEK)", "ATTAINMENT", "ACTIVE TASKS"].map((col) => (
                <th
                  key={col}
                  className="text-[10px] font-bold text-muted uppercase tracking-wider pb-2 text-left first:pr-4"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((biz) => (
              <tr key={biz.id} className="border-b border-line/50 hover:bg-bg-soft transition">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full flex-shrink-0",
                        healthDotColor(biz.attainmentPct)
                      )}
                    />
                    <span className="text-sm font-semibold text-ink whitespace-nowrap">{biz.name}</span>
                  </div>
                </td>
                <td className="py-2 text-sm text-ink">{formatCurrency(biz.revenue)}</td>
                <td className="py-2 text-sm text-ink">{biz.leadsThisWeek}</td>
                <td className="py-2 text-sm text-ink">{biz.attainmentPct}%</td>
                <td className="py-2 text-sm text-ink">{biz.activeTasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AIMorningBrief({ insights, loading, onRefresh }) {
  const bullets = [];
  if (insights) {
    if (insights.executiveSummary) bullets.push(insights.executiveSummary);
    if (insights.urgentActions) {
      insights.urgentActions.slice(0, 2).forEach((a) => bullets.push(a.action));
    }
    if (insights.weeklyPriorities) {
      insights.weeklyPriorities.slice(0, 1).forEach((p) => bullets.push(p.priority));
    }
    if (insights.riskAlerts) {
      insights.riskAlerts.slice(0, 1).forEach((r) => bullets.push(r.risk));
    }
  }

  return (
    <div className="bg-white border border-line rounded-xl p-5 w-[360px] flex-shrink-0">
      <div className="flex justify-between items-center mb-3">
        <span className="text-base font-bold text-ink">AI Morning Brief</span>
        <button onClick={onRefresh} className="text-xs text-muted hover:text-ink transition">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted py-4">Generating insights...</div>
      ) : bullets.length === 0 ? (
        <div className="text-sm text-muted py-4">No insights available. Check API connection.</div>
      ) : (
        <>
          <div className="text-sm font-semibold text-ink">Good morning 👋</div>
          <div className="text-xs text-muted mt-1">Here's what needs your attention today.</div>
          <ul className="mt-3 space-y-2">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold leading-5 flex-shrink-0">›</span>
                <span className="text-sm text-ink">{bullet}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <button className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-green-500 hover:opacity-90 transition">
        📨 Send Morning Brief
      </button>
    </div>
  );
}

function KanbanBoard({ tasks, loading }) {
  const columns = ["TO DO", "IN PROGRESS", "REVIEW", "DONE"];

  const grouped = {};
  columns.forEach((col) => (grouped[col] = []));

  if (tasks) {
    tasks.forEach((t) => {
      const col = STATUS_MAP[t.status] || "TO DO";
      if (grouped[col]) grouped[col].push(t);
    });
  }

  if (loading) {
    return <div className="text-sm text-muted py-4 text-center">Loading tasks...</div>;
  }

  return (
    <div className="flex gap-4">
      {columns.map((colLabel) => {
        const items = grouped[colLabel] || [];
        return (
          <div key={colLabel} className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{colLabel}</span>
              <span className="text-xs font-bold text-muted">{items.length}</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-xs text-muted p-3 border border-dashed border-line rounded-lg text-center">
                  No tasks
                </div>
              ) : (
                items.slice(0, 5).map((task) => (
                  <div key={task.id} className="bg-white border border-line rounded-lg p-3">
                    <div className="text-sm font-semibold text-ink line-clamp-2">{task.title}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {task.business_name || task.priority || ""}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{
                          backgroundColor:
                            task.owner_color ||
                            AVATAR_COLORS[
                              (task.owner_name || "").length % AVATAR_COLORS.length
                            ],
                        }}
                      >
                        {getInitials(task.owner_name)}
                      </div>
                      <span className="text-[10px] text-muted uppercase">
                        {task.due_at ? formatDate(task.due_at) : "No date"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AlertsBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="space-y-2 mb-6">
      {alerts.slice(0, 3).map((alert, i) => (
        <div
          key={i}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-medium",
            alert.severity === "high"
              ? "bg-red-50 text-red-700 border border-red-200"
              : alert.severity === "medium"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
          )}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { label: "📋 Projects & Tasks", key: "tasks" },
  { label: "🚀 Marketing OS", key: "marketing" },
  { label: "📊 CRM Pipeline", key: "crm" },
  { label: "✨ AI Insights", key: "ai" },
  { label: "📈 Reports", key: "reports" },
  { label: "📅 Calendar", key: "calendar" },
];

export default function DashboardPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("tasks");
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");

  // Data state
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [insights, setInsights] = useState(null);

  // Loading state
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Fetch dashboard summary + tasks on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setSummaryLoading(true);
      setTasksLoading(true);
      setError(null);

      try {
        const [summaryRes, tasksRes] = await Promise.allSettled([
          api.dashboardSummary(),
          api.tasks(),
        ]);

        if (cancelled) return;

        if (summaryRes.status === "fulfilled") {
          setSummary(summaryRes.value);
        } else {
          const msg = summaryRes.reason?.message || "";
          if (msg.includes("401")) {
            // Token expired or missing — force re-login
            logout();
            return;
          }
          setError("Failed to load dashboard: " + (msg || "Unknown error"));
        }

        if (tasksRes.status === "fulfilled") {
          const rawTasks = Array.isArray(tasksRes.value) ? tasksRes.value : tasksRes.value?.items || [];
          // Enrich tasks with owner names from team performance data
          const teamMap = {};
          if (summaryRes.status === "fulfilled" && summaryRes.value?.teamPerformance) {
            summaryRes.value.teamPerformance.forEach((m) => {
              teamMap[m.id] = { name: m.name, color: m.color };
            });
          }
          const enriched = rawTasks.map((t) => {
            const owner = teamMap[t.owner_id];
            return {
              ...t,
              owner_name: owner?.name || null,
              owner_color: owner?.color || null,
            };
          });
          setTasks(enriched);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
          setTasksLoading(false);
        }
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  // Fetch AI insights once summary is loaded
  const fetchInsights = useCallback(async () => {
    if (!summary) return;
    setInsightsLoading(true);
    try {
      const context = {
        metrics: {
          revenue: summary.revenue,
          leads: summary.leads,
          bookings: summary.bookings,
          tasks: summary.tasks,
          adSpend: summary.adSpend,
        },
        teamPerformance: summary.teamPerformance || [],
        alerts: summary.alerts || [],
      };
      const res = await api.aiCeoInsights(context, "overall");
      if (res?.success && res.insights) {
        setInsights(res.insights);
      }
    } catch (e) {
      console.warn("AI insights failed:", e.message);
    } finally {
      setInsightsLoading(false);
    }
  }, [summary]);

  // Auto-fetch insights when summary arrives
  useEffect(() => {
    if (summary && !insights) {
      fetchInsights();
    }
  }, [summary, insights, fetchInsights]);

  // Build KPI cards from summary
  const kpiCards = summary
    ? [
        {
          emoji: "💰",
          bg: "bg-green-50",
          label: "MONTHLY REVENUE",
          value: formatCurrency(summary.revenue.month),
          delta: `${formatDelta(summary.revenue.trend)} vs last month`,
          positive: summary.revenue.trend >= 0,
        },
        {
          emoji: "📋",
          bg: "bg-blue-50",
          label: "LEADS THIS WEEK",
          value: String(summary.leads.week),
          delta: `${summary.leads.today} today · ${formatDelta(summary.leads.trend)} trend`,
          positive: summary.leads.trend >= 0,
        },
        {
          emoji: "🎯",
          bg: "bg-purple-50",
          label: "CONVERSION RATE",
          value: `${summary.bookings.conversionRate}%`,
          delta: `${summary.bookings.today} bookings today · ${summary.bookings.week} this week`,
          positive: summary.bookings.conversionRate > 0,
        },
        {
          emoji: "✅",
          bg: "bg-amber-50",
          label: "TASKS",
          value: `${summary.tasks.completed}/${summary.tasks.completed + summary.tasks.pending}`,
          delta: `${summary.tasks.overdue} overdue · ${summary.tasks.pending} pending`,
          positive: summary.tasks.overdue === 0,
        },
      ]
    : [];

  return (
    <>
      <Topbar
        title="Command Centre"
        subtitle="Overview of your entire business ecosystem"
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter mode={mode} setMode={setMode} activeBiz={activeBiz} setActiveBiz={setActiveBiz} />

        {/* Error banner */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-6 mt-6">
          <div className="flex-1 min-w-0">

            {/* Alerts */}
            {summary && <AlertsBanner alerts={summary.alerts} />}

            {/* KPI Strip */}
            {summaryLoading ? (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-line rounded-xl p-5 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-gray-100" />
                    <div className="h-3 w-20 bg-gray-100 rounded mt-3" />
                    <div className="h-6 w-28 bg-gray-100 rounded mt-2" />
                    <div className="h-3 w-32 bg-gray-100 rounded mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {kpiCards.map((card) => (
                  <KpiCard key={card.label} {...card} />
                ))}
              </div>
            )}

            {/* Middle row */}
            <div className="flex gap-6 mb-6">
              <BusinessesOverview
                metrics={summary?.businessMetrics || []}
                loading={summaryLoading}
              />
              <AIMorningBrief
                insights={insights}
                loading={insightsLoading}
                onRefresh={fetchInsights}
              />
            </div>

            {/* Bottom section: tabs + kanban */}
            <div className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-center gap-1 border-b border-line mb-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "pb-2 px-3 text-sm transition-colors",
                      activeTab === tab.key
                        ? "font-semibold text-primary border-b-2 border-primary"
                        : "font-medium text-muted hover:text-ink"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-bold text-ink">Kanban Board</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted cursor-pointer hover:text-ink transition">⚙ Filter</span>
                  <span className="text-xs text-muted">Group: Status</span>
                </div>
              </div>

              <KanbanBoard tasks={tasks} loading={tasksLoading} />
            </div>

          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
