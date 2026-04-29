import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { USERS_DEFAULT, BUSINESSES } from "@/lib/data";
import { cn, getInitials } from "@/lib/utils";
import { api } from "@/api/client";
import {
  Search, Plus, Pencil, UserX, Users, ShieldCheck, Layers,
  UserPlus, ChevronDown, X, Loader2, ChevronRight, Eye, EyeOff, Check
} from "lucide-react";

// ── Role configuration ────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  CEO: { bg: "bg-purple-100", text: "text-purple-700", color: "#7c3aed" },
  COO: { bg: "bg-indigo-100", text: "text-indigo-700", color: "#6d28d9" },
  Developer: { bg: "bg-blue-100", text: "text-blue-700", color: "#2e75b6" },
  "Marketing Manager": { bg: "bg-amber-100", text: "text-amber-700", color: "#f59e0b" },
  "SEO/Social Media Head": { bg: "bg-pink-100", text: "text-pink-700", color: "#ec4899" },
  "Social Media Creator": { bg: "bg-green-100", text: "text-green-700", color: "#10b981" },
  "GHL Expert": { bg: "bg-teal-100", text: "text-teal-700", color: "#14b8a6" },
  SDR: { bg: "bg-blue-100", text: "text-blue-700", color: "#3b82f6" },
  "General Outsourcer": { bg: "bg-slate-100", text: "text-slate-600", color: "#94a3b8" },
};

const ALL_ROLES = Object.keys(ROLE_CONFIG);

// Modelled after ROLE_SCOPES pattern from security.py
const ROLE_PERMISSIONS = {
  CEO: {
    description: "Full platform access, all businesses and modules",
    scopes: ["All businesses", "All tasks", "User management", "AI Brain", "Financials", "Integrations", "Reports", "Settings"],
    level: "full",
  },
  COO: {
    description: "Full operational access across all businesses",
    scopes: ["All businesses", "All tasks", "User management", "AI Brain", "Financials", "Integrations", "Reports"],
    level: "full",
  },
  Developer: {
    description: "Technical access — API, integrations, system settings",
    scopes: ["System settings", "Integrations", "API access", "All tasks (read)", "Reports"],
    level: "technical",
  },
  "Marketing Manager": {
    description: "Marketing, ads, campaigns across all businesses",
    scopes: ["Ad campaigns", "Leads", "Marketing tasks", "Content", "GSC/Meta/Google Ads", "Reports"],
    level: "department",
  },
  "SEO/Social Media Head": {
    description: "SEO strategy, social channels, content planning",
    scopes: ["SEO tools", "Social media", "Content calendar", "Assigned tasks"],
    level: "specialist",
  },
  "Social Media Creator": {
    description: "Content creation, scheduling, platform publishing",
    scopes: ["Content creation", "Social scheduling", "Assigned tasks"],
    level: "specialist",
  },
  "GHL Expert": {
    description: "GoHighLevel CRM, automations, pipeline management",
    scopes: ["GHL pipelines", "Automations", "Leads", "Assigned tasks"],
    level: "specialist",
  },
  SDR: {
    description: "Sales development, outreach, lead qualification",
    scopes: ["Leads", "Outreach tasks", "Assigned tasks", "Pipeline view"],
    level: "limited",
  },
  "General Outsourcer": {
    description: "Limited access — assigned tasks only",
    scopes: ["Assigned tasks only"],
    level: "limited",
  },
};

const LEVEL_COLORS = {
  full: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  technical: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  department: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  specialist: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  limited: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
};

const USER_EMAILS = {
  gaurav: "gaurav@gm-dental.co.uk",
  nadia: "nadia@gm-dental.co.uk",
  ruhith: "ruhithpasha813@gmail.com",
  nikhil: "nikhil@gmail.com",
  fatima: "fatima@gm-dental.co.uk",
  abhishek: "abhishek@gm-dental.co.uk",
  maryam: "maryam@gm-dental.co.uk",
  sona: "sona@gm-dental.co.uk",
  veena: "veena@gm-dental.co.uk",
  contractor1: "contractor@example.com",
};

// LAST_LOGINS removed — last_login_at field not yet on Person model (pending).

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 9 }) {
  const sizeClass = size === 9 ? "w-9 h-9 text-xs" : "w-8 h-8 text-xs";
  return (
    <div
      className={cn("rounded-full flex items-center justify-center text-white font-bold shrink-0", sizeClass)}
      style={{ backgroundColor: user.color || "#94a3b8" }}
    >
      {getInitials(user.name || user.u || "?")}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, color = "#7c3aed", icon: Icon, sub }) {
  return (
    <div className="bg-white border border-line rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-ink">{value}</div>
        <div className="text-xs text-muted">{label}</div>
        {sub && <div className="text-[11px] text-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── User Modal ────────────────────────────────────────────────────────────────
function UserModal({ user, onClose }) {
  const isEdit = !!user;
  const [form, setForm] = useState(
    user
      ? { name: user.name, username: user.u || "", role: user.role, password: "", businesses: [] }
      : { name: "", username: "", role: "SDR", password: "", businesses: [] }
  );
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Decorative — no real API call
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-sm font-bold text-ink">{isEdit ? "Edit User" : "Add New User"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:bg-bg-soft transition">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-ink mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Jane Smith"
              required
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-semibold text-ink mb-1.5 block">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. janesmith"
              required
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm text-ink font-mono placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-ink mb-1.5 block">
              {isEdit ? "New Password (leave blank to keep)" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={isEdit ? "••••••••" : "Min 6 characters"}
                required={!isEdit}
                className="w-full border border-line rounded-lg px-3 py-2.5 pr-10 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-ink mb-1.5 block">Role</label>
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full appearance-none border border-line rounded-lg px-3 py-2.5 pr-8 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
              >
                {ALL_ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Business Assignments */}
          <div>
            <label className="text-xs font-semibold text-ink mb-1.5 block">Business Assignments</label>
            <div className="flex flex-wrap gap-2">
              {BUSINESSES.map((b) => {
                const sel = form.businesses.includes(b.slug);
                return (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        businesses: sel
                          ? form.businesses.filter((x) => x !== b.slug)
                          : [...form.businesses, b.slug],
                      })
                    }
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition",
                      sel
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-white border-line text-muted hover:border-primary/40"
                    )}
                  >
                    {sel && <Check size={9} />}
                    {b.emoji} {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-line rounded-lg text-xs font-semibold text-muted hover:bg-bg-soft transition">
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Deactivate Confirm ────────────────────────────────────────────────────────
function DeactivateModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <UserX size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Deactivate User</h2>
            <p className="text-xs text-muted">This action can be reversed</p>
          </div>
        </div>
        <p className="text-sm text-ink mb-5">
          Are you sure you want to deactivate <strong>{user.name}</strong>? They will lose access to CommandOS.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-line rounded-lg text-xs font-semibold text-muted hover:bg-bg-soft transition">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition"
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Role Permissions Section ───────────────────────────────────────────────────
function RolePermissionsSection() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-ink">Role Permissions</h2>
        <p className="text-xs text-muted mt-0.5">Expandable overview of what each role can access</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {ALL_ROLES.map((role) => {
          const perm = ROLE_PERMISSIONS[role];
          const cfg = ROLE_CONFIG[role] || {};
          const level = LEVEL_COLORS[perm.level];
          const isOpen = expanded === role;

          return (
            <div
              key={role}
              className={cn("bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-md", level.border)}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : role)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.color || "#64748b" }}
                  />
                  <span className="text-[13px] font-semibold text-ink">{role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", level.bg, level.text)}>
                    {perm.level}
                  </span>
                  <ChevronRight size={13} className={cn("text-muted transition-transform", isOpen && "rotate-90")} />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-line">
                  <p className="text-[11px] text-muted mt-2 mb-3">{perm.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {perm.scopes.map((scope) => (
                      <span
                        key={scope}
                        className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md", level.bg, level.text)}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState(null); // null | { type: "add" | "edit" | "deactivate", user? }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.people();
        setUsers(Array.isArray(data) && data.length ? data : USERS_DEFAULT);
      } catch {
        setUsers(USERS_DEFAULT);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueRoles = useMemo(() => [...new Set(users.map((u) => u.role))], [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const email = USER_EMAILS[u.u || u.username] || "";
      const matchSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.u || u.username || "").toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  // KPIs
  const activeCount = users.length; // decorative: treat all as active
  const lastAdded = users[users.length - 1]?.name || "-";

  return (
    <>
      <Topbar title="User Management" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="👤"
          title="User Management"
          subtitle="Manage team members, roles, and access permissions"
          actions={[
            {
              label: "Add User",
              variant: "purple",
              icon: <UserPlus size={13} />,
              onClick: () => setModal({ type: "add" }),
            },
          ]}
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total Users" value={users.length} icon={Users} color="#7c3aed" />
          <KpiCard label="Active" value={activeCount} icon={ShieldCheck} color="#10b981" sub="All accounts active" />
          <KpiCard label="Roles" value={uniqueRoles.length} icon={Layers} color="#f59e0b" />
          <KpiCard label="Last Added" value={lastAdded.split(" ")[0]} icon={UserPlus} color="#3b82f6" />
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, email, or role..."
              className="w-full pl-9 pr-4 py-2.5 border border-line rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none border border-line rounded-lg px-3 py-2.5 pr-8 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((r) => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
          >
            <Plus size={14} />
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-soft">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Username</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Last Login</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((user, idx) => {
                    const username = user.u || user.username;
                    const email = USER_EMAILS[username] || (username ? `${username}@gm-dental.co.uk` : "-");
                    const roleCfg = ROLE_CONFIG[user.role] || { bg: "bg-slate-100", text: "text-slate-600", color: "#94a3b8" };
                    const isProtected = ["CEO", "COO", "Developer"].includes(user.role);

                    return (
                      <tr key={username || idx} className="hover:bg-bg-soft/60 transition-colors">
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} size={9} />
                            <div>
                              <p className="text-[13px] font-semibold text-ink">{user.name}</p>
                              <p className="text-[11px] text-muted">{email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-5 py-3.5">
                          <span className="text-[12px] font-mono text-muted bg-bg-shell px-2 py-0.5 rounded">{username}</span>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-3.5">
                          <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold", roleCfg.bg, roleCfg.text)}>
                            {user.role}
                          </span>
                        </td>

                        {/* Email (full) */}
                        <td className="px-5 py-3.5 text-[12px] text-muted">{email}</td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            Active
                          </span>
                        </td>

                        {/* Last Login — pending: last_login_at not yet on Person model */}
                        <td className="px-5 py-3.5 text-[12px] text-muted">
                          <span className="inline-flex items-center gap-1 text-amber-600 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setModal({ type: "edit", user })}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line text-[11px] font-medium text-muted hover:text-ink hover:bg-bg-soft transition"
                              title="Edit user"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            {!isProtected && (
                              <button
                                onClick={() => setModal({ type: "deactivate", user })}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-medium text-red-500 hover:bg-red-50 transition"
                                title="Deactivate user"
                              >
                                <UserX size={12} />
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">
                        No users match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role Permissions */}
        <RolePermissionsSection />
      </main>

      {/* Modals */}
      {modal?.type === "add" && <UserModal onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <UserModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === "deactivate" && <DeactivateModal user={modal.user} onClose={() => setModal(null)} />}
    </>
  );
}
