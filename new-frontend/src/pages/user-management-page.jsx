import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { USERS_DEFAULT } from "@/lib/data";
import { cn, getInitials } from "@/lib/utils";
import { RefreshCw, Plus, Pencil, Link2, Trash2, Search } from "lucide-react";

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

const ROLE_COLORS = {
  COO: "bg-blue-100 text-blue-700",
  CEO: "bg-purple-100 text-purple-700",
  Developer: "bg-teal-100 text-teal-700",
  "Marketing Manager": "bg-orange-100 text-orange-700",
  "SEO/Social Media Head": "bg-pink-100 text-pink-700",
  "Social Media Creator": "bg-green-100 text-green-700",
  "GHL Expert": "bg-blue-100 text-blue-700",
  SDR: "bg-blue-100 text-blue-700",
  "General Outsourcer": "bg-gray-100 text-gray-700",
};

const ADMIN_ROLES = ["COO", "CEO", "Developer", "Marketing Manager"];

const UNIQUE_ROLES = [...new Set(USERS_DEFAULT.map((u) => u.role))];

export default function UserManagementPage() {
  const [search, setSearch] = useState("");

  const admins = USERS_DEFAULT.filter((u) => ADMIN_ROLES.includes(u.role));
  const teamMembers = USERS_DEFAULT.filter((u) => !ADMIN_ROLES.includes(u.role));

  const filtered = USERS_DEFAULT.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.u.toLowerCase().includes(q) ||
      (USER_EMAILS[u.u] || "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Topbar title="User Management" />
      <main className="p-6 max-w-[1400px] mx-auto w-full">
        <PageHeader
          icon="👤"
          title="User Management"
          subtitle="Manage team members and their access permissions"
          actions={[
            {
              label: "",
              icon: <RefreshCw size={14} />,
              onClick: () => {},
            },
            {
              label: "+ Add User",
              variant: "primary",
              onClick: () => {},
            },
          ]}
        />

        {/* KPI Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-line rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Total Users</div>
            <div className="text-3xl font-bold text-ink">{USERS_DEFAULT.length}</div>
          </div>
          <div className="bg-white border border-line rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Admins</div>
            <div className="text-3xl font-bold text-ink">{admins.length}</div>
          </div>
          <div className="bg-white border border-line rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Team Members</div>
            <div className="text-3xl font-bold text-ink">{teamMembers.length}</div>
          </div>
          <div className="bg-white border border-line rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Roles</div>
            <div className="text-3xl font-bold text-orange-500">{UNIQUE_ROLES.length}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, username, email, or role..."
            className="w-full pl-9 pr-4 py-2.5 border border-line rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-soft">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Username</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((user) => {
                const isAdmin = ADMIN_ROLES.includes(user.role);
                const email = USER_EMAILS[user.u] || "-";
                const badgeClass = ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700";

                return (
                  <tr key={user.u} className="hover:bg-bg-soft/50 transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: user.color }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-[13px]">{user.name}</div>
                          <div className="text-xs text-muted">No phone</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold", badgeClass)}>
                        {user.role}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-[13px] text-ink">{email}</td>

                    {/* Username */}
                    <td className="px-5 py-3.5 text-[13px] text-muted font-mono">{user.u}</td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg-soft transition-colors"
                          title="Edit user"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg-soft transition-colors"
                          title="Copy link"
                        >
                          <Link2 size={14} />
                        </button>
                        {!isAdmin && (
                          <button
                            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
