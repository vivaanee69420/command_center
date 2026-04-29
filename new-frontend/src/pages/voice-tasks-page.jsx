import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { BUSINESSES, USERS_DEFAULT } from "@/lib/data";
import { api } from "@/api/client";
import {
  Mic,
  Loader2,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

const EXAMPLE_TRANSCRIPT = `Team standup recap — April 28, 2026

Gaurav: We need to push the Bexleyheath Google Ads CPL down below £40 this week. Nikhil, can you review the keyword negatives and get a revised bidding strategy done by Wednesday?

Nikhil: Sure. I'll also get Fatima to update the landing page copy for Bexleyheath — the current headline is too generic.

Gaurav: Good. Sona, the no-show rate at Warwick Lodge is still at 22%. You need to build a reconfirmation call sequence — two calls and a WhatsApp before the appointment. Get that into GHL by Friday.

Sona: On it. Should I also follow up with the 8 leads from last week who never booked?

Gaurav: Yes — Veena, can you split that lead list with Sona and work through them by end of week? Prioritise Ashford and Rochester leads.

Maryam: Quick note — the GHL pipeline for Rye Dental hasn't been updated in 5 days. I'll clean that up and set automation triggers for stage changes.

Gaurav: Perfect. Ruhith, we need the CommandOS revenue dashboard to pull live data from the API instead of localStorage — target end of next week.`;

const PRIORITIES = ["high", "medium", "low"];
const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

// HISTORY_SEED removed — voice session history requires a backend voice_session table (pending).

function SelectField({ value, onChange, options, className }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "border border-line rounded-lg px-2 py-1.5 text-xs text-ink bg-white outline-none focus:border-primary transition",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function VoiceTasksPage() {
  const [transcript, setTranscript] = useState(EXAMPLE_TRANSCRIPT);
  const [ownerId, setOwnerId] = useState(USERS_DEFAULT[0].u);
  const [loading, setLoading] = useState(false);
  const [splitError, setSplitError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);
  const [approveSuccess, setApproveSuccess] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);

  const ownerOptions = USERS_DEFAULT.map((u) => ({ value: u.u, label: u.name }));
  const businessOptions = BUSINESSES.map((b) => ({ value: b.slug, label: b.name }));
  const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }));

  async function handleSplit() {
    if (!transcript.trim()) return;
    setLoading(true);
    setSplitError(null);
    setApproveSuccess(null);
    setApproveError(null);
    setTasks([]);
    try {
      const result = await api.splitVoice(transcript, ownerId);
      const items = (result.items || result || []).map((item, i) => ({
        ...item,
        _id: i,
        included: true,
        owner: item.owner_id || ownerId,
        business: item.business_id || BUSINESSES[0].slug,
        priority: item.priority || "medium",
        dueDate: item.due_at ? item.due_at.slice(0, 10) : "",
        title: item.title || item.task || "",
      }));
      setTasks(items);
    } catch (err) {
      setSplitError(err.message || "Failed to split transcript. Please try again.");
      // Fallback: generate demo tasks so the UI is useful even without backend
      setTasks([
        { _id: 0, included: true, title: "Review keyword negatives and revise Bexleyheath bidding strategy", owner: "nikhil", business: "bexleyheath", priority: "high", dueDate: "2026-04-30" },
        { _id: 1, included: true, title: "Update Bexleyheath landing page headline copy", owner: "fatima", business: "bexleyheath", priority: "medium", dueDate: "2026-04-30" },
        { _id: 2, included: true, title: "Build Warwick Lodge reconfirmation call + WhatsApp sequence in GHL", owner: "sona", business: "warwick-lodge", priority: "high", dueDate: "2026-05-02" },
        { _id: 3, included: true, title: "Follow up with 8 unbooked Ashford + Rochester leads from last week", owner: "veena", business: "ashford", priority: "high", dueDate: "2026-05-02" },
        { _id: 4, included: true, title: "Clean Rye Dental GHL pipeline and set stage-change automation triggers", owner: "maryam", business: "rye-dental", priority: "medium", dueDate: "2026-04-30" },
        { _id: 5, included: true, title: "Switch CommandOS revenue dashboard to live API data", owner: "ruhith", business: "accounts", priority: "medium", dueDate: "2026-05-07" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function updateTask(id, field, value) {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, [field]: value } : t))
    );
  }

  function toggleInclude(id) {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, included: !t.included } : t))
    );
  }

  async function handleApprove() {
    const selected = tasks.filter((t) => t.included);
    if (!selected.length) return;
    setApproving(true);
    setApproveError(null);
    setApproveSuccess(null);
    try {
      await api.approveVoice(transcript, selected);
      const count = selected.length;
      setApproveSuccess(`${count} task${count !== 1 ? "s" : ""} created successfully.`);
      const newEntry = {
        id: `h${Date.now()}`,
        timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " ·"),
        preview: transcript.slice(0, 90) + (transcript.length > 90 ? "…" : ""),
        taskCount: count,
        status: "approved",
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 10));
      setTasks([]);
      setTranscript("");
    } catch (err) {
      setApproveError(err.message || "Failed to create tasks.");
    } finally {
      setApproving(false);
    }
  }

  const includedCount = tasks.filter((t) => t.included).length;

  return (
    <>
      <Topbar title="Voice-to-Task AI" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎙️"
          title="Voice-to-Task AI"
          subtitle="Paste a meeting transcript and AI splits it into owned, deadline-bound tasks"
        />

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-5 mb-8">
          {/* LEFT: Transcript input */}
          <div className="bg-white border border-line rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Meeting Transcript</h2>
              <span className="text-[11px] text-muted">{transcript.length} chars</span>
            </div>

            <textarea
              className="w-full flex-1 min-h-[340px] border border-line rounded-lg px-3 py-2.5 text-xs text-ink leading-relaxed outline-none focus:border-primary transition resize-y font-mono"
              placeholder="Paste your meeting transcript here…"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                  Default Owner
                </label>
                <SelectField
                  value={ownerId}
                  onChange={setOwnerId}
                  options={ownerOptions}
                  className="min-w-[160px]"
                />
              </div>

              <button
                onClick={handleSplit}
                disabled={loading || !transcript.trim()}
                className={cn(
                  "ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition",
                  loading || !transcript.trim()
                    ? "bg-bg-shell text-muted cursor-not-allowed"
                    : "bg-primary text-white hover:bg-[#6d28d9]"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Mic size={14} />
                    Split into Tasks
                  </>
                )}
              </button>
            </div>

            {splitError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <AlertCircle size={14} className="text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-danger">API Error — showing demo tasks</p>
                  <p className="text-[11px] text-danger/80 mt-0.5">{splitError}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Generated tasks */}
          <div className="bg-white border border-line rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-ink">Generated Tasks</h2>
              {tasks.length > 0 && (
                <span className="text-[11px] text-muted">
                  {includedCount} / {tasks.length} selected
                </span>
              )}
            </div>

            {tasks.length === 0 && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-bg-soft border border-line flex items-center justify-center mb-3">
                  <Mic size={24} className="text-muted" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-ink mb-1">No tasks yet</p>
                <p className="text-xs text-muted max-w-[200px]">
                  Paste a transcript and click "Split into Tasks"
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <Loader2 size={28} className="text-primary animate-spin mb-3" />
                <p className="text-xs text-muted">AI is reading your transcript…</p>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px] pr-1">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={cn(
                      "border rounded-lg p-3 transition",
                      task.included
                        ? "border-primary/30 bg-purple-50/40"
                        : "border-line bg-bg-soft opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <button
                        onClick={() => toggleInclude(task._id)}
                        className="mt-0.5 shrink-0 text-primary"
                      >
                        {task.included ? (
                          <CheckSquare size={15} />
                        ) : (
                          <Square size={15} className="text-muted" />
                        )}
                      </button>
                      <input
                        className="flex-1 text-xs font-semibold text-ink bg-transparent border-0 outline-none resize-none leading-snug"
                        value={task.title}
                        onChange={(e) => updateTask(task._id, "title", e.target.value)}
                      />
                      <button
                        onClick={() => setTasks((prev) => prev.filter((t) => t._id !== task._id))}
                        className="text-muted hover:text-danger shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      <SelectField
                        value={task.owner}
                        onChange={(v) => updateTask(task._id, "owner", v)}
                        options={ownerOptions}
                        className="text-[11px]"
                      />
                      <SelectField
                        value={task.priority}
                        onChange={(v) => updateTask(task._id, "priority", v)}
                        options={priorityOptions}
                        className="text-[11px]"
                      />
                      <SelectField
                        value={task.business}
                        onChange={(v) => updateTask(task._id, "business", v)}
                        options={businessOptions}
                        className="text-[11px]"
                      />
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTask(task._id, "dueDate", e.target.value)}
                        className="border border-line rounded-lg px-2 py-1.5 text-[11px] text-ink bg-white outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tasks.length > 0 && (
              <div className="mt-auto pt-3 border-t border-line flex flex-col gap-2">
                {approveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <AlertCircle size={13} className="text-danger" />
                    <span className="text-xs text-danger">{approveError}</span>
                  </div>
                )}
                {approveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                    <CheckCircle2 size={13} className="text-green-600" />
                    <span className="text-xs text-green-700 font-semibold">{approveSuccess}</span>
                  </div>
                )}
                <button
                  onClick={handleApprove}
                  disabled={approving || includedCount === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition",
                    approving || includedCount === 0
                      ? "bg-bg-shell text-muted cursor-not-allowed"
                      : "bg-primary text-white hover:bg-[#6d28d9]"
                  )}
                >
                  {approving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Creating tasks…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      Approve &amp; Create {includedCount} Task{includedCount !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History section */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h2 className="text-sm font-bold text-ink mb-4">Recent Voice Sessions</h2>
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Voice Session History</p>
              <p className="text-xs text-amber-600 leading-relaxed">Session history requires a <code className="font-mono bg-amber-100 px-1 rounded">voice_session</code> table in the database. Add the model, migration, and endpoint to persist and retrieve past voice sessions.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
