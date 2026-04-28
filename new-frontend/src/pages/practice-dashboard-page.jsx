import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "@/components/layout/topbar";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";
import { api } from "@/api/client";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CalendarCheck,
  Target,
  Star,
  Phone,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Brain,
  BarChart3,
  Zap,
  PieChart,
  FileText,
  Megaphone,
  Globe,
  Wifi,
  MessageSquare,
  BookOpen,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Activity,
  DollarSign,
  Layers,
  Building2,
  RefreshCw,
  Loader2,
  Plus,
  Eye,
  Search,
} from "lucide-react";

// ─── Business Info Map ──────────────────────────────────────────────────────
const BUSINESS_INFO = {
  ashford: {
    name: "GM Dental Ashford",
    emoji: "🦷",
    type: "practice",
    address: "40 Elwick Road, Ashford, TN23 1NN",
    phone: "01233 803804",
    color: "#10b981",
  },
  rochester: {
    name: "GM Dental Rochester",
    emoji: "🏛️",
    type: "practice",
    address: "5 London Road, Rochester, ME2 3JA",
    phone: "01634 718882",
    color: "#3b82f6",
  },
  barnet: {
    name: "GM Dental Barnet",
    emoji: "🏗️",
    type: "practice",
    address: "27 Wood Street, Barnet, EN5 4BE",
    phone: "020 8449 3022",
    color: "#8b5cf6",
  },
  bexleyheath: {
    name: "Fixed Teeth Solutions",
    emoji: "😊",
    type: "practice",
    address: "Bexleyheath, DA6",
    phone: "020 4524 0149",
    color: "#f59e0b",
  },
  "warwick-lodge": {
    name: "Warwick Lodge Dental",
    emoji: "🏡",
    type: "practice",
    address: "Warwick Lodge",
    phone: "TBD",
    color: "#ef4444",
  },
  "rye-dental": {
    name: "Rye Dental Practice",
    emoji: "🐳",
    type: "practice",
    address: "Rye, East Sussex",
    phone: "TBD",
    color: "#06b6d4",
  },
  academy: {
    name: "Plan4Growth Academy",
    emoji: "🐢",
    type: "academy",
    address: "Online",
    phone: "Academy Line",
    color: "#c9a227",
  },
  lab: {
    name: "GM Dental Lab",
    emoji: "🧪",
    type: "lab",
    address: "Lab Facility",
    phone: "Lab Line",
    color: "#6b7280",
  },
  accounts: {
    name: "Elevate Accounts",
    emoji: "📊",
    type: "service",
    address: "Corporate",
    phone: "Corporate Line",
    color: "#7c3aed",
  },
};

// ─── Deterministic seed helpers ──────────────────────────────────────────────
function slugHash(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
}

function generateMetrics(slug) {
  const h = slugHash(slug);
  const base = (h % 80) + 60;
  const revenue = Math.round(((base * 1200 + 40000) / 100)) * 100;
  const target = Math.round((revenue * 1.18) / 100) * 100;
  const leads = 18 + (h % 25);
  const bookings = Math.round(leads * (0.45 + (h % 20) / 100));
  const adSpend = 2800 + (h % 3200);
  const googleAds = Math.round(adSpend * 0.58);
  const facebookAds = adSpend - googleAds;
  const roi = (revenue / adSpend).toFixed(1);
  const trend = ((h % 28) - 8) / 10;
  const rating = (4.3 + (h % 7) / 10).toFixed(1);
  const reviews = 160 + (h % 200);
  const convRate = ((bookings / leads) * 100).toFixed(0);
  const bookingsToday = 3 + (h % 9);
  const pipelineOpen = 12 + (h % 18);
  const pipelineValue = pipelineOpen * (800 + (h % 1200));
  const won = 8 + (h % 14);
  const lost = 2 + (h % 6);

  return {
    revenue,
    target,
    leads,
    bookings,
    adSpend,
    googleAds,
    facebookAds,
    roi,
    trend,
    rating,
    reviews,
    convRate,
    bookingsToday,
    pipelineOpen,
    pipelineValue,
    won,
    lost,
    appointmentsToday: bookingsToday + 2,
    teamTasks: 6 + (h % 12),
  };
}

// ─── Static seed content ─────────────────────────────────────────────────────
const SEED_TASKS = [
  { id: 1, title: "Follow up with no-shows from last 14 days", status: "in_progress", due: "Today", priority: "high" },
  { id: 2, title: "Review Google Ads performance report", status: "todo", due: "Tomorrow", priority: "medium" },
  { id: 3, title: "Update treatment plan templates", status: "done", due: "Yesterday", priority: "low" },
  { id: 4, title: "Set up new patient welcome sequence in GHL", status: "todo", due: "This week", priority: "high" },
  { id: 5, title: "Audit Facebook ad creatives — A/B test launch", status: "in_progress", due: "Today", priority: "medium" },
];

const SEED_LEADS = [
  { id: 1, name: "James Rutherford", service: "Implant Consultation", stage: "consultation_booked", source: "Google Ads", value: 3200, daysAgo: 1 },
  { id: 2, name: "Sarah Mitchell", service: "Invisalign", stage: "contacted", source: "Facebook", value: 2800, daysAgo: 2 },
  { id: 3, name: "Tobi Okonkwo", service: "Composite Bonding", stage: "new_lead", source: "Referral", value: 1200, daysAgo: 0 },
  { id: 4, name: "Alex Pierce", service: "Full Mouth Rehab", stage: "treatment_accepted", source: "Google Ads", value: 8500, daysAgo: 3 },
  { id: 5, name: "Mrs. Cartwright", service: "Veneers", stage: "contacted", source: "SEO", value: 4200, daysAgo: 1 },
];

const SDR_SCRIPTS = [
  { name: "Initial Enquiry Follow-Up", call_type: "Outbound" },
  { name: "No-Show Re-engagement", call_type: "Re-engage" },
  { name: "Treatment Plan Presentation", call_type: "Consultation" },
  { name: "Referral Welcome Call", call_type: "Referral" },
];

const OBJECTION_HANDLERS = [
  { text: "It's too expensive", effectiveness: 92 },
  { text: "I need to think about it", effectiveness: 87 },
  { text: "I'm scared of dental work", effectiveness: 95 },
];

const VOICE_SCRIPTS = [
  { name: "After-Hours Booking Bot" },
  { name: "Missed Call Recovery" },
  { name: "Appointment Reminder" },
];

const APPOINTMENTS_TODAY = [
  { title: "Implant Consultation — James R.", time: "09:00 AM", type: "Consultation" },
  { title: "Invisalign Review — Sarah M.", time: "10:30 AM", type: "Review" },
  { title: "New Patient Exam — T. Okonkwo", time: "11:45 AM", type: "New Patient" },
  { title: "Composite Bonding — Alex P.", time: "02:00 PM", type: "Treatment" },
  { title: "Follow-up — Mrs. Cartwright", time: "03:30 PM", type: "Follow-up" },
];

const STRATEGY_OUTPUT = {
  summary:
    "Based on current trajectory, this practice is well-positioned to hit its monthly revenue target by intensifying follow-up cadence and pushing implant/composite consultations. Google Ads ROI is above group average — maintain spend and optimise landing page CTA.",
  quickWins: [
    { action: "Re-engage no-shows from last 14 days via SMS sequence", timeline: "48h", impact: "High", impactColor: "text-green-600" },
    { action: "Activate 'Price Anchor' objection handler for implants", timeline: "This week", impact: "Medium", impactColor: "text-amber-600" },
    { action: "A/B test new before/after ad creative on Facebook", timeline: "3 days", impact: "High", impactColor: "text-green-600" },
  ],
  growthStrategies: [
    "Launch a treatment financing landing page linked from all Google Ads to reduce drop-off at price barrier.",
    "Partner with local GP clinics for dental referral cards — target 5 new referral sources this quarter.",
    "Implement automated 24-hour recall for patients who did not book at consultation.",
  ],
  riskAreas: [
    { title: "Lead Volume Slippage", desc: "Leads are 12% below same-period last month. Monitor daily." },
    { title: "Ad CPL Rising", desc: "Cost-per-lead increased 18% this week. Review ad quality scores." },
  ],
};

const TABS = ["Dashboard", "Marketing", "Sales", "Operations", "Finance", "AI & Strategy", "Assets"];

// ─── Status / Stage config ───────────────────────────────────────────────────
const TASK_STATUS_CONFIG = {
  todo: { label: "To Do", bg: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In Progress", bg: "bg-blue-100 text-blue-700" },
  done: { label: "Done", bg: "bg-green-100 text-green-700" },
  blocked: { label: "Blocked", bg: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG = {
  high: { dot: "bg-red-500", label: "High" },
  medium: { dot: "bg-amber-400", label: "Medium" },
  low: { dot: "bg-green-400", label: "Low" },
};

const LEAD_STAGE_CONFIG = {
  new_lead: { label: "New Lead", bg: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", bg: "bg-amber-100 text-amber-700" },
  consultation_booked: { label: "Consultation", bg: "bg-purple-100 text-purple-700" },
  treatment_accepted: { label: "Accepted", bg: "bg-green-100 text-green-700" },
};

// ─── Small shared components ──────────────────────────────────────────────────
function Card({ children, className = "", style }) {
  return (
    <div className={cn("bg-white border border-line rounded-xl shadow-sm", className)} style={style}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, iconColor = "text-ink", action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={17} className={iconColor} />}
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function StatBadge({ label, value, bgColor = "bg-green-50", textColor = "text-green-700" }) {
  return (
    <div className={cn("rounded-lg px-3 py-2 flex flex-col items-center min-w-[100px]", bgColor)}>
      <span className={cn("font-bold text-2xl", textColor)}>{value}</span>
      <span className={cn("text-[10px] font-semibold uppercase tracking-wide mt-0.5 opacity-80", textColor)}>{label}</span>
    </div>
  );
}

// ─── Revenue Sparkline (CSS-only) ─────────────────────────────────────────────
function RevenueSparkline({ color, trend }) {
  const isPositive = trend >= 0;
  // Fake SVG sparkline points derived from trend direction
  const points = isPositive
    ? "0,40 15,35 30,30 45,25 60,28 75,18 90,12 105,8 120,4"
    : "0,10 15,15 30,20 45,28 60,25 75,32 90,36 105,38 120,40";

  return (
    <div className="relative h-14 w-full overflow-hidden">
      <svg viewBox="0 0 120 44" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`spark-grad-${isPositive ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points={`0,44 ${points} 120,44`}
          fill={`url(#spark-grad-${isPositive ? "up" : "dn"})`}
        />
      </svg>
    </div>
  );
}

// ─── Tab: Dashboard ───────────────────────────────────────────────────────────
function TabDashboard({ slug, metrics, biz, tasks, leads, tasksLoading, leadsLoading, navigate }) {
  const progressPct = Math.min(100, (metrics.revenue / metrics.target) * 100);
  const isPositive = metrics.trend >= 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 col-span-2 lg:col-span-1" style={{ borderTopWidth: 4, borderTopColor: "#10b981" }}>
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Revenue</div>
          <div className="text-xl font-bold text-ink">{formatCurrency(metrics.revenue)}</div>
          <div className="text-xs text-muted mt-0.5">Target: {formatCurrency(metrics.target)}</div>
          <div className="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${progressPct}%` }} />
          </div>
        </Card>

        <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#3b82f6" }}>
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Leads</div>
          <div className="text-xl font-bold text-ink">{metrics.leads}</div>
          <div className="text-xs text-muted mt-0.5">This week</div>
        </Card>

        <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#8b5cf6" }}>
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Bookings</div>
          <div className="text-xl font-bold text-ink">{metrics.bookings}</div>
          <div className="text-xs text-muted mt-0.5">{metrics.convRate}% conv.</div>
        </Card>

        <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#f59e0b" }}>
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Ad Spend</div>
          <div className="text-xl font-bold text-ink">{formatCurrency(metrics.adSpend)}</div>
          <div className="text-xs text-muted mt-0.5">{metrics.roi}x ROI</div>
        </Card>

        <Card className={cn("p-5", isPositive ? "bg-green-50" : "bg-red-50")} style={{ borderTopWidth: 4, borderTopColor: isPositive ? "#10b981" : "#ef4444" }}>
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Trend</div>
          <div className={cn("text-xl font-bold flex items-center gap-1", isPositive ? "text-green-700" : "text-red-600")}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {isPositive ? "+" : ""}{metrics.trend.toFixed(1)}%
          </div>
          <div className="text-xs text-muted mt-0.5">vs last period</div>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="p-5">
        <SectionTitle icon={Activity} title="Revenue Trend" iconColor="text-green-600" />
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <RevenueSparkline color={biz.color} trend={metrics.trend} />
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-ink">{formatCurrency(metrics.revenue)}</div>
            <div className={cn("text-xs font-semibold flex items-center justify-end gap-1 mt-0.5", metrics.trend >= 0 ? "text-green-600" : "text-red-500")}>
              {metrics.trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {metrics.trend >= 0 ? "+" : ""}{metrics.trend.toFixed(1)}% this period
            </div>
            <div className="text-xs text-muted mt-1">Target: {formatCurrency(metrics.target)}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted border-t border-line pt-3">
          <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
          <span>Sep</span><span>Oct</span><span>Nov</span><span className="font-semibold text-ink">Dec</span>
        </div>
      </Card>

      {/* Tasks + Leads side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Tasks */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-line">
            <SectionTitle
              icon={CheckCircle}
              title="Recent Tasks"
              iconColor="text-purple-600"
              action={
                <button
                  onClick={() => navigate("/simple-tasks")}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
                >
                  View all <ChevronRight size={13} />
                </button>
              }
            />
          </div>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="text-purple-400 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {tasks.slice(0, 5).map((task) => {
                const statusConf = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.todo;
                const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                return (
                  <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-soft transition">
                    <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", priorityConf.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink leading-snug truncate">{task.title}</p>
                      <p className="text-[10px] text-muted mt-0.5">{task.due}</p>
                    </div>
                    <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0", statusConf.bg)}>
                      {statusConf.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="p-3 bg-soft border-t border-line">
            <button
              onClick={() => navigate("/simple-tasks")}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-50 transition"
            >
              <Plus size={13} />
              Add Task
            </button>
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-line">
            <SectionTitle
              icon={Users}
              title="Recent Leads"
              iconColor="text-blue-600"
              action={
                <button
                  onClick={() => navigate("/marketing/lead-engine")}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  View all <ChevronRight size={13} />
                </button>
              }
            />
          </div>
          {leadsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {leads.slice(0, 5).map((lead) => {
                const stageConf = LEAD_STAGE_CONFIG[lead.stage] || LEAD_STAGE_CONFIG.new_lead;
                return (
                  <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-soft transition">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{lead.name}</p>
                      <p className="text-[10px] text-muted truncate">{lead.service} · {lead.source}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-ink">{formatCurrency(lead.value)}</div>
                      <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", stageConf.bg)}>
                        {stageConf.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-5">
        <SectionTitle icon={Zap} title="Quick Actions" iconColor="text-amber-600" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/marketing/lead-engine")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition group"
          >
            <Megaphone size={18} className="text-purple-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-ink">View in Marketing OS</div>
              <div className="text-[10px] text-muted">Leads, ads, campaigns</div>
            </div>
            <ChevronRight size={14} className="text-muted ml-auto group-hover:text-purple-600 transition" />
          </button>

          <button
            onClick={() => navigate("/simple-tasks")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition group"
          >
            <Plus size={18} className="text-green-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-ink">Add Task</div>
              <div className="text-[10px] text-muted">Assign with owner + deadline</div>
            </div>
            <ChevronRight size={14} className="text-muted ml-auto group-hover:text-green-600 transition" />
          </button>

          <button
            onClick={() => navigate("/seo")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition group"
          >
            <BarChart3 size={18} className="text-blue-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-ink">View SEO Report</div>
              <div className="text-[10px] text-muted">Rankings, traffic, GSC data</div>
            </div>
            <ChevronRight size={14} className="text-muted ml-auto group-hover:text-blue-600 transition" />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Marketing ───────────────────────────────────────────────────────────
function TabMarketing({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5" style={{ borderLeftWidth: 4, borderLeftColor: "#3b82f6" }}>
          <SectionTitle icon={Megaphone} title="Paid Ads" iconColor="text-blue-600" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-ink">Google Ads</span>
              </div>
              <span className="text-xs font-bold text-ink">{formatCurrency(metrics.googleAds)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-medium text-ink">Facebook Ads</span>
              </div>
              <span className="text-xs font-bold text-ink">{formatCurrency(metrics.facebookAds)}</span>
            </div>
            <div className="border-t border-line pt-2 flex justify-between">
              <span className="text-xs text-muted">Total Spend</span>
              <span className="text-xs font-bold text-ink">{formatCurrency(metrics.adSpend)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5" style={{ borderLeftWidth: 4, borderLeftColor: "#10b981" }}>
          <SectionTitle icon={Globe} title="Organic" iconColor="text-green-600" />
          <div className="space-y-2.5">
            {[
              { label: "SEO", badge: "Active", badgeBg: "bg-green-100 text-green-700" },
              { label: "Social Media", badge: "Active", badgeBg: "bg-green-100 text-green-700" },
              { label: "Content", badge: "3 Pending", badgeBg: "bg-amber-100 text-amber-700" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-ink">{item.label}</span>
                <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5", item.badgeBg)}>{item.badge}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" style={{ borderLeftWidth: 4, borderLeftColor: "#8b5cf6" }}>
          <SectionTitle icon={Users} title="Offline" iconColor="text-purple-600" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-ink">Events</span>
              <span className="text-xs font-semibold text-muted">0 upcoming</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-ink">Referrals</span>
              <span className="text-xs font-semibold text-ink">12 / month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-ink">Partnerships</span>
              <span className="text-xs font-semibold text-ink">2 active</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5" style={{ borderLeftWidth: 4, borderLeftColor: "#f59e0b" }}>
          <SectionTitle icon={BarChart3} title="Competitor Intel" iconColor="text-amber-600" />
          <p className="text-xs text-muted mb-4">
            Use Manus AI to analyse local competitors' ads, SEO rankings, social presence and pricing.
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition">
            <Brain size={13} />
            Open Manus AI
            <ExternalLink size={12} />
          </button>
        </Card>

        <Card className="p-5" style={{ borderLeftWidth: 4, borderLeftColor: "#10b981" }}>
          <SectionTitle icon={TrendingUp} title="Marketing Performance" iconColor="text-green-600" />
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Leads" value={metrics.leads} bgColor="bg-blue-50" textColor="text-blue-700" />
            <StatBadge label="ROI" value={`${metrics.roi}x`} bgColor="bg-green-50" textColor="text-green-700" />
            <StatBadge label="Spend" value={`£${Math.round(metrics.adSpend / 1000)}k`} bgColor="bg-amber-50" textColor="text-amber-700" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Sales ───────────────────────────────────────────────────────────────
function TabSales({ metrics }) {
  const stages = [
    { label: "New Lead", count: Math.round(metrics.pipelineOpen * 0.35), color: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Contacted", count: Math.round(metrics.pipelineOpen * 0.28), color: "bg-amber-100 text-amber-800 border-amber-200" },
    { label: "Consultation Booked", count: Math.round(metrics.pipelineOpen * 0.22), color: "bg-purple-100 text-purple-800 border-purple-200" },
    { label: "Treatment Accepted", count: Math.round(metrics.pipelineOpen * 0.15), color: "bg-green-100 text-green-800 border-green-200" },
  ];
  const avgOpenValue = Math.round(metrics.pipelineValue / metrics.pipelineOpen);

  return (
    <div className="space-y-6">
      <Card className="p-5" style={{ borderLeftWidth: 4, borderLeftColor: "#8b5cf6" }}>
        <SectionTitle icon={Target} title="Sales Pipeline" iconColor="text-purple-600" />
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-green-500" />
            <span className="text-xs text-muted">Won:</span>
            <span className="text-sm font-bold text-green-600">{metrics.won}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-red-400" />
            <span className="text-xs text-muted">Lost:</span>
            <span className="text-sm font-bold text-red-500">{metrics.lost}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={15} className="text-purple-500" />
            <span className="text-xs text-muted">Open Pipeline:</span>
            <span className="text-sm font-bold text-ink">{formatCurrency(metrics.pipelineValue)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stages.map((s, i) => (
            <div key={s.label} className="relative">
              <div className={cn("rounded-lg p-3 text-center border", s.color)}>
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide mt-1 leading-tight">{s.label}</div>
              </div>
              {i < stages.length - 1 && (
                <ChevronRight size={14} className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted z-10 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Booking Rate", value: `${metrics.convRate}%`, color: "#10b981" },
          { label: "Deals Won", value: metrics.won, color: "#3b82f6" },
          { label: "Open Deals", value: metrics.pipelineOpen, color: "#8b5cf6" },
          { label: "Avg Open Value", value: formatCurrency(avgOpenValue), color: "#f59e0b" },
        ].map((k) => (
          <Card key={k.label} className="p-4 text-center" style={{ borderTopWidth: 3, borderTopColor: k.color }}>
            <div className="text-xl font-bold text-ink">{k.value}</div>
            <div className="text-[11px] text-muted mt-1">{k.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionTitle icon={FileText} title="SDR Scripts" iconColor="text-blue-600" />
        <div className="space-y-2">
          {SDR_SCRIPTS.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-soft hover:bg-blue-50 border border-line transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <FileText size={14} className="text-muted" />
                <span className="text-sm font-medium text-ink">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-2.5 py-0.5">{s.call_type}</span>
                <ChevronRight size={14} className="text-muted group-hover:text-ink transition" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Operations ──────────────────────────────────────────────────────────
function TabOperations({ metrics, navigate }) {
  const quickLinks = [
    { label: "GHL Automation", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", path: "/marketing/ghl-automation" },
    { label: "WhatsApp", icon: MessageSquare, color: "text-green-600", bg: "bg-green-50", path: "#" },
    { label: "Playbook", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", path: "#" },
    { label: "ROI Dashboard", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50", path: "/business-pnl" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Appointments Today", value: metrics.appointmentsToday, sub: "Next: 09:00 AM", color: "#10b981", Icon: CalendarCheck, iconClass: "text-green-500" },
          { label: "Open Opportunities", value: metrics.pipelineOpen, sub: `${formatCurrency(metrics.pipelineValue)} pipeline`, color: "#3b82f6", Icon: Target, iconClass: "text-blue-500" },
          { label: "Team Tasks", value: metrics.teamTasks, sub: "Open today", color: "#8b5cf6", Icon: CheckCircle, iconClass: "text-purple-500" },
        ].map((k) => (
          <Card key={k.label} className="p-5" style={{ borderTopWidth: 4, borderTopColor: k.color }}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">{k.label}</span>
              <k.Icon size={15} className={k.iconClass} />
            </div>
            <div className="text-2xl font-bold text-ink">{k.value}</div>
            <div className="text-xs text-muted mt-1">{k.sub}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionTitle icon={CalendarCheck} title="Today's Appointments" iconColor="text-green-600" />
        <div className="space-y-2">
          {APPOINTMENTS_TODAY.map((apt) => (
            <div key={apt.title} className="flex items-center justify-between px-4 py-3 rounded-lg border border-line hover:bg-soft transition">
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-muted shrink-0" />
                <span className="text-sm font-medium text-ink">{apt.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted">{apt.time}</span>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{apt.type}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle icon={Zap} title="Quick Links" iconColor="text-amber-600" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((lnk) => (
            <button
              key={lnk.label}
              onClick={() => lnk.path !== "#" && navigate(lnk.path)}
              className={cn("flex flex-col items-center gap-2 rounded-xl p-4 border border-line hover:shadow-md transition cursor-pointer", lnk.bg)}
            >
              <lnk.icon size={22} className={lnk.color} />
              <span className="text-xs font-semibold text-ink text-center leading-tight">{lnk.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Finance ─────────────────────────────────────────────────────────────
function TabFinance({ metrics }) {
  const profit = Math.round(metrics.revenue * 0.3);
  const marketingRoi = (metrics.revenue / metrics.adSpend).toFixed(1);

  const cards = [
    { label: "Monthly Revenue", value: formatCurrency(metrics.revenue), sub: `Target: ${formatCurrency(metrics.target)}`, bg: "bg-green-50", border: "#10b981", textColor: "text-green-700", icon: TrendingUp },
    { label: "Marketing Spend", value: formatCurrency(metrics.adSpend), sub: `Google: ${formatCurrency(metrics.googleAds)} · FB: ${formatCurrency(metrics.facebookAds)}`, bg: "bg-red-50", border: "#ef4444", textColor: "text-red-700", icon: Megaphone },
    { label: "Est. Profit (30%)", value: formatCurrency(profit), sub: "Based on 30% net margin", bg: "bg-blue-50", border: "#3b82f6", textColor: "text-blue-700", icon: DollarSign },
    { label: "Marketing ROI", value: `${marketingRoi}x`, sub: "Revenue ÷ Ad Spend", bg: "bg-purple-50", border: "#8b5cf6", textColor: "text-purple-700", icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {cards.map((c) => (
        <Card key={c.label} className={cn("p-6", c.bg)} style={{ borderLeftWidth: 4, borderLeftColor: c.border }}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">{c.label}</span>
            <c.icon size={16} className={c.textColor} />
          </div>
          <div className={cn("text-3xl font-bold mb-1", c.textColor)}>{c.value}</div>
          <div className="text-xs text-muted">{c.sub}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: AI & Strategy ───────────────────────────────────────────────────────
function TabAiStrategy({ slug }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  function handleGenerateStrategy() {
    setLoading(true);
    setGenerated(false);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1800);
  }

  const actions = [
    { label: "Generate 90-Day Strategy", icon: Brain, bg: "bg-purple-600 hover:bg-purple-700", onClick: handleGenerateStrategy },
    { label: "Competitor Analysis", icon: BarChart3, bg: "bg-green-600 hover:bg-green-700", onClick: () => {} },
    { label: "Morning Brief", icon: Zap, bg: "bg-amber-500 hover:bg-amber-600", onClick: () => {} },
    { label: "Report Analyzer", icon: PieChart, bg: "bg-blue-600 hover:bg-blue-700", onClick: () => {} },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={cn("flex flex-col items-center gap-3 p-6 rounded-xl text-white font-semibold text-sm transition shadow-sm", a.bg)}
          >
            <a.icon size={28} />
            <span className="text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <Card className="p-8 flex flex-col items-center gap-3">
          <RefreshCw size={28} className="text-purple-500 animate-spin" />
          <div className="text-sm font-semibold text-ink">Generating 90-Day Strategy...</div>
          <div className="text-xs text-muted">Analysing telemetry, pipeline and market signals</div>
        </Card>
      )}

      {generated && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-purple-400" />
              <span className="text-sm font-bold text-purple-300">AI Strategy Summary</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{STRATEGY_OUTPUT.summary}</p>
          </div>

          <Card className="p-5">
            <SectionTitle icon={Zap} title="Quick Wins (Next 7 Days)" iconColor="text-amber-500" />
            <div className="space-y-3">
              {STRATEGY_OUTPUT.quickWins.map((w, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink leading-snug">{w.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted">Timeline: {w.timeline}</span>
                      <span className={cn("text-[10px] font-bold", w.impactColor)}>Impact: {w.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={TrendingUp} title="Growth Strategies (90 Days)" iconColor="text-green-600" />
            <ul className="space-y-3">
              {STRATEGY_OUTPUT.growthStrategies.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={AlertCircle} title="Risk Areas to Watch" iconColor="text-red-500" />
            <div className="space-y-3">
              {STRATEGY_OUTPUT.riskAreas.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={13} className="text-red-500" />
                    <span className="text-xs font-bold text-red-700">{r.title}</span>
                  </div>
                  <p className="text-xs text-red-600 leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Assets ──────────────────────────────────────────────────────────────
function TabAssets() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#10b981" }}>
        <SectionTitle icon={FileText} title="SDR Scripts" iconColor="text-green-600" />
        <ul className="space-y-2">
          {SDR_SCRIPTS.slice(0, 3).map((s) => (
            <li key={s.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-line hover:bg-green-50 transition cursor-pointer group">
              <span className="text-xs font-medium text-ink">{s.name}</span>
              <ChevronRight size={13} className="text-muted group-hover:text-green-600 transition" />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#3b82f6" }}>
        <SectionTitle icon={Shield} title="Objection Handlers" iconColor="text-blue-600" />
        <ul className="space-y-2">
          {OBJECTION_HANDLERS.map((o) => (
            <li key={o.text} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-line hover:bg-blue-50 transition cursor-pointer">
              <span className="text-xs font-medium text-ink">{o.text}</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{o.effectiveness}%</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#f59e0b" }}>
        <SectionTitle icon={Wifi} title="Voice AI Scripts" iconColor="text-amber-600" />
        <ul className="space-y-2">
          {VOICE_SCRIPTS.map((v) => (
            <li key={v.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-line hover:bg-amber-50 transition cursor-pointer group">
              <span className="text-xs font-medium text-ink">{v.name}</span>
              <ChevronRight size={13} className="text-muted group-hover:text-amber-600 transition" />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5" style={{ borderTopWidth: 4, borderTopColor: "#8b5cf6" }}>
        <SectionTitle icon={BookOpen} title="Documents & SOPs" iconColor="text-purple-600" />
        <p className="text-xs text-muted mb-4">Access treatment protocols, onboarding guides, compliance docs and practice SOPs.</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition">
          <ExternalLink size={13} />
          Open Document Library
        </button>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PracticeDashboardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [leads, setLeads] = useState(SEED_LEADS);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [bizData, setBizData] = useState(null);
  const [bizLoading, setBizLoading] = useState(true);

  // ─── Resolve business from API or fallback ───────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadBiz() {
      setBizLoading(true);
      try {
        const data = await api.businesses();
        if (!cancelled) {
          const found = Array.isArray(data) ? data.find((b) => b.slug === slug) : null;
          setBizData(found || null);
        }
      } catch {
        if (!cancelled) setBizData(null);
      } finally {
        if (!cancelled) setBizLoading(false);
      }
    }
    loadBiz();
    return () => { cancelled = true; };
  }, [slug]);

  // ─── Load tasks ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadTasks() {
      setTasksLoading(true);
      try {
        const data = await api.tasks({ business_slug: slug });
        if (!cancelled && Array.isArray(data) && data.length > 0) setTasks(data);
      } catch {
        // keep seed data
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    }
    loadTasks();
    return () => { cancelled = true; };
  }, [slug]);

  // ─── Load leads ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadLeads() {
      setLeadsLoading(true);
      try {
        const data = await api.leads();
        if (!cancelled && Array.isArray(data) && data.length > 0) setLeads(data);
      } catch {
        // keep seed data
      } finally {
        if (!cancelled) setLeadsLoading(false);
      }
    }
    loadLeads();
    return () => { cancelled = true; };
  }, [slug]);

  // ─── Resolve biz info ─────────────────────────────────────────────────────
  const fallbackStatic = BUSINESS_INFO[slug];
  const fallbackData = BUSINESSES.find((b) => b.slug === slug);

  // Not found at all
  if (!bizLoading && !fallbackStatic && !fallbackData && !bizData) {
    return (
      <>
        <Topbar title="Business Not Found" />
        <main className="p-6 max-w-[1500px] mx-auto w-full">
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Building2 size={48} className="text-muted opacity-30" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-ink mb-1">Business Not Found</h2>
              <p className="text-sm text-muted">No business found with slug: <code className="bg-soft px-1 rounded">{slug}</code></p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Go Back
            </button>
          </div>
        </main>
      </>
    );
  }

  const biz = {
    name: bizData?.name || fallbackStatic?.name || fallbackData?.name || (slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Practice"),
    emoji: bizData?.emoji || fallbackStatic?.emoji || fallbackData?.emoji || "🏢",
    type: bizData?.type || fallbackStatic?.type || fallbackData?.type || "practice",
    address: fallbackStatic?.address || "—",
    phone: fallbackStatic?.phone || "—",
    color: fallbackStatic?.color || "#7c3aed",
  };

  const metrics = generateMetrics(slug || "default");

  return (
    <>
      <Topbar title={`${biz.emoji} ${biz.name}`} />
      <main className="p-6 max-w-[1400px] mx-auto w-full">

        {/* ─── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-line shrink-0"
              style={{ backgroundColor: `${biz.color}18` }}
            >
              {biz.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-ink leading-tight">{biz.name}</h1>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full px-2.5 py-0.5 capitalize">
                  {biz.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-muted" />
                <span className="text-xs text-muted">{biz.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:self-center flex-wrap">
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-muted" />
              <span className="text-sm font-semibold text-ink">{biz.phone}</span>
            </div>
            <button
              onClick={() => navigate(`/practices`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-soft border border-line rounded-lg text-xs font-semibold text-muted hover:text-ink hover:border-purple-300 transition"
            >
              <Building2 size={13} />
              All Businesses
            </button>
          </div>
        </div>

        {/* ─── Tab Bar ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-soft rounded-xl border border-line">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap",
                activeTab === tab
                  ? "text-white shadow-sm"
                  : "text-muted hover:text-ink hover:bg-white"
              )}
              style={activeTab === tab ? { backgroundColor: biz.color } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ──────────────────────────────────────────── */}
        {activeTab === "Dashboard" && (
          <TabDashboard
            slug={slug}
            metrics={metrics}
            biz={biz}
            tasks={tasks}
            leads={leads}
            tasksLoading={tasksLoading}
            leadsLoading={leadsLoading}
            navigate={navigate}
          />
        )}
        {activeTab === "Marketing" && <TabMarketing metrics={metrics} />}
        {activeTab === "Sales" && <TabSales metrics={metrics} />}
        {activeTab === "Operations" && <TabOperations metrics={metrics} navigate={navigate} />}
        {activeTab === "Finance" && <TabFinance metrics={metrics} />}
        {activeTab === "AI & Strategy" && <TabAiStrategy slug={slug} />}
        {activeTab === "Assets" && <TabAssets />}
      </main>
    </>
  );
}
