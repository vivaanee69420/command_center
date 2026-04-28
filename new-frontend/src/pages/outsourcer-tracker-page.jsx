import { useState, useEffect, useRef } from "react";
import Topbar from "@/components/layout/topbar";
import { cn } from "@/lib/utils";
import {
  Clock,
  Play,
  Square,
  Camera,
  Activity,
  User,
} from "lucide-react";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USER = { name: "Maria Santos", role: "General Outsourcer", avatar: "MS" };

const SEED_ACTIVITIES = [
  { id: 1,  time: "08:02", description: "Logged in to portal", type: "login" },
  { id: 2,  time: "08:04", description: "Started task: Review Q1 patient enquiries spreadsheet", type: "task" },
  { id: 3,  time: "08:30", description: "Screenshot captured (activity: typing)", type: "snap" },
  { id: 4,  time: "09:00", description: "Screenshot captured (activity: browser – Google Sheets)", type: "snap" },
  { id: 5,  time: "09:15", description: "Manager check-in acknowledged", type: "checkin" },
  { id: 6,  time: "09:30", description: "Screenshot captured (activity: typing)", type: "snap" },
  { id: 7,  time: "09:45", description: "Idle detected (5 min)", type: "idle" },
  { id: 8,  time: "09:50", description: "Resumed activity", type: "task" },
  { id: 10, time: "10:00", description: "Screenshot captured (activity: browser – Notion)", type: "snap" },
  { id: 11, time: "10:30", description: "Started task: Update lead pipeline tags in GHL", type: "task" },
  { id: 12, time: "11:00", description: "Screenshot captured (activity: browser – GHL)", type: "snap" },
];

const SEED_SCREENSHOTS = [
  { id: 1, time: "08:30", label: "Google Sheets", activity: "typing" },
  { id: 2, time: "09:00", label: "Google Sheets", activity: "browser" },
  { id: 3, time: "09:30", label: "Slack", activity: "typing" },
  { id: 4, time: "10:00", label: "Notion", activity: "browser" },
  { id: 5, time: "10:30", label: "GHL CRM", activity: "browser" },
  { id: 6, time: "11:00", label: "GHL CRM", activity: "typing" },
];

const SEED_KPIS = {
  todayTracked: "3h 24m",
  weekTracked: "18h 10m",
  snapshotsWeek: 34,
  status: "online",
  since: "08:02 AM",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function nowTimeStr() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_STYLES = {
  login:   "bg-blue-50 text-blue-700 border border-blue-200",
  logout:  "bg-red-50 text-red-700 border border-red-200",
  snap:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  idle:    "bg-amber-50 text-amber-700 border border-amber-200",
  task:    "bg-indigo-50 text-indigo-700 border border-indigo-200",
  checkin: "bg-pink-50 text-pink-700 border border-pink-200",
};

const BADGE_LABELS = {
  login: "Login", logout: "Logout", snap: "Snap",
  idle: "Idle", task: "Task", checkin: "Check-in",
};

function Badge({ type }) {
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide", BADGE_STYLES[type] ?? "bg-gray-100 text-gray-600")}>
      {BADGE_LABELS[type] ?? type}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-line shadow-sm p-4 flex items-start gap-3 flex-1 min-w-0">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted font-medium uppercase tracking-wide leading-none mb-1">{label}</p>
        <p className="text-lg font-bold text-ink leading-tight truncate">{value}</p>
        {sub && <p className="text-[11px] text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OutsourcerTrackerPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(12240); // seed: 3h 24m already logged
  const [currentTask, setCurrentTask] = useState("Review Q1 patient enquiries spreadsheet");
  const [taskInput, setTaskInput] = useState("");
  const [activities, setActivities] = useState(SEED_ACTIVITIES);
  const [showCheckin, setShowCheckin] = useState(true);
  const intervalRef = useRef(null);

  // Timer tick
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isTracking]);

  function handleStart() {
    setIsTracking(true);
    const entry = {
      id: Date.now(),
      time: nowTimeStr(),
      description: currentTask ? `Started task: ${currentTask}` : "Resumed tracking",
      type: "task",
    };
    setActivities((prev) => [entry, ...prev]);
  }

  function handleStop() {
    setIsTracking(false);
    const entry = {
      id: Date.now(),
      time: nowTimeStr(),
      description: "Stopped tracking",
      type: "logout",
    };
    setActivities((prev) => [entry, ...prev]);
  }

  function handleLogTask() {
    if (!taskInput.trim()) return;
    setCurrentTask(taskInput.trim());
    const entry = {
      id: Date.now(),
      time: nowTimeStr(),
      description: `Task logged: ${taskInput.trim()}`,
      type: "task",
    };
    setActivities((prev) => [entry, ...prev]);
    setTaskInput("");
  }

  function handleCheckin() {
    setShowCheckin(false);
    const entry = {
      id: Date.now(),
      time: nowTimeStr(),
      description: "Manager check-in acknowledged",
      type: "checkin",
    };
    setActivities((prev) => [entry, ...prev]);
  }

  const displayedKpis = {
    ...SEED_KPIS,
    todayTracked: formatElapsed(elapsedSeconds),
  };

  return (
    <>
      <Topbar title="Outsourcer Portal" />

      <main className="p-6 w-full max-w-[980px] mx-auto space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink leading-tight">Outsourcer Portal</h1>
            <p className="text-xs text-muted">Time tracking &amp; activity log</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white border border-line rounded-xl px-3 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-ink">{SEED_USER.name}</p>
              <p className="text-[10px] text-muted">{SEED_USER.role}</p>
            </div>
          </div>
        </div>

        {/* ── Check-in Banner ────────────────────────────────────────────── */}
        {showCheckin && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <p className="text-sm font-medium text-amber-800 flex-1">
              Your manager wants a check-in — let them know you're here.
            </p>
            <button
              onClick={handleCheckin}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              I'm here
            </button>
          </div>
        )}

        {/* ── Timer Bar ──────────────────────────────────────────────────── */}
        <div
          className={cn(
            "bg-white rounded-xl border shadow-sm p-5 transition-all duration-300",
            isTracking
              ? "border-primary/40 bg-emerald-50/40 shadow-emerald-100"
              : "border-line"
          )}
        >
          <div className="flex items-center gap-4 flex-wrap">
            {/* Pulse + status */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                {isTracking ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                  </>
                ) : (
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-gray-300" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted font-medium uppercase tracking-wide leading-none">
                  {isTracking ? "Tracking" : "Not tracking"}
                </p>
                {isTracking && currentTask && (
                  <p className="text-xs font-semibold text-ink mt-0.5 truncate max-w-[260px]">
                    {currentTask}
                  </p>
                )}
              </div>
            </div>

            {/* Elapsed time */}
            <div
              className={cn(
                "ml-auto text-3xl font-bold tabular-nums tracking-tight",
                isTracking ? "text-primary" : "text-gray-400"
              )}
            >
              {formatElapsed(elapsedSeconds)}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {!isTracking ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Play size={15} />
                  Start Work
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Square size={15} />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <KpiCard
            icon={<Clock size={16} className="text-primary" />}
            label="Today"
            value={displayedKpis.todayTracked}
            sub="tracked time"
            accent="bg-primary/10"
          />
          <KpiCard
            icon={<Activity size={16} className="text-indigo-600" />}
            label="This Week"
            value={displayedKpis.weekTracked}
            sub="tracked time"
            accent="bg-indigo-50"
          />
          <KpiCard
            icon={<Camera size={16} className="text-amber-600" />}
            label="Snapshots"
            value={displayedKpis.snapshotsWeek}
            sub="this week"
            accent="bg-amber-50"
          />
          <KpiCard
            icon={
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  displayedKpis.status === "online" ? "bg-primary" : "bg-gray-400"
                )}
              />
            }
            label="Status"
            value={displayedKpis.status === "online" ? "Online" : "Offline"}
            sub={`since ${displayedKpis.since}`}
            accent={displayedKpis.status === "online" ? "bg-primary/10" : "bg-gray-100"}
          />
        </div>

        {/* ── Two-column lower section ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">

          {/* Left column */}
          <div className="space-y-5">

            {/* Current Task Card */}
            <div className="bg-white rounded-xl border border-line shadow-sm p-5">
              <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                What are you working on?
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogTask()}
                  placeholder="Describe your current task…"
                  className="flex-1 border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                />
                <button
                  onClick={handleLogTask}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap"
                >
                  Log task
                </button>
              </div>
              {currentTask && (
                <p className="mt-2 text-xs text-muted">
                  Current:{" "}
                  <span className="text-ink font-medium">{currentTask}</span>
                </p>
              )}
              <div className="mt-4 bg-bg-soft rounded-lg border border-line px-3 py-2.5">
                <p className="text-[11px] text-muted leading-snug">
                  <span className="font-semibold text-gray-500">Screen capture notice:</span> Random
                  screenshots are taken every 10–30 minutes while tracking is active. These are
                  stored securely and reviewed only by your manager. By starting the tracker you
                  consent to this monitoring.
                </p>
              </div>
            </div>

            {/* Screenshots Card */}
            <div className="bg-white rounded-xl border border-line shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Camera size={14} className="text-amber-500" />
                  Recent Screenshots
                </h2>
                <span className="text-[10px] text-muted bg-bg-soft border border-line rounded px-2 py-0.5">
                  stored locally
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SEED_SCREENSHOTS.map((ss) => (
                  <div key={ss.id} className="group rounded-lg border border-line overflow-hidden bg-bg-soft hover:border-primary/30 transition cursor-default">
                    {/* Placeholder screenshot area */}
                    <div className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      <Camera size={18} className="text-gray-300" />
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/40 text-white rounded px-1 py-0.5">
                        {ss.activity}
                      </span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-semibold text-ink truncate">{ss.label}</p>
                      <p className="text-[9px] text-muted">{ss.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Activity Log */}
          <div className="bg-white rounded-xl border border-line shadow-sm p-5 flex flex-col">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-2 mb-3 shrink-0">
              <Clock size={14} className="text-indigo-500" />
              Today's Activity
              <span className="ml-auto text-[10px] text-muted font-normal bg-bg-soft border border-line rounded px-2 py-0.5">
                {activities.length} events
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-1 max-h-[440px] pr-1">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-soft transition group"
                >
                  <span className="text-[11px] text-muted font-mono w-10 shrink-0 mt-0.5">{a.time}</span>
                  <p className="text-xs text-ink flex-1 leading-snug">{a.description}</p>
                  <Badge type={a.type} />
                </div>
              ))}
              {activities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <Activity size={28} className="mb-2 opacity-30" />
                  <p className="text-sm">No activity yet today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
