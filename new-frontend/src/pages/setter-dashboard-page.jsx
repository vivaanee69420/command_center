import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { BUSINESSES, USERS_DEFAULT } from "@/lib/data";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Calendar,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const LEADS_QUEUE = [
  { id: 1, name: "Sarah Mitchell", phone: "07712 345678", practice: "Ashford", source: "Meta Ads", bestTime: "10:00–12:00", priority: "high", status: "Not Called", notes: "" },
  { id: 2, name: "James Okafor", phone: "07823 456789", practice: "Bexleyheath", source: "Google Ads", bestTime: "14:00–16:00", priority: "high", status: "Not Called", notes: "" },
  { id: 3, name: "Priya Sharma", phone: "07934 567890", practice: "Barnet", source: "GHL Form", bestTime: "09:00–11:00", priority: "medium", status: "Not Called", notes: "" },
  { id: 4, name: "Thomas Green", phone: "07645 678901", practice: "Rochester", source: "Referral", bestTime: "12:00–14:00", priority: "medium", status: "Not Called", notes: "" },
  { id: 5, name: "Amina Hassan", phone: "07756 789012", practice: "Warwick Lodge", source: "Meta Ads", bestTime: "16:00–18:00", priority: "high", status: "Not Called", notes: "" },
  { id: 6, name: "David Lowe", phone: "07867 890123", practice: "Rye Dental", source: "SEO Organic", bestTime: "11:00–13:00", priority: "low", status: "Not Called", notes: "" },
  { id: 7, name: "Kezia Adeyemi", phone: "07978 901234", practice: "Ashford", source: "Google Ads", bestTime: "09:30–11:30", priority: "high", status: "Not Called", notes: "" },
  { id: 8, name: "Liam Patel", phone: "07589 012345", practice: "Barnet", source: "Meta Ads", bestTime: "13:00–15:00", priority: "medium", status: "Not Called", notes: "" },
  { id: 9, name: "Yasmine Benali", phone: "07690 123456", practice: "Bexleyheath", source: "GHL Form", bestTime: "10:30–12:30", priority: "medium", status: "Not Called", notes: "" },
  { id: 10, name: "Owen Clarke", phone: "07401 234567", practice: "Rochester", source: "Referral", bestTime: "15:00–17:00", priority: "low", status: "Not Called", notes: "" },
];

const STATUS_FLOW = ["Not Called", "Called", "Connected", "Appointment Set", "Follow Up", "Not Interested"];

const CALL_LOG = [
  { id: 1, date: "28 Apr 2026", time: "09:02", name: "Sarah Mitchell", duration: "4m 32s", outcome: "Appointment Set", notes: "Booked for 5 May at Ashford, Invisalign consult", setter: "Sona" },
  { id: 2, date: "28 Apr 2026", time: "09:18", name: "Marcus Reid", duration: "1m 12s", outcome: "No Answer", notes: "Left voicemail", setter: "Veena" },
  { id: 3, date: "28 Apr 2026", time: "09:45", name: "Fatou Diallo", duration: "6m 50s", outcome: "Follow Up", notes: "Interested but needs to check work schedule", setter: "Sona" },
  { id: 4, date: "28 Apr 2026", time: "10:10", name: "Ryan O'Brien", duration: "2m 05s", outcome: "Not Interested", notes: "Already booked with another clinic", setter: "Veena" },
  { id: 5, date: "28 Apr 2026", time: "10:33", name: "Nkechi Eze", duration: "8m 14s", outcome: "Appointment Set", notes: "Booked Bexleyheath 6 May, composite bonding", setter: "Sona" },
  { id: 6, date: "27 Apr 2026", time: "14:05", name: "Henry Wu", duration: "3m 40s", outcome: "Follow Up", notes: "Needs to talk to partner first", setter: "Sona" },
  { id: 7, date: "27 Apr 2026", time: "14:28", name: "Chloe Barnes", duration: "5m 55s", outcome: "Appointment Set", notes: "Rochester — 7 May Invisalign", setter: "Veena" },
  { id: 8, date: "27 Apr 2026", time: "15:00", name: "Ibrahim Musa", duration: "0m 45s", outcome: "No Answer", notes: "", setter: "Veena" },
  { id: 9, date: "27 Apr 2026", time: "15:22", name: "Jasmine Tran", duration: "7m 30s", outcome: "Appointment Set", notes: "Barnet — full smile makeover consult", setter: "Sona" },
  { id: 10, date: "27 Apr 2026", time: "16:01", name: "Luke Morrison", duration: "2m 18s", outcome: "Not Interested", notes: "Price too high", setter: "Sona" },
  { id: 11, date: "26 Apr 2026", time: "09:15", name: "Amara Osei", duration: "4m 45s", outcome: "Appointment Set", notes: "Ashford 9 May", setter: "Veena" },
  { id: 12, date: "26 Apr 2026", time: "10:05", name: "Zara Ali", duration: "3m 20s", outcome: "Follow Up", notes: "Call back Thursday", setter: "Sona" },
  { id: 13, date: "26 Apr 2026", time: "11:30", name: "Ben Holt", duration: "1m 55s", outcome: "No Answer", notes: "Tried twice", setter: "Veena" },
  { id: 14, date: "26 Apr 2026", time: "13:00", name: "Sadia Islam", duration: "9m 10s", outcome: "Appointment Set", notes: "Warwick Lodge 10 May, teeth whitening + veneers", setter: "Sona" },
  { id: 15, date: "26 Apr 2026", time: "14:45", name: "Carlos Mendes", duration: "5m 02s", outcome: "Connected", notes: "Sent WhatsApp follow-up with brochure", setter: "Veena" },
];

const SCRIPTS = [
  {
    id: "initial",
    title: "Initial Outreach",
    icon: "📞",
    keyPoints: ["Introduce yourself and the practice", "Reference their specific enquiry", "Create urgency around availability"],
    content: `Hi, is that [Name]?

Great — this is [Your Name] calling from GM Dental Group. You recently reached out to us about [treatment/enquiry] and I just wanted to give you a quick call to answer any questions you might have.

We're currently running a limited number of complimentary consultation slots this month, and I'd love to get you in to see one of our specialists.

Do you have two minutes now, or is there a better time for me to call you back?

[If they engage:]
Brilliant. So, just to give you a little background — our practice in [Location] specialises in [treatment]. Most patients see results within [timeframe], and we have payment plans from as little as [£X]/month.

What's brought you to looking into this now?`,
    objections: [
      { q: "I'm just browsing / not sure yet", a: "Totally understand — that's exactly why the consultation is completely free, so there's no pressure or commitment. It's just a chance to get expert advice specific to your situation." },
      { q: "How much does it cost?", a: "It varies based on your individual assessment, but we'll go through all the options and costs at your free consultation. We do have flexible payment plans starting from around £X/month. Does that sound manageable?" },
    ],
  },
  {
    id: "followup",
    title: "Follow-Up Call",
    icon: "🔁",
    keyPoints: ["Reference the previous conversation", "Add new value or urgency", "Handle objections proactively"],
    content: `Hi [Name], it's [Your Name] again from GM Dental Group — we spoke [X days] ago about [treatment].

I just wanted to check in because I know you were thinking it over, and I didn't want you to miss our current availability.

We've actually had a couple of cancellations this week, so I have [date/time] free if you'd like to come in for that complimentary consultation.

Is that something that could work for you?`,
    objections: [
      { q: "I forgot / got busy", a: "No worries at all — life gets hectic! That's actually why I'm calling, just to make it easy for you. I can book you in right now — it literally takes 30 seconds." },
      { q: "I'm still thinking", a: "Of course. What's the main thing holding you back? Sometimes I can help answer questions that make the decision a lot clearer." },
    ],
  },
  {
    id: "confirmation",
    title: "Appointment Confirmation",
    icon: "✅",
    keyPoints: ["Confirm all appointment details clearly", "Set expectations for the visit", "Reduce no-show risk"],
    content: `Hi [Name], this is [Your Name] from GM Dental Group.

I'm calling to confirm your appointment at our [Location] practice on [Day, Date] at [Time] with [Clinician Name].

The appointment is for your [treatment] consultation and will take approximately [30–60] minutes. There's nothing you need to prepare in advance — just bring a form of photo ID.

Do you have any questions before you come in?

[Confirm address and parking details if needed.]

We look forward to seeing you. If anything changes, please give us a call on [number] or reply to your confirmation text.`,
    objections: [
      { q: "I need to reschedule", a: "Not a problem at all — let me check what else we have available. Can I ask what days and times generally work best for you?" },
      { q: "I might be late", a: "That's fine, just let us know. We'll do our best to accommodate you, though if you're more than 15 minutes late we may need to reschedule to respect other patients' time." },
    ],
  },
  {
    id: "noshow",
    title: "No-Show Follow-Up",
    icon: "🚨",
    keyPoints: ["Be warm, not accusatory", "Rebook immediately", "Understand and address barrier"],
    content: `Hi [Name], it's [Your Name] calling from GM Dental Group.

We had you booked in for [Time] today and just wanted to make sure everything is okay — we missed you!

No worries if something came up — these things happen. I'd love to get you rebooked as soon as possible so you don't lose your slot.

I have [Day] at [Time] or [Day] at [Time] available — which works better for you?`,
    objections: [
      { q: "I forgot", a: "Completely understandable! We'll send you a reminder text the day before and on the morning next time. Shall I rebook you now?" },
      { q: "I've changed my mind", a: "I'm sorry to hear that — can I ask what changed? Sometimes I can address concerns or find a different option that might be a better fit." },
    ],
  },
  {
    id: "objection",
    title: "Objection Handling",
    icon: "🛡️",
    keyPoints: ["Listen fully before responding", "Empathise, don't argue", "Redirect to value"],
    content: `General objection handling framework:

1. LISTEN — let them finish completely, don't interrupt.
2. ACKNOWLEDGE — "That's a completely fair point / I totally understand."
3. CLARIFY — "Can I ask what's behind that concern?"
4. RESPOND — provide specific, honest value-based answer.
5. REDIRECT — "Given that, does [solution/offer] make sense as a next step?"`,
    objections: [
      { q: "It's too expensive", a: "I hear you — it's a real investment. Most of our patients actually find the payment plans make it very manageable. Would it help if I showed you the monthly breakdown? For most treatments it works out to less than £X/week." },
      { q: "I need to think about it", a: "Of course. What specifically is on your mind? I'd rather address it now than have you sit with unanswered questions. Is it the cost, the timing, or something else?" },
      { q: "I'll look around first", a: "Totally fair — it's a big decision. I'd just say our free consultation costs you nothing and gives you an expert benchmark to compare against. It actually makes shopping around easier." },
      { q: "I'm scared of the dentist", a: "You're definitely not alone in that — a lot of our patients come in feeling exactly the same way. Our clinicians are very experienced with anxious patients, and we can walk through everything before anything happens. Would it help to have a quick chat with the clinician before booking?" },
    ],
  },
];

const PERFORMANCE_DATA = [
  { name: "Sona", role: "SDR", callsMade: 48, connected: 31, appsSet: 14, shown: 11, conversion: "29.2%" },
  { name: "Veena", role: "SDR", callsMade: 42, connected: 27, appsSet: 11, shown: 9, conversion: "26.2%" },
];

const OUTCOME_COLORS = {
  "Appointment Set": "text-green-600 font-semibold",
  "Follow Up": "text-amber-600",
  "Not Interested": "text-red-500",
  "No Answer": "text-muted",
  Connected: "text-blue-600",
};

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const STATUS_COLORS = {
  "Not Called": "bg-bg-shell text-muted",
  Called: "bg-blue-100 text-blue-700",
  Connected: "bg-indigo-100 text-indigo-700",
  "Appointment Set": "bg-green-100 text-green-700",
  "Follow Up": "bg-amber-100 text-amber-700",
  "Not Interested": "bg-red-100 text-red-700",
};

const TABS = ["Today's Queue", "Call Log", "Scripts", "Performance"];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5" style={{ borderLeftWidth: 4, borderLeftColor: color || "#7c3aed" }}>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-bold text-ink mb-0.5">{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

function QueueTab({ leads, setLeads, filterPractice }) {
  const filtered = filterPractice === "All"
    ? leads
    : leads.filter((l) => l.practice === filterPractice);

  function cycleStatus(id) {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = STATUS_FLOW.indexOf(l.status);
        const next = STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
        return { ...l, status: next };
      })
    );
  }

  function updateNote(id, val) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: val } : l)));
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((lead) => (
        <div
          key={lead.id}
          className="bg-white border border-line rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-3"
        >
          {/* Priority indicator */}
          <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", PRIORITY_COLORS[lead.priority])}>
              {lead.priority.toUpperCase()}
            </span>
          </div>

          {/* Lead info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
              <span className="text-sm font-bold text-ink">{lead.name}</span>
              <span className="text-xs text-muted">{lead.practice}</span>
              <span className="text-[11px] bg-bg-soft border border-line rounded px-1.5 py-0.5 text-muted">{lead.source}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted mb-2">
              <Clock size={11} />
              Best time: {lead.bestTime}
            </div>
            <input
              type="text"
              placeholder="Add notes…"
              value={lead.notes}
              onChange={(e) => updateNote(lead.id, e.target.value)}
              className="w-full border border-line rounded-lg px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary transition bg-bg-soft"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <a
              href={`tel:${lead.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-[#6d28d9] transition"
            >
              <PhoneCall size={13} />
              {lead.phone}
            </a>
            <button
              onClick={() => cycleStatus(lead.id)}
              className={cn(
                "text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition",
                STATUS_COLORS[lead.status]
              )}
            >
              {lead.status}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CallLogTab({ filterPractice }) {
  const filtered = filterPractice === "All"
    ? CALL_LOG
    : CALL_LOG.filter((c) => {
        const lead = LEADS_QUEUE.find((l) => l.name === c.name);
        return lead ? lead.practice === filterPractice : true;
      });

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line bg-bg-soft">
            {["Date", "Time", "Lead Name", "Duration", "Outcome", "Setter", "Notes"].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold text-muted uppercase tracking-wide px-4 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={row.id} className={cn("border-b border-line last:border-0", i % 2 === 0 ? "" : "bg-bg-soft/50")}>
              <td className="px-4 py-2.5 text-muted">{row.date}</td>
              <td className="px-4 py-2.5 text-muted">{row.time}</td>
              <td className="px-4 py-2.5 font-semibold text-ink">{row.name}</td>
              <td className="px-4 py-2.5 text-muted">{row.duration}</td>
              <td className={cn("px-4 py-2.5", OUTCOME_COLORS[row.outcome] || "text-ink")}>
                {row.outcome}
              </td>
              <td className="px-4 py-2.5 text-muted">{row.setter}</td>
              <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{row.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScriptCard({ script }) {
  const [open, setOpen] = useState(false);
  const [openObj, setOpenObj] = useState(null);

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-soft transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{script.icon}</span>
          <div>
            <p className="text-sm font-bold text-ink">{script.title}</p>
            <p className="text-[11px] text-muted">{script.keyPoints.join(" · ")}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {open && (
        <div className="border-t border-line px-5 py-4">
          <pre className="whitespace-pre-wrap text-xs text-ink leading-relaxed font-sans mb-5 bg-bg-soft rounded-lg p-4">
            {script.content}
          </pre>
          <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-2">
            Common Objections
          </p>
          <div className="flex flex-col gap-2">
            {script.objections.map((obj, i) => (
              <div key={i} className="border border-line rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenObj(openObj === i ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left bg-bg-soft hover:bg-bg-shell transition"
                >
                  <span className="text-xs font-semibold text-ink">"{obj.q}"</span>
                  {openObj === i ? <ChevronUp size={13} className="text-muted" /> : <ChevronDown size={13} className="text-muted" />}
                </button>
                {openObj === i && (
                  <div className="px-3 py-2 text-xs text-muted leading-relaxed border-t border-line">
                    {obj.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <p className="text-sm font-bold text-ink">Setter Performance — Apr 2026</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-line bg-bg-soft">
              {["Setter", "Role", "Calls Made", "Connected", "Connect Rate", "Appts Set", "Shows", "Show Rate", "Conv. Rate"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-muted uppercase tracking-wide px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERFORMANCE_DATA.map((row, i) => {
              const connectRate = ((row.connected / row.callsMade) * 100).toFixed(1) + "%";
              const showRate = ((row.shown / row.appsSet) * 100).toFixed(1) + "%";
              return (
                <tr key={row.name} className={cn("border-b border-line last:border-0", i % 2 === 0 ? "" : "bg-bg-soft/50")}>
                  <td className="px-4 py-3 font-bold text-ink">{row.name}</td>
                  <td className="px-4 py-3 text-muted">{row.role}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{row.callsMade}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">{row.connected}</td>
                  <td className="px-4 py-3 text-muted">{connectRate}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{row.appsSet}</td>
                  <td className="px-4 py-3 text-ink">{row.shown}</td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">{showRate}</td>
                  <td className="px-4 py-3 font-bold text-primary">{row.conversion}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-setter breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PERFORMANCE_DATA.map((setter) => (
          <div key={setter.name} className="bg-white border border-line rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: USERS_DEFAULT.find((u) => u.name === setter.name)?.color || "#7c3aed" }}
              >
                {setter.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{setter.name}</p>
                <p className="text-[11px] text-muted">{setter.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calls", value: setter.callsMade, color: "#7c3aed" },
                { label: "Connected", value: setter.connected, color: "#3b82f6" },
                { label: "Appts Set", value: setter.appsSet, color: "#10b981" },
                { label: "Shows", value: setter.shown, color: "#f59e0b" },
              ].map((stat) => (
                <div key={stat.label} className="bg-bg-soft rounded-lg p-3 text-center">
                  <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SetterDashboardPage() {
  const [activeTab, setActiveTab] = useState("Today's Queue");
  const [leads, setLeads] = useState(LEADS_QUEUE);
  const [filterPractice, setFilterPractice] = useState("All");

  const callsToday = CALL_LOG.filter((c) => c.date === "28 Apr 2026").length;
  const connectedToday = CALL_LOG.filter((c) => c.date === "28 Apr 2026" && c.outcome !== "No Answer").length;
  const appsSetToday = CALL_LOG.filter((c) => c.date === "28 Apr 2026" && c.outcome === "Appointment Set").length;
  const showRateAll = ((PERFORMANCE_DATA.reduce((s, r) => s + r.shown, 0) / PERFORMANCE_DATA.reduce((s, r) => s + r.appsSet, 0)) * 100).toFixed(0);
  const pipelineValue = appsSetToday * 3200;

  const practiceOptions = ["All", ...BUSINESSES.map((b) => b.name)];

  const KPIS = [
    { label: "Calls Today", value: callsToday, sub: "Target: 50+", color: "#7c3aed" },
    { label: "Connected", value: connectedToday, sub: `${((connectedToday / callsToday) * 100).toFixed(0)}% connect rate`, color: "#3b82f6" },
    { label: "Appointments Set", value: appsSetToday, sub: "Today", color: "#10b981" },
    { label: "Show Rate", value: showRateAll + "%", sub: "Month to date", color: "#f59e0b" },
    { label: "Pipeline Value", value: "£" + pipelineValue.toLocaleString(), sub: "Today's bookings", color: "#7c3aed" },
  ];

  return (
    <>
      <Topbar title="Setter / SDR Dashboard" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📞"
          title="Setter / SDR Dashboard"
          subtitle="Call queue · Scripts · Performance tracking"
        />

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {KPIS.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Filters + Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap",
                  activeTab === tab ? "bg-primary text-white" : "text-muted hover:text-ink"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted" />
            <select
              value={filterPractice}
              onChange={(e) => setFilterPractice(e.target.value)}
              className="border border-line rounded-lg px-2 py-1.5 text-xs text-ink bg-white outline-none focus:border-primary transition"
            >
              {practiceOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "Today's Queue" && (
          <QueueTab leads={leads} setLeads={setLeads} filterPractice={filterPractice} />
        )}

        {activeTab === "Call Log" && (
          <CallLogTab filterPractice={filterPractice} />
        )}

        {activeTab === "Scripts" && (
          <div className="flex flex-col gap-3">
            {SCRIPTS.map((s) => (
              <ScriptCard key={s.id} script={s} />
            ))}
          </div>
        )}

        {activeTab === "Performance" && <PerformanceTab />}
      </main>
    </>
  );
}
