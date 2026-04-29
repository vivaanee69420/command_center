import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/api/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, Mic, Plus, Upload, UserPlus, Calendar,
  Megaphone, Loader2, Square, Send,
} from "lucide-react";

/* ── helpers ── */

const ACTIVITY_COLORS = {
  created: "#10b981", status_change: "#7c3aed", assigned: "#3b82f6",
  comment: "#f59e0b", completed: "#10b981", default: "#6b7280",
};

function activityIcon(kind) {
  switch (kind) {
    case "created": return "+";
    case "status_change": return "S";
    case "assigned": return "A";
    case "comment": return "C";
    case "completed": return "✓";
    default: return kind?.[0]?.toUpperCase() || "?";
  }
}

function activityText(item) {
  const actor = item.actor_name;
  const task = item.task_title;
  switch (item.kind) {
    case "created": return `${actor} created "${task}"`;
    case "status_change": return `"${task}" status changed by ${actor}`;
    case "assigned": return `"${task}" assigned to ${actor}`;
    case "comment": return `${actor} commented on "${task}"`;
    case "completed": return `${actor} completed "${task}"`;
    default: return `${actor}: ${item.kind} on "${task}"`;
  }
}

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function autoCode(name) {
  return name.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Voice Assistant Hook (with text fallback) ── */
function useVoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!supported) {
      setVoiceError("Speech recognition not supported. Use text input below.");
      return;
    }
    setVoiceError(null);
    setResult(null);
    setTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      if (event.error === "network") {
        setVoiceError("Voice unavailable (network). Type your command below instead.");
      } else {
        setVoiceError(`Voice error: ${event.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [supported]);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    const finalTranscript = transcript.trim();
    if (!finalTranscript) return;
    setProcessing(true);
    try {
      const res = await api.splitVoice(finalTranscript);
      setResult(res);
    } catch (err) {
      setVoiceError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [transcript]);

  const submitText = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setVoiceError(null);
    setResult(null);
    setProcessing(true);
    try {
      const res = await api.splitVoice(text);
      setResult(res);
      setTextInput("");
    } catch (err) {
      setVoiceError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [textInput]);

  return {
    listening, transcript, processing, result, voiceError, supported,
    startListening, stopListening, textInput, setTextInput, submitText,
  };
}

/* ── Modal Forms ── */

function CreateTaskModal({ open, onClose, team, businesses, navigate }) {
  const [form, setForm] = useState({ title: "", owner_id: "", due_at: "", priority: "P2", business_id: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title || !form.owner_id || !form.due_at) {
      setErr("Title, owner and due date are required");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await api.createTask({
        title: form.title,
        owner_id: form.owner_id,
        due_at: new Date(form.due_at).toISOString(),
        priority: form.priority,
        business_id: form.business_id || undefined,
        source: "manual",
      });
      onClose();
      navigate("/simple-tasks");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Task title *" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <select className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white" value={form.owner_id} onChange={(e) => set("owner_id", e.target.value)}>
            <option value="">Select owner *</option>
            {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <Input type="datetime-local" value={form.due_at} onChange={(e) => set("due_at", e.target.value)} />
          <select className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Normal</option>
            <option value="P4">P4 - Low</option>
          </select>
          <select className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white" value={form.business_id} onChange={(e) => set("business_id", e.target.value)}>
            <option value="">Business (optional)</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddLeadModal({ open, onClose, businesses, navigate }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", business_id: "", stage: "lead" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.business_id) { setErr("Business is required"); return; }
    setSaving(true);
    setErr(null);
    try {
      await api.createLead({
        business_id: form.business_id,
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        stage: form.stage,
      });
      onClose();
      navigate("/leads");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Lead name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <select className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white" value={form.business_id} onChange={(e) => set("business_id", e.target.value)}>
            <option value="">Select business *</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white" value={form.stage} onChange={(e) => set("stage", e.target.value)}>
            <option value="lead">Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : "Add Lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleMeetingModal({ open, onClose, navigate }) {
  const [form, setForm] = useState({ title: "", date: "", time: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!form.title || !form.date || !form.time) { setErr("All fields required"); return; }
    setSaving(true);
    setErr(null);
    try {
      // Meetings stored as tasks with source "meeting"
      const me = await api.me();
      await api.createTask({
        title: `Meeting: ${form.title}`,
        owner_id: me.id,
        due_at: new Date(`${form.date}T${form.time}`).toISOString(),
        priority: "P2",
        source: "meeting",
      });
      onClose();
      navigate("/daily-routines");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Meeting title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : "Schedule"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SendAnnouncementModal({ open, onClose, team, navigate }) {
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!form.title) { setErr("Title required"); return; }
    setSaving(true);
    setErr(null);
    try {
      // Create announcement as a task assigned to current user
      const me = await api.me();
      await api.createTask({
        title: `Announcement: ${form.title}`,
        owner_id: me.id,
        due_at: new Date().toISOString(),
        priority: "P1",
        source: "announcement",
        body_md: form.body || undefined,
      });
      onClose();
      navigate("/notifications");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Send Announcement</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Announcement title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <textarea
            placeholder="Message body (optional)"
            className="w-full border border-line rounded-md px-3 py-2 text-sm bg-white min-h-[80px] resize-none"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : "Send"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UploadReportModal({ open, onClose, navigate }) {
  const [err, setErr] = useState(null);

  // No file upload endpoint yet - navigate to documents page
  function submit() {
    onClose();
    navigate("/documents");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload Report / File</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted">File upload will be available on the Documents page. Click below to go there.</p>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={submit}>Go to Documents</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Quick Action config ── */
const QUICK_ACTIONS = [
  { icon: Plus, label: "Create New Task", modal: "task" },
  { icon: Upload, label: "Upload Report / File", modal: "upload" },
  { icon: UserPlus, label: "Add New Lead", modal: "lead" },
  { icon: Calendar, label: "Schedule Meeting", modal: "meeting" },
  { icon: Megaphone, label: "Send Announcement", modal: "announcement" },
];

/* ── Main Component ── */
export default function RightSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [businesses, setBusinesses] = useState([]);

  const voice = useVoiceAssistant();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [sidebar, biz] = await Promise.all([
          api.dashboardSidebar(),
          api.businesses(),
        ]);
        if (!cancelled) {
          setData(sidebar);
          setBusinesses(biz);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.message?.includes("401")) { logout(); return; }
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [logout]);

  const recentActivity = data?.recentActivity || [];
  const automations = data?.automations || [];
  const team = data?.team || [];
  const activeAutomations = automations.filter((a) => a.enabled);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="w-[280px] shrink-0 space-y-5">
      {/* AI Voice Assistant */}
      <div className="bg-white border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Mic size={14} className="text-primary" />
            AI Voice Assistant
          </h3>
          {voice.supported ? (
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${voice.listening ? "text-red-500" : "text-primary"}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${voice.listening ? "bg-red-500" : "bg-primary"}`} />
              {voice.listening ? "Recording" : "Ready"}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Text Mode</span>
          )}
        </div>
        <div className="flex flex-col items-center py-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              {voice.listening ? (
                <button
                  onClick={voice.stopListening}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 transition bg-red-500"
                  title="Stop recording"
                >
                  <Square size={14} />
                </button>
              ) : voice.processing ? (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : (
                <button
                  onClick={voice.startListening}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                  title="Click to speak"
                >
                  <Mic size={16} />
                </button>
              )}
            </div>
          </div>

          {voice.listening && voice.transcript && (
            <p className="text-xs text-ink mt-3 text-center px-2 italic">"{voice.transcript}"</p>
          )}
          {voice.processing && (
            <p className="text-xs text-muted mt-3">Processing command...</p>
          )}
          {voice.result && (
            <div className="mt-3 w-full">
              <p className="text-[10px] font-bold text-primary mb-1">
                {voice.result.items?.length || 0} task(s) detected
              </p>
              {voice.result.items?.slice(0, 3).map((item, i) => (
                <p key={i} className="text-[10px] text-ink truncate">• {item.title}</p>
              ))}
              <button
                onClick={() => navigate("/voice-tasks")}
                className="text-[10px] font-bold text-primary mt-1 hover:underline"
              >
                Review & approve →
              </button>
            </div>
          )}
          {voice.voiceError && (
            <p className="text-[10px] text-red-500 mt-2 text-center">{voice.voiceError}</p>
          )}

          {/* Text input fallback - always visible */}
          {!voice.listening && !voice.processing && (
            <div className="mt-3 w-full flex gap-1.5">
              <Input
                placeholder="Type a command..."
                className="text-xs h-8"
                value={voice.textInput}
                onChange={(e) => voice.setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && voice.submitText()}
              />
              <Button
                size="sm"
                className="h-8 px-2 shrink-0"
                onClick={voice.submitText}
                disabled={!voice.textInput.trim()}
              >
                <Send size={12} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <span className="text-base">⚡</span>
          Quick Actions
        </h3>
        <div className="space-y-1">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setActiveModal(action.modal)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium text-ink hover:bg-bg-soft transition"
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={13} className="text-muted" />
                  {action.label}
                </span>
                <ChevronRight size={12} className="text-muted" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Automation Status */}
      <div className="bg-white border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="text-base">⚙️</span>
            Automation Status
          </h3>
          {loading ? (
            <Loader2 size={12} className="animate-spin text-muted" />
          ) : (
            <button
              onClick={() => navigate("/marketing/ghl-automation")}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              {activeAutomations.length} active →
            </button>
          )}
        </div>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-7 h-7 rounded-md bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : automations.length === 0 ? (
            <p className="text-xs text-muted">No automations configured</p>
          ) : (
            automations.map((auto) => (
              <div
                key={auto.id}
                onClick={() => navigate("/marketing/ghl-automation")}
                className="flex items-center gap-3 cursor-pointer hover:bg-bg-soft rounded-lg p-1 -mx-1 transition"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-primary shrink-0 bg-primary-soft">
                  {autoCode(auto.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{auto.name}</p>
                  <p className="text-[10px] text-muted">
                    {auto.trigger_kind} → {auto.action_kind}
                  </p>
                </div>
                <span className={`text-[10px] font-bold ${auto.enabled ? "text-primary" : "text-muted"}`}>
                  {auto.enabled ? "Active" : "Off"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <span className="text-base">📋</span>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : recentActivity.length === 0 ? (
            <p className="text-xs text-muted">No recent activity</p>
          ) : (
            recentActivity.map((item, i) => (
              <div
                key={i}
                onClick={() => navigate("/simple-tasks")}
                className="flex items-start gap-3 cursor-pointer hover:bg-bg-soft rounded-lg p-1 -mx-1 transition"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                  style={{ background: ACTIVITY_COLORS[item.kind] || ACTIVITY_COLORS.default }}
                >
                  {activityIcon(item.kind)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink leading-snug">
                    {activityText(item)}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{timeAgo(item.at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Avatars */}
      <div className="flex items-center gap-1 px-1">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
          ))
        ) : team.length === 0 ? (
          <p className="text-[10px] text-muted">No team members</p>
        ) : (
          team.slice(0, 8).map((u) => {
            const hue = u.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
            return (
              <div
                key={u.id}
                onClick={() => navigate("/team-hub")}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 cursor-pointer hover:opacity-80 transition"
                style={{ background: `hsl(${hue}, 55%, 50%)` }}
                title={`${u.name} (${u.role})`}
              >
                {getInitials(u.name)}
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 px-1">Sidebar: {error}</p>
      )}

      {/* Modals */}
      <CreateTaskModal open={activeModal === "task"} onClose={closeModal} team={team} businesses={businesses} navigate={navigate} />
      <AddLeadModal open={activeModal === "lead"} onClose={closeModal} businesses={businesses} navigate={navigate} />
      <ScheduleMeetingModal open={activeModal === "meeting"} onClose={closeModal} navigate={navigate} />
      <SendAnnouncementModal open={activeModal === "announcement"} onClose={closeModal} team={team} navigate={navigate} />
      <UploadReportModal open={activeModal === "upload"} onClose={closeModal} navigate={navigate} />
    </div>
  );
}
