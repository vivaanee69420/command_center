import { useState, useEffect, useCallback } from "react";
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
import {
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Filter,
  Plus,
  Search,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  P0: { bg: "bg-red-500", text: "text-white", label: "Critical" },
  P1: { bg: "bg-amber-500", text: "text-white", label: "High" },
  P2: { bg: "bg-blue-500", text: "text-white", label: "Medium" },
  P3: { bg: "bg-gray-400", text: "text-white", label: "Low" },
};

const STATUS_CONFIG = {
  backlog:      { icon: Circle,       color: "text-gray-400",  label: "Backlog" },
  in_progress:  { icon: Clock,        color: "text-amber-500", label: "In Progress" },
  done:         { icon: CheckCircle2, color: "text-green-500", label: "Done" },
  blocked:      { icon: AlertCircle,  color: "text-red-500",   label: "Blocked" },
};

const STATUS_OPTIONS = ["backlog", "in_progress", "done", "blocked"];
const PRIORITY_OPTIONS = ["P0", "P1", "P2", "P3"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function isOverdue(iso, status) {
  if (!iso || status === "done") return false;
  return new Date(iso) < new Date();
}

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Create Task Modal ──────────────────────────────────────────────────────

function CreateTaskModal({ open, onOpenChange, team, businesses, onCreated }) {
  const [form, setForm] = useState({ title: "", owner_id: "", business_id: "", priority: "P2", due_at: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.owner_id || !form.due_at) {
      setError("Title, owner, and due date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.createTask({
        title: form.title.trim(),
        owner_id: form.owner_id,
        business_id: form.business_id || undefined,
        priority: form.priority,
        due_at: new Date(form.due_at).toISOString(),
        source: "manual",
      });
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
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={form.owner_id}
            onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select owner *</option>
            {team.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
            ))}
          </select>
          <select
            value={form.business_id}
            onChange={(e) => setForm({ ...form, business_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Business (optional)</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p} — {PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.due_at}
              onChange={(e) => setForm({ ...form, due_at: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
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

// ─── Edit Task Modal ────────────────────────────────────────────────────────

function EditTaskModal({ open, onOpenChange, task, team, businesses, onUpdated, onDeleted }) {
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
      const newDue = form.due_at ? new Date(form.due_at).toISOString() : null;
      const oldDue = task.due_at ? new Date(task.due_at).toISOString().split("T")[0] : "";
      if (form.due_at !== oldDue) patch.due_at = newDue;
      if (form.status === "done" && form.completion_proof_url) {
        patch.completion_proof_url = form.completion_proof_url;
      }

      if (Object.keys(patch).length === 0) {
        onOpenChange(false);
        return;
      }
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
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.deleteTask(task.id);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-3">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p} — {PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
          <select
            value={form.owner_id}
            onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select owner</option>
            {team.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
            ))}
          </select>
          <select
            value={form.business_id}
            onChange={(e) => setForm({ ...form, business_id: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">No business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.due_at}
            onChange={(e) => setForm({ ...form, due_at: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          {form.status === "done" && (
            <input
              type="url"
              placeholder="Completion proof URL (required for done)"
              value={form.completion_proof_url}
              onChange={(e) => setForm({ ...form, completion_proof_url: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Quick Status Toggle ────────────────────────────────────────────────────

function StatusToggle({ task, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const nextStatus = () => {
    const order = ["backlog", "in_progress", "done"];
    const idx = order.indexOf(task.status);
    if (idx < 0 || idx >= order.length - 1) return null;
    return order[idx + 1];
  };

  const handleClick = async (e) => {
    e.stopPropagation();
    const next = nextStatus();
    if (!next) return;

    // done requires completion_proof_url or kpi_delta, skip quick toggle for done
    if (next === "done") return;

    setLoading(true);
    try {
      await api.patchTask(task.id, { status: next });
      onUpdated();
    } catch {
      // silently fail, user can use edit modal
    } finally {
      setLoading(false);
    }
  };

  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.backlog;
  const Icon = cfg.icon;

  return (
    <button
      onClick={handleClick}
      disabled={loading || task.status === "done"}
      className={cn("shrink-0 transition hover:scale-110", cfg.color)}
      title={`Status: ${cfg.label}. Click to advance.`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SimpleTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterBusiness, setFilterBusiness] = useState("all");
  const [sortBy, setSortBy] = useState("due_at"); // due_at | priority | created_at

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Build lookup maps
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
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter + sort tasks
  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterOwner !== "all" && t.owner_id !== filterOwner) return false;
    if (filterBusiness !== "all" && (t.business_id || "") !== filterBusiness) return false;
    if (search) {
      const q = search.toLowerCase();
      const ownerName = (teamMap[t.owner_id]?.name || "").toLowerCase();
      const bizName = (bizMap[t.business_id]?.name || "").toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !ownerName.includes(q) && !bizName.includes(q)) return false;
    }
    return true;
  });

  const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
    if (sortBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
    // default: due_at ascending
    return new Date(a.due_at) - new Date(b.due_at);
  });

  // Stats
  const stats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === "backlog").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => isOverdue(t.due_at, t.status)).length,
  };

  if (loading) {
    return (
      <>
        <Topbar title="All Tasks" subtitle="Everything assigned" />
        <main className="p-6 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="All Tasks" subtitle="Everything assigned · sortable" />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        {/* Content + Sidebar */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Stats Row */}
            <div className="grid grid-cols-5 gap-3 mb-5">
              {[
                { label: "Total", value: stats.total, color: "text-gray-700" },
                { label: "Backlog", value: stats.backlog, color: "text-gray-500" },
                { label: "In Progress", value: stats.in_progress, color: "text-amber-600" },
                { label: "Done", value: stats.done, color: "text-green-600" },
                { label: "Overdue", value: stats.overdue, color: "text-red-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
                  <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Toolbar: Search + Filters + Create */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none"
              >
                <option value="all">All Priority</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Owner Filter */}
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none"
              >
                <option value="all">All Owners</option>
                {team.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Business Filter */}
              <select
                value={filterBusiness}
                onChange={(e) => setFilterBusiness(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none"
              >
                <option value="all">All Businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white outline-none"
              >
                <option value="due_at">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="created_at">Sort: Newest</option>
              </select>

              {/* Create Button */}
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Task
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {/* Tasks Card */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {/* Card Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">
                  Tasks
                  {filtered.length !== tasks.length && (
                    <span className="text-gray-400 font-normal ml-2">
                      (showing {filtered.length} of {tasks.length})
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400">{filtered.length} tasks</span>
              </div>

              {/* Task List */}
              {sorted.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  {tasks.length === 0 ? "No tasks yet. Create one to get started." : "No tasks match your filters."}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {sorted.map((task) => {
                    const owner = teamMap[task.owner_id];
                    const biz = bizMap[task.business_id];
                    const overdue = isOverdue(task.due_at, task.status);
                    const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.P2;

                    return (
                      <div
                        key={task.id}
                        onClick={() => setEditTask(task)}
                        className="px-5 py-3.5 hover:bg-gray-50/80 transition cursor-pointer flex items-start gap-3"
                      >
                        {/* Status Toggle */}
                        <div className="pt-0.5">
                          <StatusToggle task={task} onUpdated={fetchData} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium",
                            task.status === "done" ? "text-gray-400 line-through" : "text-gray-800"
                          )}>
                            {task.title}
                          </p>

                          {/* Meta Row */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {/* Priority Badge */}
                            <span className={cn(
                              "inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold",
                              pCfg.bg, pCfg.text
                            )}>
                              {task.priority}
                            </span>

                            {/* Business */}
                            {biz && (
                              <span className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                {biz.name}
                              </span>
                            )}

                            {/* Owner */}
                            {owner && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[8px] font-bold">
                                  {getInitials(owner.name)}
                                </span>
                                {owner.name}
                              </span>
                            )}

                            {/* Due Date */}
                            <span className={cn(
                              "text-[10px]",
                              overdue ? "text-red-500 font-semibold" : "text-gray-400"
                            )}>
                              {overdue ? "OVERDUE · " : "due "}
                              {formatDate(task.due_at)}
                            </span>

                            {/* Source badge */}
                            {task.source !== "manual" && (
                              <span className="text-[10px] bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded">
                                {task.source}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: status label */}
                        <span className={cn(
                          "text-[10px] px-2 py-1 rounded-full shrink-0 mt-1",
                          task.status === "done" ? "bg-green-50 text-green-600" :
                          task.status === "in_progress" ? "bg-amber-50 text-amber-600" :
                          task.status === "blocked" ? "bg-red-50 text-red-600" :
                          "bg-gray-50 text-gray-400"
                        )}>
                          {STATUS_CONFIG[task.status]?.label || task.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>

      {/* Create Modal */}
      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        team={team}
        businesses={businesses}
        onCreated={fetchData}
      />

      {/* Edit Modal */}
      <EditTaskModal
        open={!!editTask}
        onOpenChange={(v) => { if (!v) setEditTask(null); }}
        task={editTask}
        team={team}
        businesses={businesses}
        onUpdated={fetchData}
        onDeleted={fetchData}
      />
    </>
  );
}
