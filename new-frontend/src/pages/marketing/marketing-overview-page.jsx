import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import KpiCard from "@/components/shared/kpi-card";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";
import { api } from "@/api/client";
import {
  ArrowRight,
  Zap,
  Inbox,
  Tag,
  Film,
  BookOpen,
  UserCheck,
  Bot,
  BarChart2,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
} from "lucide-react";

const SUB_PAGES = [
  {
    key: "lead-engine",
    path: "/marketing/lead-engine",
    icon: Zap,
    color: "#7c3aed",
    bg: "#ede9fe",
    title: "Lead Engine",
    desc: "Pipeline tracking and lead source analytics",
  },
  {
    key: "manus-inbox",
    path: "/marketing/manus-inbox",
    icon: Inbox,
    color: "#3b82f6",
    bg: "#eff6ff",
    title: "Manus Inbox",
    desc: "AI-powered outreach and reply management",
  },
  {
    key: "offers",
    path: "/marketing/offers",
    icon: Tag,
    color: "#10b981",
    bg: "#ecfdf5",
    title: "Offer Library",
    desc: "Manage and track all active offers per practice",
  },
  {
    key: "content-factory",
    path: "/marketing/content-factory",
    icon: Film,
    color: "#f59e0b",
    bg: "#fffbeb",
    title: "Content Factory",
    desc: "AI-generated reels, captions, and calendars",
  },
  {
    key: "sales",
    path: "/marketing/sales",
    icon: BookOpen,
    color: "#ef4444",
    bg: "#fef2f2",
    title: "Sales Enablement",
    desc: "Scripts, objections, and conversion playbooks",
  },
  {
    key: "setter",
    path: "/marketing/setter",
    icon: UserCheck,
    color: "#14b8a6",
    bg: "#f0fdfa",
    title: "Setter Dashboard",
    desc: "SDR performance, bookings, and follow-ups",
  },
  {
    key: "ghl-automation",
    path: "/marketing/ghl-automation",
    icon: Bot,
    color: "#6d28d9",
    bg: "#f5f3ff",
    title: "GHL Automation",
    desc: "Workflow rules, triggers, and sequences",
  },
  {
    key: "ads",
    path: "/marketing/ads",
    icon: BarChart2,
    color: "#0ea5e9",
    bg: "#f0f9ff",
    title: "Ads Dashboard",
    desc: "Google and Meta campaign performance",
  },
  {
    key: "ghl-dashboard",
    path: "/marketing/ghl-dashboard",
    icon: LayoutDashboard,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    title: "GHL Dashboard",
    desc: "CRM pipeline, contacts, and appointments",
  },
];

const RECENT_ACTIVITY = [
  { id: 1, text: "New lead from Google Ads", practice: "Ashford", time: "2m ago", type: "lead" },
  { id: 2, text: "Email campaign sent", practice: "Rochester", time: "14m ago", type: "campaign" },
  { id: 3, text: "Appointment booked via GHL", practice: "Barnet", time: "31m ago", type: "booking" },
  { id: 4, text: "Meta ad set paused (budget hit)", practice: "Bexleyheath", time: "1h ago", type: "alert" },
  { id: 5, text: "Offer activated — Invisalign £999", practice: "Warwick Lodge", time: "2h ago", type: "offer" },
];

const ACTIVITY_COLORS = {
  lead: "#10b981",
  campaign: "#3b82f6",
  booking: "#7c3aed",
  alert: "#f59e0b",
  offer: "#ef4444",
};

export default function MarketingOverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api
      .dashboardSummary()
      .then((d) => setSummary(d))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const totalLeads = BUSINESSES.reduce((s, b) => s + b.leads, 0);
  const totalAdSpend = BUSINESSES.reduce((s, b) => s + b.adSpend, 0);
  const roas = 9.2;
  const convRate = 32.4;
  const activeCampaigns = 24;

  const practiceData = BUSINESSES.filter((b) => b.type === "practice").map((b) => ({
    ...b,
    roi: +(b.revenue / b.adSpend).toFixed(1),
    conv: +((b.bookings / Math.max(b.leads, 1)) * 100).toFixed(1),
  }));

  return (
    <>
      <Topbar title="Marketing OS" subtitle="Unified marketing command center" />
      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-6">

        {/* Hero Banner */}
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #2563eb 100%)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📡</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Marketing OS</h2>
                <p className="text-purple-200 text-sm">Unified marketing command center for all practices</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {["9 Practices", "24 Active Campaigns", "£18.3k Ad Spend MTD", "241 Total Leads"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Decorative circles */}
          <div
            className="absolute -right-12 -top-12 rounded-full opacity-10"
            style={{ width: 200, height: 200, background: "#fff" }}
          />
          <div
            className="absolute right-24 -bottom-16 rounded-full opacity-10"
            style={{ width: 160, height: 160, background: "#fff" }}
          />
        </div>

        {/* KPI Strip */}
        {loading ? (
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-white border border-line rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <KpiCard
              label="Total Leads"
              value={totalLeads}
              icon="people"
              delta={8.3}
              subtitle="All practices MTD"
              borderColor="#10b981"
            />
            <KpiCard
              label="Ad Spend MTD"
              value={totalAdSpend}
              icon="$"
              delta={null}
              extra="£598/day avg"
              subtitle="Google + Meta"
              borderColor="#7c3aed"
            />
            <KpiCard
              label="ROAS"
              value={`${roas}x`}
              icon="sparkle"
              delta={4.2}
              subtitle="Revenue on ad spend"
              borderColor="#3b82f6"
            />
            <KpiCard
              label="Conversion Rate"
              value={`${convRate}%`}
              icon="check"
              delta={-1.8}
              subtitle="Leads to bookings"
              borderColor="#f59e0b"
            />
            <KpiCard
              label="Active Campaigns"
              value={activeCampaigns}
              icon="people"
              delta={null}
              extra="12 Google · 12 Meta"
              subtitle="Running now"
              borderColor="#ef4444"
            />
          </div>
        )}

        {/* Quick Nav Grid */}
        <div>
          <h3 className="text-sm font-bold text-ink mb-3 uppercase tracking-wide">Marketing Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUB_PAGES.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.key}
                  onClick={() => navigate(page.path)}
                  className="bg-white border border-line rounded-xl p-4 text-left hover:shadow-md hover:border-purple-200 transition-all group flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: page.bg }}
                  >
                    <Icon size={18} style={{ color: page.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm">{page.title}</div>
                    <div className="text-xs text-muted mt-0.5 leading-relaxed">{page.desc}</div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-muted group-hover:text-purple-600 transition-colors shrink-0 mt-1"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Performance Table + Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Performance by Practice */}
          <div className="xl:col-span-2 bg-white border border-line rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h3 className="font-bold text-ink text-sm">Performance by Practice</h3>
              <span className="text-xs text-muted">MTD</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bg-soft border-b border-line">
                    <th className="text-left px-5 py-3 text-muted font-semibold uppercase tracking-wide">Practice</th>
                    <th className="text-right px-4 py-3 text-muted font-semibold uppercase tracking-wide">Leads</th>
                    <th className="text-right px-4 py-3 text-muted font-semibold uppercase tracking-wide">Ad Spend</th>
                    <th className="text-right px-4 py-3 text-muted font-semibold uppercase tracking-wide">ROI</th>
                    <th className="text-right px-5 py-3 text-muted font-semibold uppercase tracking-wide">Conv %</th>
                    <th className="text-right px-5 py-3 text-muted font-semibold uppercase tracking-wide">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceData.map((b, i) => (
                    <tr
                      key={b.slug}
                      className={cn(
                        "border-b border-line last:border-0 hover:bg-bg-soft transition-colors cursor-pointer",
                        i % 2 === 0 ? "bg-white" : "bg-bg-soft/40"
                      )}
                      onClick={() => navigate(`/practices/${b.slug}`)}
                    >
                      <td className="px-5 py-3 font-medium text-ink flex items-center gap-2">
                        <span>{b.emoji}</span>
                        <span>{b.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-ink">{formatNumber(b.leads)}</td>
                      <td className="px-4 py-3 text-right text-ink">{formatCurrency(b.adSpend)}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="font-semibold"
                          style={{ color: b.roi >= 8 ? "#10b981" : b.roi >= 5 ? "#f59e0b" : "#ef4444" }}
                        >
                          {b.roi}x
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-ink">{b.conv}%</td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className="flex items-center justify-end gap-1 font-semibold"
                          style={{ color: b.trend >= 0 ? "#10b981" : "#ef4444" }}
                        >
                          {b.trend >= 0 ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          {Math.abs(b.trend)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center gap-2">
              <Activity size={14} className="text-purple-600" />
              <h3 className="font-bold text-ink text-sm">Recent Activity</h3>
            </div>
            <div className="divide-y divide-line">
              {RECENT_ACTIVITY.map((item) => (
                <div key={item.id} className="px-5 py-4 hover:bg-bg-soft transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: ACTIVITY_COLORS[item.type] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink leading-relaxed">{item.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#ede9fe", color: "#7c3aed" }}
                        >
                          {item.practice}
                        </span>
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Clock size={9} />
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
