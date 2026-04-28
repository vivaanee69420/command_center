import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { BUSINESSES, USERS_DEFAULT } from "@/lib/data";
import { cn, getInitials } from "@/lib/utils";
import {
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  User,
  Building2,
  X,
  Trash2,
  Sparkles,
  Calendar,
  Tag,
  Flag,
  Clock,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "ai_suggested", label: "AI Suggested", color: "#7c3aed", bgColor: "bg-purple-soft", textColor: "text-purple" },
  { key: "backlog",      label: "Backlog",       color: "#94a3b8", bgColor: "bg-bg-shell",    textColor: "text-muted"  },
  { key: "this_week",    label: "This Week",     color: "#3b82f6", bgColor: "bg-info-soft",   textColor: "text-info"   },
  { key: "in_progress",  label: "In Progress",   color: "#f59e0b", bgColor: "bg-warning-soft",textColor: "text-warning"},
  { key: "blocked",      label: "Blocked",       color: "#ef4444", bgColor: "bg-danger-soft", textColor: "text-danger" },
  { key: "review",       label: "Review",        color: "#fb923c", bgColor: "bg-orange-soft", textColor: "text-orange" },
  { key: "done",         label: "Done",          color: "#10b981", bgColor: "bg-primary-soft",textColor: "text-primary"},
];

const PRIORITY_CONFIG = {
  P0: { label: "P0", bg: "bg-danger-soft",   text: "text-danger",  border: "border-danger"  },
  P1: { label: "P1", bg: "bg-warning-soft",  text: "text-warning", border: "border-warning" },
  P2: { label: "P2", bg: "bg-info-soft",     text: "text-info",    border: "border-info"    },
  P3: { label: "P3", bg: "bg-purple-soft",   text: "text-purple",  border: "border-purple"  },
};

const BUSINESS_COLORS = {
  ashford:       "#10b981",
  rochester:     "#3b82f6",
  barnet:        "#f59e0b",
  bexleyheath:   "#ef4444",
  "warwick-lodge": "#7c3aed",
  "rye-dental":  "#fb923c",
  academy:       "#14b8a6",
  lab:           "#6366f1",
  accounts:      "#0e2a47",
};

const VIEW_TABS = [
  { key: "kanban",    label: "Kanban",       icon: LayoutGrid },
  { key: "by_person", label: "By Person",    icon: User       },
  { key: "by_biz",    label: "By Business",  icon: Building2  },
  { key: "list",      label: "List",         icon: List       },
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_TASKS = [
  {
    id: "T-001", title: "Launch Q2 Google Ads campaign for Ashford",
    description: "Set up new ad groups targeting implants and Invisalign. Budget £800/month.",
    owner: "Nikhil", business: "ashford", priority: "P0", status: "in_progress",
    due: "2026-04-30", tags: ["ads", "marketing"], aiSuggested: false,
  },
  {
    id: "T-002", title: "Fix Rochester booking funnel drop-off",
    description: "Conversion rate dropped 14%. Investigate landing page and form abandonment.",
    owner: "Ruhith Pasha", business: "rochester", priority: "P0", status: "blocked",
    due: "2026-04-29", tags: ["urgent", "conversion"], aiSuggested: false,
  },
  {
    id: "T-003", title: "Create 4 Instagram reels for Barnet May",
    description: "Dental tips series + patient testimonial format. Use brand template.",
    owner: "Abhishek", business: "barnet", priority: "P1", status: "this_week",
    due: "2026-05-03", tags: ["social", "content"], aiSuggested: false,
  },
  {
    id: "T-004", title: "Update GHL automation for no-show follow-up",
    description: "Add 2-step SMS + email sequence triggered 30 min after no-show.",
    owner: "Maryam", business: "bexleyheath", priority: "P1", status: "in_progress",
    due: "2026-05-01", tags: ["ghl", "automation"], aiSuggested: false,
  },
  {
    id: "T-005", title: "SEO audit for Warwick Lodge website",
    description: "Run full crawl, fix broken links, improve meta titles and H1s.",
    owner: "Fatima", business: "warwick-lodge", priority: "P2", status: "backlog",
    due: "2026-05-10", tags: ["seo"], aiSuggested: false,
  },
  {
    id: "T-006", title: "Qualify 20 inbound leads from Rye Dental",
    description: "Call all leads received this week. Log outcomes in GHL.",
    owner: "Sona", business: "rye-dental", priority: "P1", status: "this_week",
    due: "2026-05-02", tags: ["sdr", "leads"], aiSuggested: false,
  },
  {
    id: "T-007", title: "Prepare Academy monthly report",
    description: "Compile revenue, leads, and treatment acceptance KPIs for April.",
    owner: "Gaurav Mathur", business: "academy", priority: "P2", status: "review",
    due: "2026-05-05", tags: ["reporting"], aiSuggested: false,
  },
  {
    id: "T-008", title: "Increase Lab BD outreach to 15 new dentists",
    description: "Send intro email + brochure to prospective partner dental practices.",
    owner: "Veena", business: "lab", priority: "P2", status: "backlog",
    due: "2026-05-08", tags: ["bd", "outreach"], aiSuggested: false,
  },
  {
    id: "T-009", title: "Reconcile Accounts April invoices",
    description: "Match all invoices to bank statements. Flag discrepancies to Gaurav.",
    owner: "Gaurav Mathur", business: "accounts", priority: "P1", status: "done",
    due: "2026-04-28", tags: ["finance"], aiSuggested: false,
  },
  {
    id: "T-010", title: "Publish 2 blog posts for Ashford SEO",
    description: "Topics: 'Cost of dental implants in Kent' and 'Invisalign vs braces'.",
    owner: "Fatima", business: "ashford", priority: "P2", status: "done",
    due: "2026-04-27", tags: ["seo", "content"], aiSuggested: false,
  },
  {
    id: "T-011", title: "A/B test new Bexleyheath ad creative",
    description: "Test video vs static carousel for implants campaign. Run for 7 days.",
    owner: "Nikhil", business: "bexleyheath", priority: "P1", status: "this_week",
    due: "2026-05-04", tags: ["ads", "testing"], aiSuggested: false,
  },
  {
    id: "T-012", title: "Review and approve May content calendar",
    description: "Check all posts across 9 businesses. Ensure brand consistency.",
    owner: "Nadia", business: "ashford", priority: "P1", status: "review",
    due: "2026-04-30", tags: ["content", "approval"], aiSuggested: false,
  },
  {
    id: "T-013", title: "AI: Increase Rye Dental ad spend by 20%",
    description: "CPL is below target. Scaling budget could capture more implant leads.",
    owner: "Nikhil", business: "rye-dental", priority: "P1", status: "ai_suggested",
    due: "2026-05-05", tags: ["ads", "ai"], aiSuggested: true,
  },
  {
    id: "T-014", title: "AI: Re-engage cold leads from Rochester (March batch)",
    description: "87 leads have not been contacted in 30+ days. Run re-engagement sequence.",
    owner: "Sona", business: "rochester", priority: "P0", status: "ai_suggested",
    due: "2026-05-02", tags: ["leads", "ai", "sdr"], aiSuggested: true,
  },
  {
    id: "T-015", title: "Train Veena on GHL lead pipeline management",
    description: "1-hour session covering pipeline stages, notes, and task creation in GHL.",
    owner: "Maryam", business: "lab", priority: "P3", status: "backlog",
    due: "2026-05-12", tags: ["training"], aiSuggested: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.P3;
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border", cfg.bg, cfg.text, cfg.border)}>
      {cfg.label}
    </span>
  );
}

function OwnerAvatar({ name, size = "sm" }) {
  const user = USERS_DEFAULT.find((u) => u.name === name);
  const color = user?.color || "#94a3b8";
  const initials = getInitials(name || "?");
  const dim = size === "sm" ? "w-5 h-5 text-[9px]" : "w-7 h-7 text-xs";
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full font-bold text-white shrink-0", dim)}
      style={{ background: color }}
      title={name}
    >
      {initials}
    </span>
  );
}

function BusinessTag({ bizSlug }) {
  const biz = BUSINESSES.find((b) => b.slug === bizSlug);
  if (!biz) return null;
  const color = BUSINESS_COLORS[bizSlug] || "#94a3b8";
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-bg-shell text-muted">
      <span>{biz.emoji}</span>
      {biz.name}
    </span>
  );
}

function formatDue(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const isOverdue = d < now && dateStr !== new Date().toISOString().slice(0, 10);
  return { label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), isOverdue };
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick }) {
  const borderColor = BUSINESS_COLORS[task.business] || "#94a3b8";
  const due = formatDue(task.due);

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white border border-line rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow group"
      style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
    >
      {task.aiSuggested && (
        <div className="flex items-center gap-1 mb-1.5">
          <Sparkles size={10} className="text-purple" />
          <span className="text-[10px] font-semibold text-purple">AI Suggested</span>
        </div>
      )}
      <p className="text-xs font-semibold text-ink leading-snug mb-2 group-hover:text-primary transition-colors">
        {task.title}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <PriorityBadge priority={task.priority} />
        <BusinessTag bizSlug={task.business} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <OwnerAvatar name={task.owner} />
        {due && (
          <span className={cn("flex items-center gap-1 text-[10px] font-medium", due.isOverdue ? "text-danger" : "text-muted")}>
            <Clock size={9} />
            {due.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ column, tasks, onCardClick, onAddTask }) {
  return (
    <div className="flex flex-col min-w-[240px] max-w-[260px] flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: column.color }}
          />
          <span className="text-xs font-bold text-ink">{column.label}</span>
          <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold", column.bgColor, column.textColor)}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onCardClick} />
        ))}
      </div>

      {/* Add Task */}
      <button
        onClick={() => onAddTask(column.key)}
        className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-line text-xs text-muted hover:text-primary hover:border-primary transition w-full"
      >
        <Plus size={12} />
        Add task
      </button>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

function TaskModal({ task, onSave, onDelete, onClose }) {
  const isNew = !task?.id;
  const [form, setForm] = useState(
    task || {
      id: "", title: "", description: "", owner: USERS_DEFAULT[0].name,
      business: BUSINESSES[0].slug, priority: "P2", status: "backlog",
      due: "", tags: [], aiSuggested: false,
    }
  );
  const [tagInput, setTagInput] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const saved = { ...form };
    if (isNew) saved.id = "T-" + String(Date.now()).slice(-5);
    onSave(saved);
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      set("tags", [...(form.tags || []), tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h2 className="text-sm font-bold text-ink">{isNew ? "New Task" : "Edit Task"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg-soft transition text-muted">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 flex-1">
          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Task title..."
              className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Row: Owner + Business */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Owner</label>
              <select
                value={form.owner}
                onChange={(e) => set("owner", e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
              >
                {USERS_DEFAULT.map((u) => (
                  <option key={u.u} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Business</label>
              <select
                value={form.business}
                onChange={(e) => set("business", e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
              >
                {BUSINESSES.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.emoji} {b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
              >
                {["P0", "P1", "P2", "P3"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
              >
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Due Date</label>
            <input
              type="date"
              value={form.due}
              onChange={(e) => set("due", e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(form.tags || []).map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-soft text-primary text-[10px] font-medium rounded-full">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-danger transition">
                    <X size={9} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Type tag and press Enter..."
              className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-line shrink-0">
          <div>
            {!isNew && (
              <button
                onClick={() => onDelete(form.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger-soft transition"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-line text-xs font-medium text-ink hover:bg-bg-soft transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition"
            >
              {isNew ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeView, setActiveView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [bizFilter, setBizFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalTask, setModalTask] = useState(null); // null = closed, {} = new, task = edit
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("backlog");

  // ── Filtered tasks ──
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const q = search.toLowerCase();
      if (q && !t.title.toLowerCase().includes(q) && !t.tags.some((x) => x.includes(q))) return false;
      if (ownerFilter !== "All" && t.owner !== ownerFilter) return false;
      if (bizFilter !== "All" && t.business !== bizFilter) return false;
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, ownerFilter, bizFilter, priorityFilter]);

  // ── KPIs ──
  const kpis = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    return {
      total:       tasks.length,
      thisWeek:    tasks.filter((t) => t.due >= now && t.due <= weekEnd).length,
      inProgress:  tasks.filter((t) => t.status === "in_progress").length,
      blocked:     tasks.filter((t) => t.status === "blocked").length,
      done:        tasks.filter((t) => t.status === "done").length,
      aiSuggested: tasks.filter((t) => t.aiSuggested).length,
    };
  }, [tasks]);

  // ── Modal handlers ──
  const openNew = (status = "backlog") => {
    setDefaultStatus(status);
    setModalTask({ status });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setModalTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTask(null);
  };

  const handleSave = (saved) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    closeModal();
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    closeModal();
  };

  // ── Column task map ──
  const byColumn = useMemo(() => {
    const map = {};
    COLUMNS.forEach((c) => { map[c.key] = []; });
    filtered.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [filtered]);

  // ── By Person grouping ──
  const byPerson = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      if (!map[t.owner]) map[t.owner] = [];
      map[t.owner].push(t);
    });
    return map;
  }, [filtered]);

  // ── By Business grouping ──
  const byBiz = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      if (!map[t.business]) map[t.business] = [];
      map[t.business].push(t);
    });
    return map;
  }, [filtered]);

  const colStatus = (key) => COLUMNS.find((c) => c.key === key);

  return (
    <>
      <Topbar title="Task Manager" />

      <main className="p-6 max-w-[1800px] mx-auto w-full">
        {/* Page Header */}
        <PageHeader
          icon="📋"
          title="Task Manager"
          subtitle="Track, assign, and ship tasks across all businesses"
          actions={[
            {
              label: "+ New Task",
              variant: "primary",
              onClick: () => openNew("backlog"),
            },
          ]}
        />

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 bg-white min-w-[200px]">
            <Search size={13} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
            />
          </div>

          {/* Owner Filter */}
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="appearance-none border border-line rounded-lg px-3 py-2 pr-8 text-xs text-ink bg-white outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="All">All Owners</option>
              {USERS_DEFAULT.map((u) => (
                <option key={u.u} value={u.name}>{u.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Business Filter */}
          <div className="relative">
            <select
              value={bizFilter}
              onChange={(e) => setBizFilter(e.target.value)}
              className="appearance-none border border-line rounded-lg px-3 py-2 pr-8 text-xs text-ink bg-white outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="All">All Businesses</option>
              {BUSINESSES.map((b) => (
                <option key={b.slug} value={b.slug}>{b.emoji} {b.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none border border-line rounded-lg px-3 py-2 pr-8 text-xs text-ink bg-white outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="All">All Priorities</option>
              {["P0", "P1", "P2", "P3"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* View Tabs */}
          <div className="ml-auto flex items-center gap-1 bg-bg-shell rounded-lg p-1">
            {VIEW_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition",
                    activeView === tab.key
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted hover:text-ink"
                  )}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total Tasks",   value: kpis.total,       color: "#10b981", icon: "📋" },
            { label: "This Week",     value: kpis.thisWeek,    color: "#3b82f6", icon: "📅" },
            { label: "In Progress",   value: kpis.inProgress,  color: "#f59e0b", icon: "⚡" },
            { label: "Blocked",       value: kpis.blocked,     color: "#ef4444", icon: "🚫" },
            { label: "Done",          value: kpis.done,        color: "#10b981", icon: "✅" },
            { label: "AI Suggested",  value: kpis.aiSuggested, color: "#7c3aed", icon: "✨" },
          ].map((k) => (
            <div
              key={k.label}
              className="bg-white border border-line rounded-xl p-4"
              style={{ borderLeftWidth: 3, borderLeftColor: k.color }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wide">{k.label}</span>
                <span className="text-base">{k.icon}</span>
              </div>
              <div className="text-2xl font-bold text-ink">{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Kanban View ── */}
        {activeView === "kanban" && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.key}
                  column={col}
                  tasks={byColumn[col.key] || []}
                  onCardClick={openEdit}
                  onAddTask={openNew}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── By Person View ── */}
        {activeView === "by_person" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(byPerson).map(([person, personTasks]) => {
              const user = USERS_DEFAULT.find((u) => u.name === person);
              const color = user?.color || "#94a3b8";
              return (
                <div key={person} className="bg-white border border-line rounded-xl overflow-hidden">
                  {/* Person Header */}
                  <div className="px-4 py-3 border-b border-line flex items-center gap-3" style={{ borderTopWidth: 3, borderTopColor: color }}>
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: color }}
                    >
                      {getInitials(person)}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">{person}</p>
                      <p className="text-[10px] text-muted">{user?.role || ""}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-ink bg-bg-shell rounded-full px-2 py-0.5">
                      {personTasks.length}
                    </span>
                  </div>
                  {/* Task list */}
                  <div className="p-3 flex flex-col gap-2 max-h-[380px] overflow-y-auto">
                    {personTasks.map((t) => {
                      const col = colStatus(t.status);
                      const bizColor = BUSINESS_COLORS[t.business] || "#94a3b8";
                      return (
                        <div
                          key={t.id}
                          onClick={() => openEdit(t)}
                          className="p-2.5 rounded-lg border border-line cursor-pointer hover:shadow-sm transition"
                          style={{ borderLeftWidth: 3, borderLeftColor: bizColor }}
                        >
                          <p className="text-xs font-semibold text-ink leading-snug mb-1.5">{t.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <PriorityBadge priority={t.priority} />
                            {col && (
                              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", col.bgColor, col.textColor)}>
                                {col.label}
                              </span>
                            )}
                            <BusinessTag bizSlug={t.business} />
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => openNew()}
                      className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition mt-1"
                    >
                      <Plus size={10} /> Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── By Business View ── */}
        {activeView === "by_biz" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(byBiz).map(([slug, bizTasks]) => {
              const biz = BUSINESSES.find((b) => b.slug === slug);
              const color = BUSINESS_COLORS[slug] || "#94a3b8";
              return (
                <div key={slug} className="bg-white border border-line rounded-xl overflow-hidden">
                  {/* Business Header */}
                  <div className="px-4 py-3 border-b border-line flex items-center gap-2" style={{ borderTopWidth: 3, borderTopColor: color }}>
                    <span className="text-xl">{biz?.emoji || "🏢"}</span>
                    <span className="text-xs font-bold text-ink">{biz?.name || slug}</span>
                    <span className="ml-auto text-xs font-bold bg-bg-shell rounded-full px-2 py-0.5 text-ink">
                      {bizTasks.length}
                    </span>
                  </div>
                  {/* Task list */}
                  <div className="p-3 flex flex-col gap-2 max-h-[340px] overflow-y-auto">
                    {bizTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openEdit(t)}
                        className="p-2.5 rounded-lg border border-line cursor-pointer hover:shadow-sm transition"
                      >
                        <p className="text-xs font-semibold text-ink leading-snug mb-1.5">{t.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <PriorityBadge priority={t.priority} />
                          <OwnerAvatar name={t.owner} size="sm" />
                          <span className="text-[10px] text-muted">{t.owner.split(" ")[0]}</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => openNew()}
                      className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition mt-1"
                    >
                      <Plus size={10} /> Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── List View ── */}
        {activeView === "list" && (
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line bg-bg-soft">
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">ID</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Title</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Owner</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Business</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Priority</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Due</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted uppercase tracking-wide">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const col = colStatus(t.status);
                  const bizColor = BUSINESS_COLORS[t.business] || "#94a3b8";
                  const due = formatDue(t.due);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => openEdit(t)}
                      className="border-b border-line hover:bg-bg-soft cursor-pointer transition"
                    >
                      <td className="py-2.5 px-4">
                        <span className="font-mono text-[10px] text-muted">{t.id}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1 h-4 rounded-full shrink-0"
                            style={{ background: bizColor }}
                          />
                          <span className="font-semibold text-ink max-w-[260px] truncate">{t.title}</span>
                          {t.aiSuggested && <Sparkles size={10} className="text-purple shrink-0" />}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <OwnerAvatar name={t.owner} />
                          <span className="text-ink">{t.owner.split(" ")[0]}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <BusinessTag bizSlug={t.business} />
                      </td>
                      <td className="py-2.5 px-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-2.5 px-4">
                        {due && (
                          <span className={cn("font-medium", due.isOverdue ? "text-danger" : "text-muted")}>
                            {due.label}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {col && (
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", col.bgColor, col.textColor)}>
                            {col.label}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(t.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-bg-shell rounded text-[10px] text-muted font-medium">
                              {tag}
                            </span>
                          ))}
                          {(t.tags || []).length > 3 && (
                            <span className="text-[10px] text-muted">+{t.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Flag size={32} className="text-line mb-3" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-ink mb-1">No tasks found</p>
                <p className="text-xs text-muted">Try adjusting your filters or add a new task.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Task Modal ── */}
      {modalOpen && (
        <TaskModal
          task={modalTask?.id ? modalTask : { ...modalTask, status: modalTask?.status || defaultStatus }}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </>
  );
}
