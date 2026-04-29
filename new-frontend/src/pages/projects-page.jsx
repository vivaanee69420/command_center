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
  Plus,
  Trash2,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Circle,
  GripVertical,
  Pencil,
  Loader2,
  FolderOpen,
  Users,
  Calendar,
  Target,
} from "lucide-react";

const PHASES = [
  { key: 1, title: "Phase 1", subtitle: "Days 1-30", color: "border-green-400", bg: "bg-green-50", dot: "bg-green-500" },
  { key: 2, title: "Phase 2", subtitle: "Days 31-60", color: "border-blue-400", bg: "bg-blue-50", dot: "bg-blue-500" },
  { key: 3, title: "Phase 3", subtitle: "Days 61-90", color: "border-purple-400", bg: "bg-purple-50", dot: "bg-purple-500" },
];

// Determine phase (1/2/3) from task due_at relative to project created_at
function getPhase(task, projectCreatedAt) {
  if (!task.due_at || !projectCreatedAt) return 1;
  const start = new Date(projectCreatedAt);
  const due = new Date(task.due_at);
  const days = Math.ceil((due - start) / (1000 * 60 * 60 * 24));
  if (days <= 30) return 1;
  if (days <= 60) return 2;
  return 3;
}

// Compute due_at from phase + project created_at
function dueFromPhase(phase, projectCreatedAt) {
  const start = projectCreatedAt ? new Date(projectCreatedAt) : new Date();
  const offset = phase === 1 ? 15 : phase === 2 ? 45 : 75; // mid-phase
  const d = new Date(start);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

// --- Create Plan Modal ---
function CreatePlanModal({ open, onClose, teamMap, bizList, onSave }) {
  const [form, setForm] = useState({ name: "", owner_id: "", business_id: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const team = Object.entries(teamMap).map(([id, name]) => ({ id, name }));

  useEffect(() => {
    if (open) setForm({ name: "", owner_id: "", business_id: "" });
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.owner_id) return;
    setSaving(true);
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 90);
      const proj = await api.createProject({
        name: form.name.trim(),
        owner_id: form.owner_id,
        business_id: form.business_id || null,
        deadline: deadline.toISOString().split("T")[0],
        kpi_metric: null,
        kpi_target: null,
      });
      onSave(proj);
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
        <DialogHeader><DialogTitle>New 90-Day Plan</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted">Plan Name *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="e.g. Q3 Implant Academy Launch" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Owner *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.owner_id} onChange={(e) => set("owner_id", e.target.value)} required>
                <option value="">Select</option>
                {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Business</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.business_id} onChange={(e) => set("business_id", e.target.value)}>
                <option value="">All / Group</option>
                {bizList.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Plan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Add Item Modal ---
function AddItemModal({ open, onClose, phase, projectId, projectCreatedAt, teamMap, onSave }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const team = Object.entries(teamMap).map(([id, name]) => ({ id, name }));
  const [ownerId, setOwnerId] = useState("");

  useEffect(() => {
    if (open) { setTitle(""); setOwnerId(""); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !ownerId) return;
    setSaving(true);
    try {
      await api.createTask({
        title: title.trim(),
        owner_id: ownerId,
        due_at: dueFromPhase(phase, projectCreatedAt) + "T09:00:00",
        project_id: projectId,
        priority: "P2",
        source: "manual",
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
        <DialogHeader><DialogTitle>Add Item to Phase {phase}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted">Action Item *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="What needs to happen?" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Owner *</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required>
              <option value="">Select</option>
              {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Phase Column ---
function PhaseColumn({ phaseCfg, items, teamMap, onToggle, onAdd, onDelete }) {
  const done = items.filter((t) => t.status === "done").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className={`flex-1 border-t-4 ${phaseCfg.color} bg-white rounded-xl p-4 min-w-0`}>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-bold text-ink">{phaseCfg.title}</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{phaseCfg.subtitle}</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${phaseCfg.dot} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-muted">{done}/{items.length}</span>
      </div>

      <div className="space-y-1">
        {items.map((task, idx) => {
          const isDone = task.status === "done";
          return (
            <div key={task.id} className={`flex items-start gap-2 py-2 px-2 rounded-lg group hover:bg-gray-50 ${isDone ? "opacity-60" : ""}`}>
              <button
                onClick={() => onToggle(task)}
                className="mt-0.5 shrink-0"
              >
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <Circle className="w-4 h-4 text-gray-300 hover:text-green-400" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${isDone ? "line-through text-muted" : "text-ink"}`}>{task.title}</p>
                <p className="text-[10px] text-muted mt-0.5">{teamMap[task.owner_id] || "Unassigned"}</p>
              </div>
              <button
                onClick={() => onDelete(task)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 shrink-0 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        className="w-full mt-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-muted hover:border-purple-400 hover:text-purple-600 flex items-center justify-center gap-1 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add item
      </button>
    </div>
  );
}

// --- Plan Card (list view) ---
function PlanCard({ project, teamMap, bizMap, taskCount, doneCount, onClick }) {
  const pct = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;
  return (
    <div onClick={onClick} className="bg-white border border-line rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold text-ink">{project.name}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${project.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
          {project.status}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold text-ink">{pct}%</span>
      </div>
      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {teamMap[project.owner_id] || "?"}</span>
        <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {taskCount} items</span>
        {bizMap[project.business_id] && <span>{bizMap[project.business_id]}</span>}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [teamMap, setTeamMap] = useState({});
  const [bizList, setBizList] = useState([]);
  const [bizMap, setBizMap] = useState({});
  const [bizTypeMap, setBizTypeMap] = useState({});
  const [teamRoleMap, setTeamRoleMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Views: "list" or project ID
  const [view, setView] = useState("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [addPhase, setAddPhase] = useState(null); // which phase to add to
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    try {
      const [proj, tsk, ppl, biz] = await Promise.all([
        api.projects(),
        api.tasks(),
        api.people(),
        api.businesses(),
      ]);
      setProjects(proj);
      setAllTasks(tsk);
      const tm = {};
      const trm = {};
      (ppl || []).forEach((p) => { tm[p.id] = p.name; trm[p.id] = p.role; });
      setTeamMap(tm);
      setTeamRoleMap(trm);
      setBizList(biz);
      const btm = {};
      biz.forEach((b) => { btm[b.id] = b.type; });
      setBizTypeMap(btm);
      const bm = {};
      biz.forEach((b) => { bm[b.id] = b.name; });
      setBizMap(bm);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedProject = projects.find((p) => p.id === view);
  const projectTasks = useMemo(
    () => allTasks.filter((t) => t.project_id === view),
    [allTasks, view]
  );

  // Group tasks by phase
  const phaseItems = useMemo(() => {
    if (!selectedProject) return { 1: [], 2: [], 3: [] };
    const grouped = { 1: [], 2: [], 3: [] };
    projectTasks.forEach((t) => {
      const ph = getPhase(t, selectedProject.created_at);
      (grouped[ph] || grouped[1]).push(t);
    });
    return grouped;
  }, [projectTasks, selectedProject]);

  // Toggle task done/in_progress
  const handleToggle = async (task) => {
    const isDone = task.status === "done";
    try {
      if (isDone) {
        await api.patchTask(task.id, { status: "in_progress" });
      } else {
        await api.patchTask(task.id, { status: "done", completion_proof_url: "90-day-plan-checked" });
      }
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.deleteTask(task.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedProject) return;
    if (!confirm(`Delete plan "${selectedProject.name}" and all its items?`)) return;
    try {
      // Delete all tasks linked to this project first
      for (const t of projectTasks) {
        await api.deleteTask(t.id);
      }
      await api.deleteProject(selectedProject.id);
      setView("list");
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  // AI Generate plan items
  const handleAiGenerate = async () => {
    if (!selectedProject) return;
    setAiLoading(true);
    try {
      const bizName = bizMap[selectedProject.business_id] || "GM Dental Group";
      const bizType = bizTypeMap[selectedProject.business_id] || "business";
      const ownerName = teamMap[selectedProject.owner_id] || "team member";
      const ownerRole = teamRoleMap[selectedProject.owner_id] || "";
      const kpiLine = selectedProject.kpi_metric
        ? `The key KPI to target is "${selectedProject.kpi_metric}"${selectedProject.kpi_target ? ` with a target of ${selectedProject.kpi_target}` : ""}.`
        : "";
      const deadlineLine = selectedProject.deadline
        ? `The project deadline is ${selectedProject.deadline}.`
        : "";
      const existingItems = projectTasks.map((t) => t.title);
      const existingLine = existingItems.length
        ? `Existing plan items (do NOT duplicate): ${existingItems.join(", ")}.`
        : "";
      const teamList = Object.entries(teamMap).map(([id, name]) => `${name} (${teamRoleMap[id] || "team"})`).join(", ");

      const question = `Generate a 90-day action plan for the project "${selectedProject.name}" at ${bizName} (a ${bizType} business). The project owner is ${ownerName}${ownerRole ? ` (${ownerRole})` : ""}. Team members: ${teamList}. ${kpiLine} ${deadlineLine} ${existingLine}

Return ONLY a JSON array of objects with "title" (string, specific actionable task) and "phase" (number 1, 2, or 3).
Phase 1 (Days 1-30): Foundation, setup, quick wins, cash flow improvements.
Phase 2 (Days 31-60): Convert, activate, build systems, grow pipeline.
Phase 3 (Days 61-90): Operate, scale, optimize, measure results.
Generate exactly 5 items per phase (15 total). Be specific to this ${bizType} business. Include measurable outcomes where possible. Return ONLY the JSON array.`;

      const res = await api.askBrain(question, selectedProject.business_id || undefined);
      const answer = res.answer || res.response || "";

      // Parse JSON from response
      const jsonMatch = answer.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        alert("AI response couldn't be parsed. Try again.");
        return;
      }
      const items = JSON.parse(jsonMatch[0]);

      // Get first team member as default owner (project owner)
      const ownerId = selectedProject.owner_id || Object.keys(teamMap)[0];

      // Create tasks for each item
      for (const item of items) {
        const phase = item.phase || 1;
        await api.createTask({
          title: item.title,
          owner_id: ownerId,
          due_at: dueFromPhase(phase, selectedProject.created_at) + "T09:00:00",
          project_id: selectedProject.id,
          priority: "P2",
          source: "ai_brain",
        });
      }
      load();
    } catch (err) {
      console.error("AI generation failed:", err);
      alert("AI generation failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Update project progress based on task completion
  useEffect(() => {
    if (!selectedProject || projectTasks.length === 0) return;
    const done = projectTasks.filter((t) => t.status === "done").length;
    const pct = Math.round((done / projectTasks.length) * 100);
    if (pct !== selectedProject.progress_pct) {
      api.patchProject(selectedProject.id, { progress_pct: pct }).catch(() => {});
    }
  }, [projectTasks, selectedProject]);

  // --- List View ---
  if (view === "list") {
    // Compute per-project stats
    const projectStats = {};
    projects.forEach((p) => {
      const tasks = allTasks.filter((t) => t.project_id === p.id);
      projectStats[p.id] = {
        total: tasks.length,
        done: tasks.filter((t) => t.status === "done").length,
      };
    });

    return (
      <>
        <Topbar title="90-Day Plan" />
        <main className="p-6 max-w-[1500px] mx-auto w-full">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-xl font-bold text-ink">90-Day Plans</h1>
              <p className="text-xs text-muted mt-0.5">Create and manage phased action plans</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> New Plan
            </Button>
          </div>

          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="text-center py-20 text-muted text-sm">Loading plans...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-20">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted">No 90-day plans yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => setCreateOpen(true)}>
                    Create your first plan
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((p) => (
                    <PlanCard
                      key={p.id}
                      project={p}
                      teamMap={teamMap}
                      bizMap={bizMap}
                      taskCount={projectStats[p.id]?.total || 0}
                      doneCount={projectStats[p.id]?.done || 0}
                      onClick={() => setView(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            <RightSidebar />
          </div>
        </main>

        <CreatePlanModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          teamMap={teamMap}
          bizList={bizList}
          onSave={(proj) => { load(); setView(proj.id); }}
        />
      </>
    );
  }

  // --- Detail View (3 phase columns) ---
  const totalItems = projectTasks.length;
  const doneItems = projectTasks.filter((t) => t.status === "done").length;
  const overallPct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <>
      <Topbar title="90-Day Plan" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setView("list")} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5 text-muted" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-ink">{selectedProject?.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {teamMap[selectedProject?.owner_id] || "?"}
              </span>
              {bizMap[selectedProject?.business_id] && (
                <span className="text-xs text-muted">{bizMap[selectedProject?.business_id]}</span>
              )}
              <span className="text-xs text-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {selectedProject?.deadline ? new Date(selectedProject.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No deadline"}
              </span>
              <span className="text-xs font-semibold text-ink">{overallPct}% complete</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={handleAiGenerate}
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? "Generating..." : "AI Generate"}
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5"
            onClick={handleDeletePlan}
          >
            <Trash2 className="w-4 h-4" /> Delete Plan
          </Button>
        </div>

        {/* Overall progress */}
        <div className="bg-white border border-line rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted w-20">Overall</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overallPct >= 80 ? "bg-green-500" : overallPct >= 40 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${overallPct}%` }} />
            </div>
            <span className="text-sm font-bold text-ink w-16 text-right">{doneItems}/{totalItems}</span>
          </div>
        </div>

        {/* 3 Phase Columns */}
        <div className="flex gap-6">
          <div className="flex gap-4 flex-1">
            {PHASES.map((ph) => (
              <PhaseColumn
                key={ph.key}
                phaseCfg={ph}
                items={phaseItems[ph.key] || []}
                teamMap={teamMap}
                onToggle={handleToggle}
                onAdd={() => setAddPhase(ph.key)}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
          <RightSidebar />
        </div>
      </main>

      {/* Add item modal */}
      {addPhase && selectedProject && (
        <AddItemModal
          open={!!addPhase}
          onClose={() => setAddPhase(null)}
          phase={addPhase}
          projectId={selectedProject.id}
          projectCreatedAt={selectedProject.created_at}
          teamMap={teamMap}
          onSave={load}
        />
      )}
    </>
  );
}
