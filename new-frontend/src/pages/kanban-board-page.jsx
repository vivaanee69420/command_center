import { useState, useEffect, useCallback, useRef } from "react";
import Topbar from "@/components/layout/topbar";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { api } from "@/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, GripVertical, Calendar, User, Building2 } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "backlog",     label: "BACKLOG",      color: "border-t-gray-400",  bg: "bg-gray-50" },
  { key: "in_progress", label: "IN PROGRESS",  color: "border-t-amber-400", bg: "bg-amber-50/50" },
  { key: "blocked",     label: "BLOCKED",       color: "border-t-red-400",   bg: "bg-red-50/50" },
  { key: "done",        label: "DONE",          color: "border-t-green-400", bg: "bg-green-50/50" },
];

const PRIORITY_COLORS = {
  P0: "bg-red-500",
  P1: "bg-amber-500",
  P2: "bg-blue-500",
  P3: "bg-gray-400",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function isOverdue(iso, status) {
  if (!iso || status === "done") return false;
  return new Date(iso) < new Date();
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function KanbanCard({ task, teamMap, bizMap, onDragStart, onClick }) {
  const owner = teamMap[task.owner_id];
  const biz = bizMap[task.business_id];
  const overdue = isOverdue(task.due_at, task.status);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id);
      }}
      onClick={() => onClick(task)}
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-3.5 cursor-grab active:cursor-grabbing",
        "hover:shadow-md hover:border-gray-300 transition-all group",
        task.status === "done" && "opacity-70"
      )}
    >
      {/* Priority + Title */}
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0",
              PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.P2
            )} />
            <span className="text-[10px] font-bold text-gray-400">{task.priority}</span>
          </div>
          <p className={cn(
            "text-sm font-medium leading-snug",
            task.status === "done" ? "text-gray-400 line-through" : "text-gray-800"
          )}>
            {task.title}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {biz && (
          <span className="text-[10px] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5" />
            {biz.name}
          </span>
        )}
        {task.due_at && (
          <span className={cn(
            "text-[10px] flex items-center gap-1",
            overdue ? "text-red-500 font-semibold" : "text-gray-400"
          )}>
            <Calendar className="w-2.5 h-2.5" />
            {overdue && "OVERDUE · "}
            {formatDate(task.due_at)}
          </span>
        )}
      </div>

      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ backgroundColor: owner.color || "#7c3aed" }}
          >
            {getInitials(owner.name)}
          </span>
          <span className="text-[11px] text-gray-500">{owner.name}</span>
        </div>
      )}

      {/* Source badge */}
      {task.source !== "manual" && (
        <span className="mt-2 inline-block text-[9px] bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded">
          {task.source}
        </span>
      )}
    </div>
  );
}

// ─── Kanban Column ───────────────────────────────────────────────────────────

function KanbanColumn({ column, tasks, teamMap, bizMap, onDrop, onCardClick, onDragStart, dragOverColumn, setDragOverColumn }) {
  return (
    <div
      className="flex-1 min-w-[240px]"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(column.key);
      }}
      onDragLeave={() => setDragOverColumn(null)}
      onDrop={(e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) onDrop(taskId, column.key);
        setDragOverColumn(null);
      }}
    >
      {/* Column Header */}
      <div className={cn(
        "border-t-[3px] rounded-t-lg px-3 py-2.5 flex justify-between items-center",
        column.color
      )}>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
          {column.label}
        </span>
        <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
          {tasks.length}
        </span>
      </div>

      {/* Cards Area */}
      <div className={cn(
        "min-h-[200px] rounded-b-lg p-2 space-y-2.5 transition-colors",
        column.bg,
        dragOverColumn === column.key && "ring-2 ring-purple-300 bg-purple-50/30"
      )}>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-300">
            Drop tasks here
          </div>
        )}
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            teamMap={teamMap}
            bizMap={bizMap}
            onDragStart={onDragStart}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Task Detail Modal ──────────────────────────────────────────────────────

function TaskDetailModal({ open, onOpenChange, task, team, businesses, onUpdated, onDeleted }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        status: task.status || "backlog",
        priority: task.priority || "P2",
        owner_id: task.owner_id || "",
        business_id: task.business_id || "",
        due_at: task.due_at ? new Date(task.due_at).toISOString().split("T")[0] : "",
        completion_proof_url: task.completion_proof_url || "",
      });
      setError("");
    }
  }, [task]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const patch = {};
      if (form.title !== task.title) patch.title = form.title;
      if (form.status !== task.status) patch.status = form.status;
      if (form.priority !== task.priority) patch.priority = form.priority;
      if (form.owner_id !== task.owner_id) patch.owner_id = form.owner_id;
      if ((form.business_id || null) !== (task.business_id || null)) patch.business_id = form.business_id || null;
      const oldDue = task.due_at ? new Date(task.due_at).toISOString().split("T")[0] : "";
      if (form.due_at !== oldDue) patch.due_at = form.due_at ? new Date(form.due_at).toISOString() : null;
      if (form.status === "done" && form.completion_proof_url) {
        patch.completion_proof_url = form.completion_proof_url;
      }
      if (Object.keys(patch).length === 0) { onOpenChange(false); return; }
      await api.patchTask(task.id, patch);
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await api.deleteTask(task.id);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-3">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
            </select>
          </div>
          <select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select owner</option>
            {team.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
          </select>
          <select value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">No business</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="date" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
          {form.status === "done" && (
            <input type="url" placeholder="Completion proof URL (required for done)"
              value={form.completion_proof_url} onChange={(e) => setForm({ ...form, completion_proof_url: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Task Modal ──────────────────────────────────────────────────────

function CreateTaskModal({ open, onOpenChange, team, businesses, onCreated, defaultStatus }) {
  const [form, setForm] = useState({ title: "", owner_id: "", business_id: "", priority: "P2", due_at: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.owner_id || !form.due_at) {
      setError("Title, owner, and due date required.");
      return;
    }
    setSaving(true); setError("");
    try {
      const task = await api.createTask({
        title: form.title.trim(),
        owner_id: form.owner_id,
        business_id: form.business_id || undefined,
        priority: form.priority,
        due_at: new Date(form.due_at).toISOString(),
        source: "manual",
      });
      // If default status isn't backlog, update it
      if (defaultStatus && defaultStatus !== "backlog") {
        await api.patchTask(task.id, { status: defaultStatus });
      }
      onCreated();
      onOpenChange(false);
      setForm({ title: "", owner_id: "", business_id: "", priority: "P2", due_at: "" });
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Task title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
          <select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select owner *</option>
            {team.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
          </select>
          <select value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Business (optional)</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex gap-3">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
            </select>
            <input type="date" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Creating...</> : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterBusiness, setFilterBusiness] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // DnD state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [movingTaskId, setMovingTaskId] = useState(null);

  // Modals
  const [editTask, setEditTask] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState("backlog");

  // Lookup maps
  const teamMap = {};
  team.forEach((p) => { teamMap[p.id] = p; });
  const bizMap = {};
  businesses.forEach((b) => { bizMap[b.id] = b; });

  const fetchData = useCallback(async () => {
    try {
      const [tasksData, sidebarData, bizData] = await Promise.all([
        api.tasks(),
        api.dashboardSidebar(),
        api.businesses(),
      ]);
      setTasks(tasksData);
      setTeam(sidebarData.team || []);
      setBusinesses(bizData);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter tasks
  const filtered = tasks.filter((t) => {
    if (filterOwner !== "all" && t.owner_id !== filterOwner) return false;
    if (filterBusiness !== "all" && (t.business_id || "") !== filterBusiness) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  // Group by status
  const grouped = {};
  COLUMNS.forEach(col => { grouped[col.key] = []; });
  filtered.forEach((t) => {
    const key = grouped[t.status] ? t.status : "backlog";
    grouped[key].push(t);
  });
  // Sort within columns: P0 first, then by due date
  const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => {
      const pd = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
      if (pd !== 0) return pd;
      return new Date(a.due_at) - new Date(b.due_at);
    });
  });

  // Handle drag-drop status change
  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Don't allow dropping to "done" via drag (needs completion_proof_url)
    if (newStatus === "done") {
      setEditTask(task);
      return;
    }

    // Optimistic update
    setMovingTaskId(taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.patchTask(taskId, { status: newStatus });
      // Refresh to get server state
      const fresh = await api.tasks();
      setTasks(fresh);
    } catch (err) {
      // Revert on error
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
      setError(err.message || "Failed to move task");
    } finally {
      setMovingTaskId(null);
      setDraggingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Kanban Board" subtitle="Drag tasks across columns" />
        <main className="p-6 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Kanban Board" subtitle="Drag tasks across columns" />

      <main className="p-6 max-w-[1800px] mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none">
            <option value="all">All Owners</option>
            {team.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterBusiness} onChange={(e) => setFilterBusiness(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none">
            <option value="all">All Businesses</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none">
            <option value="all">All Priority</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{filtered.length} tasks</span>
            <Button onClick={() => { setCreateDefaultStatus("backlog"); setCreateOpen(true); }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline text-xs">dismiss</button>
          </div>
        )}

        {/* Board + Sidebar */}
        <div className="flex gap-6">
          {/* Kanban Board */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-3">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.key}
                  column={column}
                  tasks={grouped[column.key] || []}
                  teamMap={teamMap}
                  bizMap={bizMap}
                  onDrop={handleDrop}
                  onCardClick={setEditTask}
                  onDragStart={setDraggingId}
                  dragOverColumn={dragOverColumn}
                  setDragOverColumn={setDragOverColumn}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>

      {/* Edit Modal */}
      <TaskDetailModal
        open={!!editTask}
        onOpenChange={(v) => { if (!v) setEditTask(null); }}
        task={editTask}
        team={team}
        businesses={businesses}
        onUpdated={fetchData}
        onDeleted={fetchData}
      />

      {/* Create Modal */}
      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        team={team}
        businesses={businesses}
        onCreated={fetchData}
        defaultStatus={createDefaultStatus}
      />
    </>
  );
}
