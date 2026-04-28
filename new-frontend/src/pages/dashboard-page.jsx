import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

// ─── Static Data ─────────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    emoji: "💰",
    bg: "bg-green-50",
    label: "TOTAL REVENUE",
    value: "£1,245,430",
    delta: "+18.6% vs last 30 days",
    sparkPoints: "0,28 10,22 20,26 30,18 40,14 50,20 60,10",
  },
  {
    emoji: "📋",
    bg: "bg-blue-50",
    label: "TOTAL LEADS",
    value: "4,320",
    delta: "+14.3% vs last 30 days",
    sparkPoints: "0,30 10,26 20,20 30,22 40,15 50,12 60,8",
  },
  {
    emoji: "🎯",
    bg: "bg-purple-50",
    label: "CONVERSION RATE",
    value: "23.7%",
    delta: "+6.2% vs last 30 days",
    sparkPoints: "0,32 10,28 20,30 30,24 40,20 50,16 60,12",
  },
  {
    emoji: "✅",
    bg: "bg-amber-50",
    label: "TASKS COMPLETED",
    value: "286",
    delta: "+22.1% vs last 30 days",
    sparkPoints: "0,30 10,26 20,28 30,20 40,16 50,10 60,6",
  },
];

const BUSINESSES = [
  { name: "GM Dental — Warwick",      status: "green",  revenue: "£62,400", leads: "1,240", health: "92%", active: 12 },
  { name: "GM Dental — FTS",          status: "green",  revenue: "£48,200", leads: "890",   health: "78%", active: 8  },
  { name: "GM Dental — Strood",       status: "green",  revenue: "£51,100", leads: "620",   health: "85%", active: 9  },
  { name: "GM Dental — Sittingbourne",status: "amber",  revenue: "£39,800", leads: "430",   health: "65%", active: 6  },
  { name: "GM Dental — Maidstone",    status: "green",  revenue: "£54,600", leads: "730",   health: "84%", active: 7  },
  { name: "Plan4Growth Academy",      status: "black",  revenue: "£71,500", leads: "980",   health: "88%", active: 14 },
  { name: "GM Dental Lab",            status: "amber",  revenue: "£28,900", leads: "210",   health: "58%", active: 4  },
  { name: "Biological Clinician",     status: "white",  revenue: "£18,200", leads: "340",   health: "73%", active: 5  },
  { name: "Elevate Accounts",         status: "black",  revenue: "£21,400", leads: "190",   health: "81%", active: 3  },
];

const STATUS_DOT = {
  green: "bg-green-500",
  amber: "bg-amber-400",
  black: "bg-gray-800",
  white: "bg-gray-300 border border-gray-400",
};

function healthDotColor(healthStr) {
  const pct = parseInt(healthStr, 10);
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-amber-400";
  return "bg-gray-400";
}

const MORNING_BRIEF_BULLETS = [
  "12 tasks are due today · 5 high priority tasks need action",
  "3 campaigns need optimisation — Google Ads spending is high",
  "Revenue is up 18.6% — great job, keep the momentum",
  "2 approvals are pending — waiting for your review",
];

const TABS = [
  { label: "📋 Projects & Tasks", key: "tasks" },
  { label: "🚀 Marketing OS",     key: "marketing" },
  { label: "📊 CRM Pipeline",     key: "crm" },
  { label: "✨ AI Insights",      key: "ai" },
  { label: "📈 Reports",          key: "reports" },
  { label: "📅 Calendar",         key: "calendar" },
];

const KANBAN_COLUMNS = [
  {
    label: "TO DO",
    count: 3,
    card: {
      title: "Create Facebook Ad Campaign",
      business: "Warwick",
      avatarInitials: "NK",
      avatarBg: "#f59e0b",
      date: "22 MAY",
    },
  },
  {
    label: "IN PROGRESS",
    count: 3,
    card: {
      title: "Google Ads Optimisation",
      business: "Warwick",
      avatarInitials: "RU",
      avatarBg: "#2e75b6",
      date: "20 MAY",
    },
  },
  {
    label: "REVIEW",
    count: 2,
    card: {
      title: "Landing Page Review",
      business: "FTS",
      avatarInitials: "NR",
      avatarBg: "#7c3aed",
      date: "19 MAY",
    },
  },
  {
    label: "DONE",
    count: 3,
    card: {
      title: "Monthly Report — May",
      business: "All",
      avatarInitials: "NR",
      avatarBg: "#7c3aed",
      date: "16 MAY",
    },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sparkline({ points }) {
  return (
    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" className="mt-2">
      <polyline
        points={points}
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({ emoji, bg, label, value, delta, sparkPoints }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg", bg)}>
        {emoji}
      </div>
      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">{label}</div>
      <div className="text-2xl font-bold text-ink mt-0.5">{value}</div>
      <div className="text-xs text-green-600 mt-1">{delta}</div>
      <Sparkline points={sparkPoints} />
    </div>
  );
}

function BusinessesOverview() {
  return (
    <div className="bg-white border border-line rounded-xl p-5 flex-1 min-w-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-bold text-ink">Businesses Overview</span>
        <button className="text-xs text-primary font-semibold hover:underline">
          View All Businesses →
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-line">
            {["BUSINESS", "REVENUE (30D)", "LEADS", "HEALTH SCORE", "ACTIVE"].map((col) => (
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
          {BUSINESSES.map((biz) => (
            <tr key={biz.name} className="border-b border-line/50 hover:bg-bg-soft transition">
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full flex-shrink-0",
                      healthDotColor(biz.health)
                    )}
                  />
                  <span className="text-sm font-semibold text-ink whitespace-nowrap">{biz.name}</span>
                </div>
              </td>
              <td className="py-2 text-sm text-ink">{biz.revenue}</td>
              <td className="py-2 text-sm text-ink">{biz.leads}</td>
              <td className="py-2 text-sm text-ink">{biz.health}</td>
              <td className="py-2 text-sm text-ink">{biz.active}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AIMorningBrief() {
  return (
    <div className="bg-white border border-line rounded-xl p-5 w-[360px] flex-shrink-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-base font-bold text-ink">✨ AI Morning Brief</span>
        <span className="text-xs text-muted">Just now</span>
      </div>

      {/* Greeting */}
      <div className="text-sm font-semibold text-ink">Good morning, Gaurav 👋</div>
      <div className="text-xs text-muted mt-1">Here's what needs your attention today.</div>

      {/* Bullets */}
      <ul className="mt-3 space-y-2">
        {MORNING_BRIEF_BULLETS.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary font-bold leading-5 flex-shrink-0">›</span>
            <span className="text-sm text-ink">{bullet}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-green-500 hover:opacity-90 transition">
        📨 Send Morning Brief
      </button>
    </div>
  );
}

function KanbanBoard() {
  return (
    <div className="flex gap-4">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col.label} className="flex-1 min-w-0">
          {/* Column header */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">{col.label}</span>
            <span className="text-xs font-bold text-muted">{col.count}</span>
          </div>

          {/* Single card */}
          <div className="bg-white border border-line rounded-lg p-3">
            <div className="text-sm font-semibold text-ink">{col.card.title}</div>
            <div className="text-xs text-muted mt-0.5">{col.card.business}</div>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: col.card.avatarBg }}
              >
                {col.card.avatarInitials}
              </div>
              <span className="text-[10px] text-muted uppercase">{col.card.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <>
      <Topbar
        title="Command Centre"
        subtitle="Overview of your entire business ecosystem"
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Mode Filter */}
        <ModeFilter />

        {/* Main layout: content + sidebar */}
        <div className="flex gap-6 mt-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* 1. KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {KPI_CARDS.map((card) => (
                <KpiCard key={card.label} {...card} />
              ))}
            </div>

            {/* 2. Middle row */}
            <div className="flex gap-6 mb-6">
              <BusinessesOverview />
              <AIMorningBrief />
            </div>

            {/* 3. Bottom section: tabs + kanban */}
            <div className="bg-white border border-line rounded-xl p-5">
              {/* Tab row */}
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

              {/* Kanban header */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-bold text-ink">Kanban Board</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted cursor-pointer hover:text-ink transition">⚙ Filter</span>
                  <span className="text-xs text-muted">Group: Status</span>
                </div>
              </div>

              {/* Mini kanban */}
              <KanbanBoard />
            </div>

          </div>

          {/* Right sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
