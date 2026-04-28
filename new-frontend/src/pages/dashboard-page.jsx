import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import KpiCard from "@/components/shared/kpi-card";
import AlertBanner from "@/components/shared/alert-banner";
import { BUSINESSES } from "@/lib/data";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { api } from "@/api/client";
import {
  RefreshCw, Building2, Users, AlertTriangle, Activity,
  Brain, Sparkles, Target, Phone, MousePointerClick, Zap,
  XCircle, Send,
} from "lucide-react";

const FALLBACK_TEAM = [
  { name: "Gaurav", role: "Director", tasksCompleted: 3, tasksTotal: 5, color: "#0e2a47" },
  { name: "Fatima", role: "Content Manager", tasksCompleted: 4, tasksTotal: 6, color: "#ef4444" },
  { name: "Abhishek", role: "Videographer", tasksCompleted: 2, tasksTotal: 4, color: "#10b981" },
  { name: "Nikhil", role: "Marketing Manager", tasksCompleted: 5, tasksTotal: 8, color: "#f59e0b" },
  { name: "Maryam", role: "GHL Expert", tasksCompleted: 3, tasksTotal: 5, color: "#16a34a" },
  { name: "Veena", role: "SDR", tasksCompleted: 12, tasksTotal: 20, color: "#5b9f61" },
  { name: "Sona", role: "SDR", tasksCompleted: 15, tasksTotal: 20, color: "#3b82f6" },
  { name: "Ruhith", role: "Developer", tasksCompleted: 2, tasksTotal: 4, color: "#2e75b6" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard data
  const [metrics, setMetrics] = useState({
    revenue: { month: 0, target: 1000000, trend: 0 },
    leads: { today: 0, week: 0, trend: 0 },
    bookings: { today: 0, week: 0, conversionRate: 0 },
    adSpend: { month: 0, roi: 0 },
    tasks: { completed: 0, pending: 0, overdue: 0 },
  });
  const [businessMetrics, setBusinessMetrics] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // AI CEO
  const [showAiCeo, setShowAiCeo] = useState(false);
  const [aiCeoInsights, setAiCeoInsights] = useState(null);
  const [aiCeoLoading, setAiCeoLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await api.dashboardSummary();

      setMetrics({
        revenue: data.revenue || { month: 0, target: 1000000, trend: 0 },
        leads: data.leads || { today: 0, week: 0, trend: 0 },
        bookings: data.bookings || { today: 0, week: 0, conversionRate: 0 },
        adSpend: data.adSpend || { month: 0, roi: 0 },
        tasks: data.tasks || { completed: 0, pending: 0, overdue: 0 },
      });

      // Business metrics from API or fallback to static data
      if (data.businessMetrics?.length > 0) {
        setBusinessMetrics(data.businessMetrics.map((biz) => {
          const staticBiz = BUSINESSES.find((b) => b.slug === biz.slug);
          return {
            ...biz,
            emoji: staticBiz?.emoji || "🏢",
            leads: biz.leadsThisWeek || 0,
            bookings: 0,
            adSpend: 0,
            trend: biz.attainmentPct > 50 ? biz.attainmentPct - 50 : -(50 - biz.attainmentPct),
          };
        }));
      } else {
        setBusinessMetrics(BUSINESSES);
      }

      setTeamPerformance(data.teamPerformance?.length > 0 ? data.teamPerformance : FALLBACK_TEAM);

      // Alerts
      if (data.alerts?.length > 0) {
        setAlerts(data.alerts.map((a) => ({
          title: a.category?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Alert",
          description: a.message,
          business: a.category || "Operations",
          time: "Now",
          severity: a.severity === "high" ? "danger" : "warning",
        })));
      } else {
        setAlerts([]);
      }

      setLastUpdated(new Date().toLocaleTimeString("en-GB", { hour12: true }));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      // Keep existing static data
      setBusinessMetrics(BUSINESSES);
      setTeamPerformance(FALLBACK_TEAM);
      setLastUpdated(new Date().toLocaleTimeString("en-GB", { hour12: true }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // 5 min
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const fetchAiCeoInsights = async () => {
    setAiCeoLoading(true);
    try {
      const data = await api.aiCeoInsights({
        metrics,
        teamPerformance,
        alerts,
      }, "overall");
      if (data.success) {
        setAiCeoInsights(data.insights);
      }
    } catch (err) {
      console.error("AI CEO error:", err);
    }
    setAiCeoLoading(false);
  };

  const generateAiTasks = async () => {
    try {
      const data = await api.aiCeoGenerateTasks(
        { metrics, alerts },
        new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
      );
      if (data.success) {
        alert(`${data.tasksGenerated} AI-powered tasks generated for the team!`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Task generation error:", err);
    }
  };

  const kpis = {
    revenue: {
      label: "Monthly Revenue",
      value: metrics.revenue.month,
      icon: "$",
      delta: metrics.revenue.trend,
      target: metrics.revenue.target,
      borderColor: "#10b981",
    },
    leads: {
      label: "Leads Today",
      value: metrics.leads.today,
      icon: "people",
      delta: metrics.leads.trend,
      subtitle: `${formatNumber(metrics.leads.week)} this week`,
      borderColor: "#3b82f6",
    },
    bookings: {
      label: "Bookings Today",
      value: metrics.bookings.today,
      icon: "calendar",
      delta: null,
      subtitle: `${metrics.bookings.conversionRate.toFixed(1)}% conv.`,
      extra: `${formatNumber(metrics.bookings.week)} this week`,
      borderColor: "#8b5cf6",
    },
    adSpend: {
      label: "Monthly Ad Spend",
      value: metrics.adSpend.month,
      icon: "sparkle",
      delta: null,
      subtitle: `${metrics.adSpend.roi.toFixed(1)}x ROI`,
      extra: `${formatCurrency(Math.round(metrics.adSpend.month / 30))}/day`,
      borderColor: "#f59e0b",
    },
    tasks: {
      label: "Tasks Completed",
      value: `${metrics.tasks.completed}/${metrics.tasks.completed + metrics.tasks.pending}`,
      icon: "check",
      delta: null,
      subtitle: metrics.tasks.overdue > 0 ? `${metrics.tasks.overdue} overdue` : "On track",
      borderColor: "#ec4899",
    },
  };

  if (loading) {
    return (
      <>
        <Topbar title="Group Dashboard" />
        <main className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Group Dashboard" />
      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-5">
        <PageHeader
          icon="🏢"
          title="Group Dashboard"
          subtitle="Real-time overview of all GM Dental Group businesses"
          right={
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                Last Updated<br />
                <span className="font-semibold text-ink">{lastUpdated}</span>
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          }
        />

        {/* Critical Alerts */}
        <AlertBanner alerts={alerts} />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard {...kpis.revenue} />
          <KpiCard {...kpis.leads} />
          <KpiCard {...kpis.bookings} />
          <KpiCard {...kpis.adSpend} />
          <KpiCard {...kpis.tasks} />
        </div>

        {/* Business Performance Table */}
        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-primary" />
            <h2 className="text-base font-bold text-ink">Business Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-3 px-2 text-[11px] font-semibold text-muted uppercase tracking-wide">Business</th>
                  <th className="text-right py-3 px-2 text-[11px] font-semibold text-muted uppercase tracking-wide">Revenue</th>
                  <th className="text-right py-3 px-2 text-[11px] font-semibold text-muted uppercase tracking-wide">Leads</th>
                  <th className="text-right py-3 px-2 text-[11px] font-semibold text-muted uppercase tracking-wide">Active Tasks</th>
                  <th className="text-right py-3 px-2 text-[11px] font-semibold text-muted uppercase tracking-wide">Target</th>
                  <th className="text-right py-3 px-2 text-[11px] font-semibold text-muted uppercase tracking-wide">Attainment</th>
                </tr>
              </thead>
              <tbody>
                {businessMetrics.map((biz) => {
                  const attainment = biz.attainmentPct ?? (biz.target ? Math.round(biz.revenue / biz.target * 100) : 0);
                  return (
                    <tr
                      key={biz.slug || biz.id}
                      className="border-b border-line-soft hover:bg-bg-soft transition cursor-pointer"
                      onClick={() => navigate(`/practices/${biz.slug}`)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{biz.emoji || "🏢"}</span>
                          <span className="font-semibold text-ink">{biz.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-ink">{formatCurrency(biz.revenue)}</td>
                      <td className="py-3 px-2 text-right text-ink">{biz.leads ?? biz.leadsThisWeek ?? 0}</td>
                      <td className="py-3 px-2 text-right text-ink">{biz.activeTasks ?? 0}</td>
                      <td className="py-3 px-2 text-right text-muted">{formatCurrency(biz.target ?? biz.target_monthly ?? 0)}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={cn(
                          "text-xs font-semibold",
                          attainment >= 80 ? "text-primary" : attainment >= 50 ? "text-amber-500" : "text-danger"
                        )}>
                          {attainment}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-violet-500" />
            <h2 className="text-base font-bold text-ink">Team Accountability</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamPerformance.map((member) => {
              const done = member.tasksCompleted ?? member.tasks?.done ?? 0;
              const total = member.tasksTotal ?? member.tasks?.total ?? 1;
              const completion = Math.round((done / total) * 100);
              const isLow = completion < 50;
              return (
                <div
                  key={member.name || member.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    isLow ? "border-danger/30 bg-danger/5" : "border-line bg-bg-soft"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: member.color || "#64748b" }}
                      >
                        {(member.name || "?")[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-ink">{member.name}</div>
                        <div className="text-[11px] text-muted">{member.role}</div>
                      </div>
                    </div>
                    {isLow && <AlertTriangle className="text-danger" size={14} />}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", isLow ? "bg-danger" : "bg-primary")}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted">{done}/{total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => { setShowAiCeo(true); fetchAiCeoInsights(); }}
            className="bg-white border-2 border-violet-200 rounded-xl p-4 text-left hover:border-violet-400 hover:shadow-md transition-all"
          >
            <Brain className="text-violet-500 mb-2" size={22} />
            <div className="font-semibold text-sm text-ink">AI CEO</div>
            <div className="text-[11px] text-violet-400 mt-0.5">Strategic Advisor</div>
          </button>
          <button
            onClick={() => navigate("/voice-tasks")}
            className="bg-white border border-line rounded-xl p-4 text-left hover:bg-bg-soft transition"
          >
            <Phone className="text-primary mb-2" size={22} />
            <div className="font-semibold text-sm text-ink">Voice Tasks</div>
            <div className="text-[11px] text-primary mt-0.5">AI Capture</div>
          </button>
          <button
            onClick={() => navigate("/marketing/ads")}
            className="bg-white border border-line rounded-xl p-4 text-left hover:bg-bg-soft transition"
          >
            <MousePointerClick className="text-blue-500 mb-2" size={22} />
            <div className="font-semibold text-sm text-ink">Ads Dashboard</div>
            <div className="text-[11px] text-muted mt-0.5">Google + Facebook</div>
          </button>
          <button
            onClick={() => navigate("/marketing/ghl-automation")}
            className="bg-white border border-line rounded-xl p-4 text-left hover:bg-bg-soft transition"
          >
            <Target className="text-violet-500 mb-2" size={22} />
            <div className="font-semibold text-sm text-ink">GHL CRM</div>
            <div className="text-[11px] text-muted mt-0.5">Pipeline Overview</div>
          </button>
          <button
            onClick={() => navigate("/team-hub")}
            className="bg-white border border-line rounded-xl p-4 text-left hover:bg-bg-soft transition"
          >
            <Zap className="text-amber-500 mb-2" size={22} />
            <div className="font-semibold text-sm text-ink">Team Hub</div>
            <div className="text-[11px] text-muted mt-0.5">Tasks & Automations</div>
          </button>
        </div>

        {/* AI CEO Modal */}
        {showAiCeo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAiCeo(false)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="p-5 border-b border-line flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink">AI CEO - Strategic Advisor</h2>
                    <p className="text-xs text-muted">Powered by Claude &middot; Analysing GM Dental Group</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateAiTasks}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    Generate Tasks
                  </button>
                  <button
                    onClick={fetchAiCeoInsights}
                    disabled={aiCeoLoading}
                    className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={aiCeoLoading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                  <button onClick={() => setShowAiCeo(false)} className="p-2 hover:bg-bg-soft rounded-lg">
                    <XCircle size={18} className="text-muted" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5">
                {aiCeoLoading && !aiCeoInsights ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mb-4" />
                    <p className="text-sm text-muted">AI CEO is analysing business performance...</p>
                  </div>
                ) : aiCeoInsights ? (
                  <div className="space-y-5">
                    {/* Executive Summary */}
                    <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-violet-500" size={16} />
                        <h3 className="font-semibold text-sm text-ink">Executive Summary</h3>
                      </div>
                      <p className="text-sm text-ink/80">{aiCeoInsights.executiveSummary}</p>
                    </div>

                    {/* Urgent Actions */}
                    {aiCeoInsights.urgentActions?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                          <AlertTriangle className="text-danger" size={16} />
                          Urgent Actions Required
                        </h3>
                        <div className="space-y-2">
                          {aiCeoInsights.urgentActions.map((action, idx) => (
                            <div key={idx} className="border border-line rounded-xl p-4 border-l-4 border-l-danger">
                              <div className="font-medium text-sm text-ink">{action.action}</div>
                              <div className="text-xs text-muted mt-1">
                                Assign to: <span className="text-danger font-medium">{action.owner || action.assignTo}</span>
                                {action.deadline && <> &middot; Due: {action.deadline}</>}
                              </div>
                              {(action.reason || action.impact) && (
                                <div className="text-xs text-primary mt-1">Impact: {action.impact || action.expectedImpact || action.reason}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly Priorities */}
                    {aiCeoInsights.weeklyPriorities?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                          <Target className="text-blue-500" size={16} />
                          This Week's Priorities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {aiCeoInsights.weeklyPriorities.map((p, idx) => (
                            <div key={idx} className="border border-line rounded-xl p-4">
                              <div className="font-medium text-sm text-ink">{p.priority}</div>
                              {p.rationale && <div className="text-xs text-muted mt-1">{p.rationale}</div>}
                              <div className="text-xs text-blue-500 mt-1">KPI: {p.kpi}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Task Recommendations */}
                    {aiCeoInsights.taskRecommendations?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                          <Activity className="text-primary" size={16} />
                          Recommended Tasks
                        </h3>
                        <div className="space-y-2">
                          {aiCeoInsights.taskRecommendations.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between border border-line rounded-lg p-3">
                              <div>
                                <div className="text-sm font-medium text-ink">{t.title || t.task}</div>
                                <div className="text-xs text-muted mt-0.5">
                                  {t.assignTo || t.member} &middot; Due in {t.dueIn || t.dueDay || "24"}h
                                </div>
                              </div>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-md",
                                (t.priority === "P0" || t.priority === "HIGH") ? "bg-danger/10 text-danger" :
                                (t.priority === "P1" || t.priority === "MEDIUM") ? "bg-amber-100 text-amber-600" :
                                "bg-bg-soft text-muted"
                              )}>
                                {t.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Alerts */}
                    {aiCeoInsights.riskAlerts?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                          <AlertTriangle className="text-amber-500" size={16} />
                          Risk Alerts
                        </h3>
                        <div className="space-y-2">
                          {aiCeoInsights.riskAlerts.map((r, idx) => (
                            <div key={idx} className="border border-amber-200 bg-amber-50 rounded-xl p-3">
                              <div className="text-sm font-medium text-ink">{r.risk}</div>
                              <div className="text-xs text-muted mt-1">Mitigation: {r.mitigation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Growth Opportunities */}
                    {aiCeoInsights.growthOpportunities?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                          <Sparkles className="text-primary" size={16} />
                          Growth Opportunities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {aiCeoInsights.growthOpportunities.map((g, idx) => (
                            <div key={idx} className="border border-primary/20 bg-primary/5 rounded-xl p-4">
                              <div className="text-sm font-medium text-ink">{g.opportunity}</div>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-primary font-semibold">{g.revenueImpact || g.estimatedRevenue}</span>
                                <span className="text-xs text-muted">Effort: {g.effort || g.requiredResources}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted text-sm">
                    Click Refresh to generate AI CEO insights.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
