import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn, getInitials } from "@/lib/utils";
import { USERS_DEFAULT } from "@/lib/data";
import { api } from "@/api/client";
import { Plus, Loader2 } from "lucide-react";

const TASK_COUNTS = {
  gaurav: 8, nadia: 5, nikhil: 4, ruhith: 5, maryam: 6, fatima: 3, veena: 7, contractor1: 3, abhishek: 4, sona: 6,
};

export default function TeamHubPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [members, setMembers] = useState(USERS_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [taskCounts, setTaskCounts] = useState(TASK_COUNTS);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [people, tasks] = await Promise.all([api.people(), api.tasks()]);
        if (cancelled) return;
        if (people?.length) {
          setMembers(people.map(p => ({
            u: p.username || p.name?.toLowerCase().split(" ")[0],
            name: p.name,
            role: p.role,
            color: USERS_DEFAULT.find(u => u.name === p.name)?.color || "#94a3b8",
          })));
        }
        if (tasks?.length) {
          const counts = {};
          tasks.forEach(t => {
            const owner = t.owner_name || t.owner || "";
            const key = owner.toLowerCase().split(" ")[0];
            counts[key] = (counts[key] || 0) + 1;
          });
          setTaskCounts(prev => ({ ...prev, ...counts }));
        }
      } catch {
        // use defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const admins = members.filter(m => ["CEO", "COO", "Developer"].includes(m.role)).length;
  const managers = members.filter(m => m.role?.toLowerCase().includes("lead") || m.role?.toLowerCase().includes("manager") || m.role?.toLowerCase().includes("head") || ["CEO", "COO"].includes(m.role)).length;

  return (
    <>
      <Topbar title="Team / People" subtitle="Manage your team and roles" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter
          mode={mode}
          setMode={setMode}
          activeBiz={activeBiz}
          setActiveBiz={setActiveBiz}
          rightAction={
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              <Plus size={14} />
              Invite Member
            </button>
          }
        />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* KPI Strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Members", value: members.length, color: "#7c3aed" },
                { label: "Admins", value: admins, color: "#7c3aed" },
                { label: "Managers", value: managers, color: "#7c3aed" },
                { label: "Active", value: members.length, color: "#7c3aed" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white border border-line rounded-xl p-5">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Team Table */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Member</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Username</th>
                      <th className="text-center px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Tasks</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.u} className="border-b border-line last:border-b-0 hover:bg-bg-soft/50 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: member.color }}
                            >
                              {getInitials(member.name)}
                            </div>
                            <span className="text-sm font-semibold text-ink">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted">{member.role}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted font-mono">{member.u}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-sm font-semibold text-ink">{taskCounts[member.u] || 0}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
