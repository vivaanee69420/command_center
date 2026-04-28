import { useState, useRef } from "react";
import Topbar from "@/components/layout/topbar";
import { USERS_DEFAULT } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Upload,
  RotateCcw,
  CheckCheck,
  User,
  Inbox,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const SEED_TASKS = [
  {
    id: "t1",
    owner: "ruhith",
    dayOffset: 0, // Mon of the current week (offset from week start)
    priority: "P1",
    business: { name: "Ashford", emoji: "\uD83E\uDDB7" },
    title: "Fix lead form submission bug on landing page",
    description:
      "The contact form on the Ashford landing page throws a 500 error after submission. Investigate backend logs and patch the handler.",
    steps: [
      "Reproduce the bug locally",
      "Check API logs for the exact error trace",
      "Fix the form handler endpoint",
      "Deploy and verify on staging",
    ],
  },
  {
    id: "t2",
    owner: "nikhil",
    dayOffset: 0,
    priority: "P0",
    business: { name: "Rochester", emoji: "\uD83C\uDFDB\uFE0F" },
    title: "Launch Rochester June ad campaign",
    description:
      "Set up Meta Ads and Google Ads campaigns for Rochester's June implant promotion. Ensure tracking pixels are active.",
    steps: [
      "Finalise ad creatives with the design team",
      "Upload assets to Meta Ads Manager",
      "Configure Google Ads campaign with correct targeting",
      "Enable conversion tracking and do a test run",
    ],
  },
  {
    id: "t3",
    owner: "fatima",
    dayOffset: 1, // Tue
    priority: "P2",
    business: { name: "Barnet", emoji: "\uD83C\uDFD7\uFE0F" },
    title: "Publish Barnet SEO blog post",
    description:
      "Write and publish the monthly SEO article targeting 'dental implants Barnet'. Optimise meta tags and internal links.",
    steps: [
      "Complete first draft (1,200 words)",
      "Add internal links to treatment pages",
      "Optimise title tag and meta description",
      "Publish and submit URL to Google Search Console",
    ],
  },
  {
    id: "t4",
    owner: "abhishek",
    dayOffset: 1,
    priority: "P2",
    business: { name: "Bexleyheath", emoji: "\uD83D\uDE0A" },
    title: "Film and edit Bexleyheath Reel",
    description:
      "Create a 30-second Instagram Reel showing a patient smile transformation at Bexleyheath. Hook in first 3 seconds.",
    steps: [
      "Film before/after clips at the clinic",
      "Edit with captions and trending audio",
      "Add practice branding and CTA overlay",
      "Schedule in Meta Business Suite for 6pm",
    ],
  },
  {
    id: "t5",
    owner: "maryam",
    dayOffset: 2, // Wed
    priority: "P1",
    business: { name: "Warwick Lodge", emoji: "\uD83C\uDFE1" },
    title: "Build GHL follow-up sequence for missed appointments",
    description:
      "Create an automated SMS + email drip in GoHighLevel triggered when a patient misses their appointment at Warwick Lodge.",
    steps: [
      "Map the follow-up sequence logic (Day 0, Day 1, Day 3)",
      "Write SMS and email copy for each step",
      "Build the workflow in GHL",
      "Test with a sandbox contact and confirm triggers",
    ],
  },
  {
    id: "t6",
    owner: "sona",
    dayOffset: 2,
    priority: "P0",
    business: { name: "Rye Dental", emoji: "\uD83D\uDC33" },
    title: "Call back all uncontacted Rye Dental leads",
    description:
      "40 leads came in over the weekend and have not been contacted. Aim to reach at least 30 and book consultations.",
    steps: [
      "Export lead list from GHL filtered by 'New' status",
      "Call each lead and log outcome in GHL",
      "Book consultations for interested patients",
      "Update lead stage and add call notes",
    ],
  },
  {
    id: "t7",
    owner: "ruhith",
    dayOffset: 3, // Thu
    priority: "P1",
    business: { name: "Accounts", emoji: "\uD83D\uDCCA" },
    title: "Integrate Stripe webhook for revenue tracking",
    description:
      "Wire up the Stripe webhook to the Command Center revenue_snapshot table so payment data flows in automatically.",
    steps: [
      "Register webhook endpoint in Stripe dashboard",
      "Parse payment_intent.succeeded events in backend",
      "Map amount to revenue_snapshot row with business_id",
      "Write a quick test to confirm end-to-end data flow",
    ],
  },
  {
    id: "t8",
    owner: "gaurav",
    dayOffset: 3,
    priority: "P3",
    business: { name: "Academy", emoji: "\uD83D\uDC22" },
    title: "Review Academy monthly P&L report",
    description:
      "Go through the Academy income statement for the month, flag any over-budget line items, and prepare exec summary.",
    steps: [
      "Pull P&L from Xero",
      "Compare actuals vs. budget for each category",
      "Note variances above 10%",
      "Write 1-page exec summary for board",
    ],
  },
  {
    id: "t9",
    owner: "veena",
    dayOffset: 4, // Fri
    priority: "P1",
    business: { name: "Lab", emoji: "\uD83E\uDDEA" },
    title: "Follow up with Lab BD prospects",
    description:
      "10 practices were pitched last week for the in-house lab service. Call each to handle objections and move to proposal stage.",
    steps: [
      "Review previous call notes in CRM",
      "Prepare objection-handling notes",
      "Call each prospect and aim for 'Proposal Sent' stage",
      "Log outcomes and set next follow-up date",
    ],
  },
  {
    id: "t10",
    owner: "nikhil",
    dayOffset: 5, // Sat
    priority: "P2",
    business: { name: "Ashford", emoji: "\uD83E\uDDB7" },
    title: "Compile weekly marketing performance report",
    description:
      "Aggregate CPL, bookings, ad spend, and organic traffic metrics for the week across all practices into one deck.",
    steps: [
      "Pull Meta and Google Ads data",
      "Pull GSC impressions and clicks for each practice",
      "Populate the weekly template slide deck",
      "Share in team Slack by 5pm Friday",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PRIORITY_STYLES = {
  P0: { label: "P0 Critical", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  P1: { label: "P1 High",     bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  P2: { label: "P2 Normal",   bg: "bg-blue-100",  text: "text-blue-700",  dot: "bg-blue-500" },
  P3: { label: "P3 Low",      bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Returns the Monday (week start) for a given date */
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format date as "28 Apr" */
function fmtShort(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Add days to a date */
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Build a dateKey "YYYY-MM-DD" */
function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Map seed tasks (which use dayOffset from Mon) to real dateKeys relative to today */
function buildTasksMap(weekOffset) {
  const monday = getMondayOf(new Date());
  // shift monday by weekOffset weeks
  const refMonday = addDays(monday, weekOffset * 7);
  return SEED_TASKS.map((t, idx) => {
    const taskDate = addDays(refMonday, t.dayOffset);
    return {
      ...t,
      dateKey: dateKey(taskDate),
      done: false,
      steps: t.steps.map((s, si) => ({ id: `${t.id}-s${si}`, label: s, checked: false })),
      file: null,
    };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.P3;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", s.bg, s.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function BusinessTag({ business }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
      {business.emoji} {business.name}
    </span>
  );
}

function TaskCard({ task, onToggleStep, onToggleDone, onFileUpload }) {
  const fileRef = useRef();

  return (
    <div
      className={cn(
        "bg-white border border-line rounded-xl p-5 space-y-4 transition-all",
        task.done && "opacity-60"
      )}
    >
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <BusinessTag business={task.business} />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-lg font-bold text-ink leading-snug",
          task.done && "line-through text-muted"
        )}
      >
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted bg-soft rounded-lg px-4 py-3 leading-relaxed">
        {task.description}
      </p>

      {/* Steps */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">Steps</p>
        {task.steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onToggleStep(task.id, step.id)}
            disabled={task.done}
            className={cn(
              "w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition",
              step.checked
                ? "bg-emerald-50 border-emerald-200"
                : "bg-white border-line hover:bg-gray-50"
            )}
          >
            {step.checked ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            ) : (
              <Circle size={16} className="text-gray-300 shrink-0" />
            )}
            <span
              className={cn(
                "text-sm leading-snug",
                step.checked ? "line-through text-muted" : "text-ink"
              )}
            >
              {step.label}
            </span>
          </button>
        ))}
      </div>

      {/* File upload */}
      <div>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">
          Completion Proof
        </p>
        {task.file ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-700 font-medium truncate">{task.file}</span>
            <button
              onClick={() => onFileUpload(task.id, null)}
              className="ml-auto text-xs text-muted hover:text-ink"
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-line rounded-lg px-4 py-5 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-emerald-50 transition group"
          >
            <Upload size={20} className="text-muted group-hover:text-primary transition" />
            <p className="text-sm text-muted group-hover:text-ink transition">
              Drop a file or{" "}
              <span className="text-primary font-semibold underline underline-offset-2">
                browse
              </span>
            </p>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onFileUpload(task.id, e.target.files[0].name);
              }}
            />
          </div>
        )}
      </div>

      {/* Mark done / Undo */}
      <div className="flex justify-end pt-1">
        {task.done ? (
          <button
            onClick={() => onToggleDone(task.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm font-semibold text-muted hover:text-ink hover:border-ink transition"
          >
            <RotateCcw size={14} />
            Undo
          </button>
        ) : (
          <button
            onClick={() => onToggleDone(task.id)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-emerald-600 transition shadow-sm"
          >
            <CheckCheck size={16} />
            Mark Done
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ dayName }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <span className="text-5xl">&#x2615;</span>
      <p className="text-xl font-bold text-ink">Nothing scheduled</p>
      <p className="text-sm text-muted">No tasks for {dayName}. Enjoy the breathing room.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SimpleTasksPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [selectedPerson, setSelectedPerson] = useState(USERS_DEFAULT[0].u);
  const [tasks, setTasks] = useState(() => buildTasksMap(0));

  // When week changes rebuild tasks (seed offsets stay relative to "this week"s Monday)
  // Tasks are fixed at week-0 offsets; for other weeks they just won't appear.
  // This is intentional — seed data lives in the current week.

  const monday = getMondayOf(today);
  const refMonday = addDays(monday, weekOffset * 7);

  const weekDays = DAY_NAMES.map((name, i) => {
    const date = addDays(refMonday, i);
    const key = dateKey(date);
    const count = tasks.filter(
      (t) => t.dateKey === key && t.owner === selectedPerson
    ).length;
    return { name, date, key, count };
  });

  const weekStart = fmtShort(refMonday);
  const weekEnd = fmtShort(addDays(refMonday, 6));
  const isThisWeek = weekOffset === 0;

  const selectedDayTasks = tasks.filter(
    (t) => t.dateKey === selectedDate && t.owner === selectedPerson
  );

  const selectedDayName = DAY_NAMES[weekDays.findIndex((d) => d.key === selectedDate)] ?? "Day";
  const selectedPersonObj = USERS_DEFAULT.find((u) => u.u === selectedPerson);

  // ---- Handlers ----
  function toggleStep(taskId, stepId) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, steps: t.steps.map((s) => (s.id === stepId ? { ...s, checked: !s.checked } : s)) }
          : t
      )
    );
  }

  function toggleDone(taskId) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  }

  function setFile(taskId, filename) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, file: filename } : t))
    );
  }

  function goToToday() {
    setWeekOffset(0);
    setSelectedDate(dateKey(today));
  }

  return (
    <>
      <Topbar title="Simple Tasks" />

      <main className="px-4 py-6 max-w-[760px] mx-auto w-full space-y-5">

        {/* Person Picker */}
        <div className="bg-white border border-line rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">
              I am:
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm font-semibold text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {USERS_DEFAULT.map((u) => (
                <option key={u.u} value={u.u}>
                  {u.name} — {u.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Help box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">How this works</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Select your name above, then pick a day from the calendar strip. Your tasks for
            that day appear below. Tick off each step as you complete it, upload proof if
            needed, and hit <strong>Mark Done</strong> when the task is finished.
          </p>
        </div>

        {/* Week Calendar Strip */}
        <div className="bg-white border border-line rounded-xl px-5 py-4 space-y-3">
          {/* Strip header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                {isThisWeek ? "This week" : weekOffset < 0 ? "Last week" : "Next week"}
              </p>
              <p className="text-xs text-muted">
                {weekStart} – {weekEnd}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-muted hover:text-ink hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 h-8 flex items-center text-xs font-semibold text-ink border border-line rounded-lg hover:bg-gray-50 transition"
              >
                Today
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-muted hover:text-ink hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day buttons */}
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((day) => {
              const isToday = dateKey(today) === day.key;
              const isSelected = selectedDate === day.key;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDate(day.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 rounded-xl border transition",
                    isSelected
                      ? "bg-primary border-primary text-white shadow-sm"
                      : isToday
                      ? "border-primary bg-emerald-50 text-ink"
                      : "border-line bg-white text-ink hover:bg-gray-50"
                  )}
                >
                  <span className={cn("text-[10px] font-semibold uppercase", isSelected ? "text-white/80" : "text-muted")}>
                    {day.name}
                  </span>
                  <span className="text-base font-bold leading-none">
                    {day.date.getDate()}
                  </span>
                  {day.count > 0 ? (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {day.count}
                    </span>
                  ) : (
                    <span className="h-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Banner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-muted" />
            <span className="text-base font-bold text-ink">{selectedDayName}</span>
            {selectedDayTasks.length > 0 && (
              <span className="text-sm text-muted">
                &bull; {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-ink">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedPersonObj?.color ?? "#10b981" }}
            />
            {selectedPersonObj?.name ?? selectedPerson}
          </div>
        </div>

        {/* Task cards / empty state */}
        {selectedDayTasks.length === 0 ? (
          <EmptyState dayName={selectedDayName} />
        ) : (
          <div className="space-y-4">
            {selectedDayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStep={toggleStep}
                onToggleDone={toggleDone}
                onFileUpload={setFile}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
