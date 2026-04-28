import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import { BUSINESSES, USERS_DEFAULT } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import {
  X,
  TrendingUp,
  TrendingDown,
  Users,
  CalendarCheck,
  ClipboardList,
  AlertTriangle,
  Wifi,
  ChevronRight,
  Play,
  Square,
  CheckCircle,
  Clock,
  Building2,
  Megaphone,
  Globe,
  ThumbsUp,
  CornerDownRight,
  Zap,
  Target,
  BadgeCheck,
} from "lucide-react";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const BRIEFING_TEXT =
  "Ashford and Bexleyheath are pacing strong — push follow-up calls before 2 PM to lock bookings. Warwick Lodge lead volume is 38% below target; escalate ad budget review by noon. Ensure all overdue tasks have owners assigned before end of day.";

const SEED_KPI = [
  {
    id: "revenue",
    label: "Revenue",
    value: formatCurrency(885133),
    raw: 885133,
    target: 1000000,
    delta: 12.5,
    positive: true,
    border: "#10b981",
    icon: TrendingUp,
  },
  {
    id: "leads",
    label: "Leads Today",
    value: "20",
    raw: 20,
    delta: 8.3,
    positive: true,
    border: "#14b8a6",
    subtitle: "117 this week",
    icon: Users,
  },
  {
    id: "bookings",
    label: "Bookings Today",
    value: "12",
    raw: 12,
    delta: null,
    positive: true,
    border: "#14b8a6",
    subtitle: "38.5% conv.",
    icon: CalendarCheck,
  },
  {
    id: "tasks",
    label: "Tasks Done",
    value: "20 / 48",
    raw: null,
    delta: null,
    positive: true,
    border: "#10b981",
    subtitle: "41.7% complete",
    icon: ClipboardList,
  },
  {
    id: "overdue",
    label: "Overdue",
    value: "2",
    raw: 2,
    delta: null,
    positive: false,
    border: "#ef4444",
    subtitle: "Needs resolution",
    icon: AlertTriangle,
  },
  {
    id: "online",
    label: "Team Online",
    value: "7 / 10",
    raw: null,
    delta: null,
    positive: true,
    border: "#6366f1",
    subtitle: "3 away",
    icon: Wifi,
  },
];

const SEED_TIMELINE = [
  {
    id: 1,
    time: "08:00",
    title: "Review Ashford ad performance & CPL report",
    priority: "high",
    business: "Ashford",
    owner: "Nikhil",
    done: true,
  },
  {
    id: 2,
    time: "09:30",
    title: "Team stand-up — daily priorities sync",
    priority: "medium",
    business: "All",
    owner: "Gaurav",
    done: true,
  },
  {
    id: 3,
    time: "10:00",
    title: "Warwick Lodge lead follow-up calls (batch 1)",
    priority: "high",
    business: "Warwick Lodge",
    owner: "Sona",
    done: false,
  },
  {
    id: 4,
    time: "11:00",
    title: "Publish Instagram Reel — Barnet implant offer",
    priority: "medium",
    business: "Barnet",
    owner: "Abhishek",
    done: false,
  },
  {
    id: 5,
    time: "12:00",
    title: "Ad budget review — Warwick Lodge escalation",
    priority: "high",
    business: "Warwick Lodge",
    owner: "Nikhil",
    done: false,
  },
  {
    id: 6,
    time: "13:00",
    title: "GHL automation audit — no-show sequence",
    priority: "medium",
    business: "All",
    owner: "Maryam",
    done: false,
  },
  {
    id: 7,
    time: "14:00",
    title: "Bexleyheath booking confirmation follow-ups",
    priority: "high",
    business: "Bexleyheath",
    owner: "Veena",
    done: false,
  },
  {
    id: 8,
    time: "15:30",
    title: "SEO content brief — Rochester blog post",
    priority: "low",
    business: "Rochester",
    owner: "Fatima",
    done: false,
  },
  {
    id: 9,
    time: "17:00",
    title: "EOD task sweep — close completed items",
    priority: "medium",
    business: "All",
    owner: "Gaurav",
    done: false,
  },
];

const BIZ_STATUS = {
  ashford: "green",
  rochester: "amber",
  barnet: "green",
  bexleyheath: "green",
  "warwick-lodge": "red",
  "rye-dental": "amber",
  academy: "amber",
  lab: "green",
  accounts: "green",
};

const SEED_POSTS = [
  {
    id: 1,
    brand: "Barnet",
    title: "Dental Implants — Before & After Reel",
    channel: "Instagram",
    icon: Globe,
    color: "#e1306c",
    scheduledFor: "Today 11:00",
    status: "ready",
  },
  {
    id: 2,
    brand: "Ashford",
    title: "Why Choose Ashford for Invisalign?",
    channel: "YouTube",
    icon: Globe,
    color: "#ff0000",
    scheduledFor: "Today 14:00",
    status: "draft",
  },
  {
    id: 3,
    brand: "Rye Dental",
    title: "5-Star Review Spotlight — Patient Story",
    channel: "Instagram",
    icon: Globe,
    color: "#e1306c",
    scheduledFor: "Tomorrow 09:00",
    status: "ready",
  },
  {
    id: 4,
    brand: "All Practices",
    title: "GM Dental Group — April Offers Landing Page",
    channel: "Web",
    icon: Globe,
    color: "#6366f1",
    scheduledFor: "Tomorrow 10:00",
    status: "review",
  },
  {
    id: 5,
    brand: "Academy",
    title: "Dental Nursing Course — Intake Open",
    channel: "Instagram",
    icon: Globe,
    color: "#e1306c",
    scheduledFor: "Wed 11:00",
    status: "draft",
  },
  {
    id: 6,
    brand: "Bexleyheath",
    title: "Teeth Whitening Promo — Flash Deal",
    channel: "Instagram",
    icon: Globe,
    color: "#e1306c",
    scheduledFor: "Wed 13:00",
    status: "ready",
  },
];

const POST_STATUS_META = {
  ready: { label: "Ready", cls: "bg-emerald-100 text-emerald-700" },
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  review: { label: "In Review", cls: "bg-amber-100 text-amber-700" },
};

const SEED_TRACKER = BUSINESSES.slice(0, 6).map((biz, i) => ({
  slug: biz.slug,
  name: biz.name,
  emoji: biz.emoji,
  minutes: [82, 47, 65, 110, 30, 54][i],
}));

const SEED_DECISIONS = [
  {
    id: 1,
    title: "Increase Warwick Lodge ad budget by £500/week",
    reason: "Lead volume 38% below target for 3 consecutive days",
    owner: "Nikhil",
    urgency: "Today",
    business: "Warwick Lodge",
  },
  {
    id: 2,
    title: "Approve Rochester blog content for SEO sprint",
    reason: "Content ready — needs sign-off before publication",
    owner: "Fatima",
    urgency: "By EOD",
    business: "Rochester",
  },
  {
    id: 3,
    title: "Extend Bexleyheath Invisalign offer by 2 weeks",
    reason: "8 pipeline leads have not yet converted — offer extension may help",
    owner: "Gaurav",
    urgency: "Tomorrow",
    business: "Bexleyheath",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRIORITY_META = {
  high: { label: "High", cls: "bg-red-100 text-red-700", dot: "#ef4444" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700", dot: "#f59e0b" },
  low: { label: "Low", cls: "bg-sky-100 text-sky-700", dot: "#38bdf8" },
};

const STATUS_DOT = {
  green: "bg-emerald-500",
  amber: "bg-amber-400",
  red: "bg-red-500",
};

const BIZ_STATUS_LABEL = {
  green: "On Track",
  amber: "Watch",
  red: "At Risk",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function fmtMinutes(m) {
  return `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FocusSubBar({ focus, onClear, businesses }) {
  return (
    <div className="bg-white border-b border-line px-6 py-2 flex items-center gap-3">
      <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">Viewing</span>
      {focus ? (
        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
          {businesses.find((b) => b.slug === focus)?.emoji}{" "}
          {businesses.find((b) => b.slug === focus)?.name}
          <button onClick={onClear} className="ml-1 hover:text-primary/70 transition">
            <X size={11} />
          </button>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          All Businesses
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        {businesses.map((biz) => (
          <button
            key={biz.slug}
            onClick={() => onClear(biz.slug)}
            className={cn(
              "text-[11px] px-2 py-0.5 rounded-md border transition",
              focus === biz.slug
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-line text-muted hover:border-primary/40 hover:text-ink"
            )}
          >
            {biz.emoji} {biz.name}
          </button>
        ))}
      </div>
      <span className="ml-4 text-[11px] text-muted whitespace-nowrap">{TODAY}</span>
    </div>
  );
}

function BriefingBanner() {
  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ background: "linear-gradient(to right, #0e2a47, #1f4470)" }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <Zap size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
            Today's Game Plan
          </p>
          <p className="text-sm text-white/90 leading-relaxed">{BRIEFING_TEXT}</p>
        </div>
      </div>
    </div>
  );
}

function KpiRow({ kpis }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div
            key={k.id}
            className="bg-white border border-line rounded-xl p-4 relative overflow-hidden"
            style={{ borderLeftWidth: 3, borderLeftColor: k.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wide leading-tight">
                {k.label}
              </span>
              <Icon size={14} className="text-muted shrink-0" />
            </div>
            <div className="text-xl font-bold text-ink tracking-tight">{k.value}</div>
            <div className="flex items-center justify-between mt-1">
              {k.subtitle && (
                <span className="text-[10px] text-muted">{k.subtitle}</span>
              )}
              {k.delta !== null && k.delta !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-semibold flex items-center gap-0.5 ml-auto",
                    k.positive ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {k.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(k.delta)}%
                </span>
              )}
            </div>
            {k.raw !== null && k.target && (
              <div className="mt-2">
                <div className="h-1 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (k.raw / k.target) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TodaysPlan({ items, onToggle }) {
  const done = items.filter((i) => i.done).length;
  return (
    <div className="bg-white border border-line rounded-xl flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <ClipboardList size={15} className="text-ink" />
        <h2 className="text-sm font-bold text-ink">Today's Plan</h2>
        <span className="ml-auto text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {done}/{items.length}
        </span>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
        {items.map((item, idx) => {
          const pm = PRIORITY_META[item.priority];
          return (
            <div
              key={item.id}
              className={cn(
                "flex gap-3 px-4 py-3 border-b border-line last:border-0 group transition hover:bg-soft",
                item.done && "opacity-60"
              )}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: pm.dot }}
                />
                {idx < items.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ backgroundColor: "#e5e7eb" }} />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-semibold text-muted tabular-nums">
                    {item.time}
                  </span>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", pm.cls)}>
                    {pm.label}
                  </span>
                  {item.business !== "All" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                      {item.business}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs font-medium text-ink leading-snug",
                    item.done && "line-through text-muted"
                  )}
                >
                  {item.title}
                </p>
                <p className="text-[10px] text-muted mt-0.5">{item.owner}</p>
              </div>
              {/* Toggle */}
              <button
                onClick={() => onToggle(item.id)}
                className={cn(
                  "shrink-0 mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition",
                  item.done
                    ? "bg-primary border-primary text-white"
                    : "border-line hover:border-primary"
                )}
              >
                {item.done && <CheckCircle size={12} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BusinessGlance({ businesses }) {
  const maxRev = Math.max(...businesses.map((b) => b.revenue));
  return (
    <div className="bg-white border border-line rounded-xl flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <Building2 size={15} className="text-ink" />
        <h2 className="text-sm font-bold text-ink">Business At-a-Glance</h2>
      </div>
      <div className="grid grid-cols-3 gap-px bg-line flex-1">
        {businesses.map((biz) => {
          const status = BIZ_STATUS[biz.slug] || "green";
          const pct = Math.round((biz.revenue / maxRev) * 100);
          return (
            <div key={biz.slug} className="bg-white p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[status])}
                />
                <span className="text-xs font-semibold text-ink truncate">{biz.emoji} {biz.name}</span>
              </div>
              <div className="text-[11px] font-bold text-ink">{formatCurrency(biz.revenue)}</div>
              <div className="text-[10px] text-muted">{BIZ_STATUS_LABEL[status]}</div>
              <div className="h-1 bg-line rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    status === "green"
                      ? "bg-emerald-500"
                      : status === "amber"
                      ? "bg-amber-400"
                      : "bg-red-500"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex gap-2 text-[10px] text-muted">
                <span>{biz.leads} leads</span>
                <span className="text-line">|</span>
                <span>{biz.bookings} bk</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentPosts({ posts }) {
  return (
    <div className="bg-white border border-line rounded-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <Megaphone size={15} className="text-ink" />
        <h2 className="text-sm font-bold text-ink">Upcoming Content Posts</h2>
        <span className="ml-auto text-[11px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
          {posts.length} scheduled
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
        {posts.map((post) => {
          const Icon = post.icon;
          const sm = POST_STATUS_META[post.status];
          return (
            <div
              key={post.id}
              className="bg-white p-4 flex flex-col gap-2"
              style={{ borderLeft: `3px solid ${post.color}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} style={{ color: post.color }} />
                  <span className="text-[10px] font-semibold text-muted">{post.channel}</span>
                </div>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", sm.cls)}>
                  {sm.label}
                </span>
              </div>
              <p className="text-xs font-semibold text-ink leading-snug">{post.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                  {post.brand}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <Clock size={10} />
                  {post.scheduledFor}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeTracker({ tracker, active, onToggle }) {
  const maxMins = Math.max(...tracker.map((t) => t.minutes));
  return (
    <div className="bg-white border border-line rounded-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <Clock size={15} className="text-ink" />
        <h2 className="text-sm font-bold text-ink">Time Tracker</h2>
        <div className="ml-auto flex items-center gap-2">
          {active ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Session Active
            </span>
          ) : (
            <span className="text-[11px] text-muted">Session Stopped</span>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition",
              active
                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                : "bg-primary text-white hover:bg-emerald-600"
            )}
          >
            {active ? <><Square size={12} /> Stop</> : <><Play size={12} /> Start</>}
          </button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tracker.map((biz) => {
          const pct = Math.round((biz.minutes / maxMins) * 100);
          return (
            <div key={biz.slug} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink">
                  {biz.emoji} {biz.name}
                </span>
                <span className="text-[10px] text-muted tabular-nums">
                  {fmtMinutes(biz.minutes)}
                </span>
              </div>
              <div className="h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DecisionsPanel({ decisions, onApprove, onDefer }) {
  return (
    <div className="bg-white border border-line rounded-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <BadgeCheck size={15} className="text-ink" />
        <h2 className="text-sm font-bold text-ink">Decisions & Approvals</h2>
        <span className="ml-auto text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
          {decisions.length} pending
        </span>
      </div>
      <div className="divide-y divide-line">
        {decisions.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted">
            All caught up — no pending decisions.
          </div>
        )}
        {decisions.map((d) => (
          <div
            key={d.id}
            className="px-4 py-4 flex gap-4 items-start"
            style={{ borderLeft: "3px solid #f59e0b" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                  {d.urgency}
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                  {d.business}
                </span>
                <span className="text-[10px] text-muted">Owner: {d.owner}</span>
              </div>
              <p className="text-xs font-semibold text-ink leading-snug mb-0.5">{d.title}</p>
              <p className="text-[11px] text-muted leading-snug">{d.reason}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => onApprove(d.id)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-white hover:bg-emerald-600 transition"
              >
                <ThumbsUp size={11} /> Approve
              </button>
              <button
                onClick={() => onDefer(d.id)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <CornerDownRight size={11} /> Defer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  const [focusBusiness, setFocusBusiness] = useState(null);
  const [tasks, setTasks] = useState(SEED_TIMELINE);
  const [trackerActive, setTrackerActive] = useState(false);
  const [decisions, setDecisions] = useState(SEED_DECISIONS);

  // Filter timeline + posts by focus
  const filteredTasks = focusBusiness
    ? tasks.filter((t) => {
        const biz = BUSINESSES.find((b) => b.slug === focusBusiness);
        return t.business === "All" || (biz && t.business === biz.name);
      })
    : tasks;

  const filteredPosts = focusBusiness
    ? SEED_POSTS.filter((p) => {
        const biz = BUSINESSES.find((b) => b.slug === focusBusiness);
        return p.brand === "All Practices" || (biz && p.brand === biz.name);
      })
    : SEED_POSTS;

  function handleFocusSet(slug) {
    setFocusBusiness(slug === focusBusiness ? null : slug);
  }

  function handleFocusClear(slug) {
    if (typeof slug === "string" && BUSINESSES.find((b) => b.slug === slug)) {
      setFocusBusiness(slug);
    } else {
      setFocusBusiness(null);
    }
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function approveDecision(id) {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
  }

  function deferDecision(id) {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <>
      <Topbar title="Mission Control" />

      {/* Focus Sub-bar */}
      <FocusSubBar
        focus={focusBusiness}
        onClear={handleFocusClear}
        businesses={BUSINESSES}
      />

      <main className="p-5 max-w-[1600px] mx-auto w-full space-y-5">
        {/* Briefing Banner */}
        <BriefingBanner />

        {/* KPI Row */}
        <KpiRow kpis={SEED_KPI} />

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TodaysPlan items={filteredTasks} onToggle={toggleTask} />
          <BusinessGlance businesses={BUSINESSES} />
        </div>

        {/* Content Posts */}
        <ContentPosts posts={filteredPosts} />

        {/* Time Tracker + Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TimeTracker
            tracker={SEED_TRACKER}
            active={trackerActive}
            onToggle={() => setTrackerActive((v) => !v)}
          />
          <DecisionsPanel
            decisions={decisions}
            onApprove={approveDecision}
            onDefer={deferDecision}
          />
        </div>
      </main>
    </>
  );
}
