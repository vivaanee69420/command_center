import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import RightSidebar from "@/components/shared/right-sidebar";
import { api } from "@/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Users,
  Loader2,
  Filter,
  Sparkles,
} from "lucide-react";

// Format time string "07:00:00" -> "07:00"
function fmtTime(t) {
  if (!t) return "";
  return t.slice(0, 5);
}

// Today as YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// --- Add Routine Template Modal ---
function AddTemplateModal({ open, onClose, roles, onSave }) {
  const [form, setForm] = useState({ role: "", time_local: "09:00", title: "", detail: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm({ role: "", time_local: "09:00", title: "", detail: "" });
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role || !form.title.trim()) return;
    setSaving(true);
    try {
      await api.createRoutineTemplate({
        role: form.role,
        time_local: form.time_local + ":00",
        title: form.title.trim(),
        detail: form.detail.trim() || null,
        week_phase: null,
      });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader><DialogTitle>New Routine</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted">Title *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="e.g. Morning Lead Check" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Role *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.role} onChange={(e) => set("role", e.target.value)} required>
                <option value="">Select</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Time</label>
              <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.time_local} onChange={(e) => set("time_local", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Steps / Detail</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-24" placeholder="Step-by-step checklist (one per line)" value={form.detail} onChange={(e) => set("detail", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Routine"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Routine Card ---
function RoutineCard({ template, isCompleted, logNotes, onToggle, onDelete, canDelete }) {
  const steps = template.detail ? template.detail.split(/\.\s*/).filter(Boolean) : [];

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all ${isCompleted ? "border-green-300 bg-green-50/30" : "border-line"}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-ink">{template.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtTime(template.time_local)}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {template.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-colors ${isCompleted ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}
          >
            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>
          {canDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {steps.length > 0 && (
        <div className="mt-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-line/50 last:border-0">
              <div className="w-5 h-5 rounded-full bg-bg-soft flex items-center justify-center text-[10px] font-bold text-muted shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className={`text-sm leading-snug ${isCompleted ? "text-muted line-through" : "text-ink"}`}>{step.trim()}</p>
            </div>
          ))}
        </div>
      )}

      {isCompleted && logNotes && (
        <p className="text-xs text-green-700 mt-2 bg-green-50 rounded px-2 py-1">Note: {logNotes}</p>
      )}
    </div>
  );
}

export default function DailyRoutinesPage() {
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [roleFilter, setRoleFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRole, setAiRole] = useState("");

  const load = async () => {
    try {
      const [tmpl, lg] = await Promise.all([
        api.routineTemplates(),
        api.routineLogs(selectedDate),
      ]);
      setTemplates(tmpl);
      setLogs(lg);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedDate]);

  // Completion map: template_id -> log entry
  const completionMap = useMemo(() => {
    const m = {};
    logs.forEach((l) => { if (l.completed_at) m[l.template_id] = l; });
    return m;
  }, [logs]);

  // All unique roles from templates
  const roles = useMemo(() => [...new Set(templates.map((t) => t.role))].sort(), [templates]);

  // Filtered templates
  const filtered = useMemo(() => {
    let list = templates;
    if (roleFilter !== "all") list = list.filter((t) => t.role === roleFilter);
    return list;
  }, [templates, roleFilter]);

  // Group by role
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((t) => {
      if (!g[t.role]) g[t.role] = [];
      g[t.role].push(t);
    });
    return g;
  }, [filtered]);

  // Stats
  const totalCount = filtered.length;
  const doneCount = filtered.filter((t) => completionMap[t.id]).length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleToggle = async (templateId) => {
    setToggling(templateId);
    try {
      await api.logRoutine({ template_id: templateId, date: selectedDate, notes: null });
      await load();
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm("Delete this routine template?")) return;
    try {
      await api.deleteRoutineTemplate(templateId);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const ALL_ROLES = ["CEO", "COO", "Marketing Lead", "Practice Ops", "SDR", "Lab BD", "SEO Specialist", "Social Specialist", "General Outsourcer", "Digital + Elevate", "Developer"];

  const handleAiGenerate = async () => {
    if (!aiRole) { alert("Select a role first"); return; }
    const existingForRole = templates.filter((t) => t.role === aiRole).map((t) => t.title);
    const existingLine = existingForRole.length
      ? `Existing routines for this role (do NOT duplicate): ${existingForRole.join(", ")}.`
      : "";

    setAiLoading(true);
    try {
      const question = `Generate daily/weekly routine checklist items for a "${aiRole}" at GM Dental Group (a multi-practice dental group with 9 practices, a dental lab, and marketing operations). ${existingLine}

Return ONLY a JSON array of objects with:
- "title" (string, routine name e.g. "Morning Lead Check")
- "time" (string, HH:MM format e.g. "08:00")
- "detail" (string, step-by-step checklist as one paragraph with sentences separated by periods)

Generate 3-5 routines that are specific, actionable, and relevant to this role in a dental business. Return ONLY the JSON array.`;

      const res = await api.askBrain(question);
      const answer = res.answer || res.response || "";
      const jsonMatch = answer.match(/\[[\s\S]*\]/);
      if (!jsonMatch) { alert("AI response couldn't be parsed. Try again."); return; }
      const items = JSON.parse(jsonMatch[0]);

      for (const item of items) {
        await api.createRoutineTemplate({
          role: aiRole,
          time_local: (item.time || "09:00") + ":00",
          title: item.title,
          detail: item.detail || null,
          week_phase: null,
        });
      }
      await load();
    } catch (err) {
      console.error("AI generation failed:", err);
      alert("AI generation failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const isToday = selectedDate === todayStr();

  return (
    <>
      <Topbar title="Daily Routines" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-ink">Daily Routines</h1>
                <p className="text-sm text-muted mt-0.5">The cadence that holds it together</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded-lg px-3 py-1.5 text-sm"
                  value={aiRole}
                  onChange={(e) => setAiRole(e.target.value)}
                >
                  <option value="">Role for AI...</option>
                  {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button variant="outline" className="gap-1.5" onClick={handleAiGenerate} disabled={aiLoading || !aiRole}>
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Generating..." : "AI Generate"}
                </Button>
                <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4" /> New Routine
                </Button>
              </div>
            </div>

            {/* Controls bar */}
            <div className="flex items-center gap-4 mb-5 bg-white border border-line rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted">Date</label>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-1.5 text-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {!isToday && (
                  <button className="text-xs text-primary hover:underline" onClick={() => setSelectedDate(todayStr())}>Today</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted" />
                <select
                  className="border rounded-lg px-3 py-1.5 text-sm"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-sm font-medium text-ink">{doneCount}/{totalCount} done</div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-muted">{pct}%</span>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {/* Empty state */}
            {!loading && templates.length === 0 && (
              <div className="text-center py-20">
                <Clock className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-lg font-semibold text-ink">No routines yet</p>
                <p className="text-sm text-muted mt-1">Add routine templates to build your daily cadence</p>
                <Button className="mt-4 gap-1.5" onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4" /> Add First Routine
                </Button>
              </div>
            )}

            {/* Routine cards grouped by role */}
            {!loading && Object.entries(grouped).map(([role, items]) => (
              <div key={role} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wide">{role}</h2>
                  <span className="text-xs text-muted">
                    ({items.filter((t) => completionMap[t.id]).length}/{items.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {items.map((t) => (
                    <RoutineCard
                      key={t.id}
                      template={t}
                      isCompleted={!!completionMap[t.id]}
                      logNotes={completionMap[t.id]?.notes}
                      onToggle={() => handleToggle(t.id)}
                      onDelete={() => handleDelete(t.id)}
                      canDelete={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <RightSidebar />
        </div>
      </main>

      <AddTemplateModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        roles={ALL_ROLES}
        onSave={load}
      />
    </>
  );
}
