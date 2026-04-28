import { getInitials } from "@/lib/utils";
import { USERS_DEFAULT } from "@/lib/data";
import { ChevronRight, Mic, Plus, Upload, UserPlus, Calendar, Megaphone } from "lucide-react";

const AUTOMATIONS = [
  { code: "DT", label: "Daily Task Brief", schedule: "Every day at 08:00 AM" },
  { code: "TR", label: "Task Reminders", schedule: "Every 2 hours" },
  { code: "WR", label: "Weekly Reports", schedule: "Every Monday 09:00" },
  { code: "LF", label: "Lead Follow-up", schedule: "Every 24 hours" },
];

const RECENT_ACTIVITY = [
  { icon: "+", color: "#10b981", text: "New task assigned to Maryam", time: "2 min ago" },
  { icon: "M", color: "#7c3aed", text: "Report 'Cash_Flash.pdf' analysed", time: "15 min ago" },
  { icon: "C", color: "#ef4444", text: "Campaign 'Free CBCT' optimised", time: "1 hour ago" },
  { icon: "P", color: "#3b82f6", text: "Payment received from Sarah Patel", time: "2 hours ago" },
];

const QUICK_ACTIONS = [
  { icon: Plus, label: "Create New Task" },
  { icon: Upload, label: "Upload Report / File" },
  { icon: UserPlus, label: "Add New Lead" },
  { icon: Calendar, label: "Schedule Meeting" },
  { icon: Megaphone, label: "Send Announcement" },
];

export default function RightSidebar() {
  return (
    <div className="w-[280px] shrink-0 space-y-5">
      {/* AI Voice Assistant */}
      <div className="bg-white border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Mic size={14} className="text-primary" />
            AI Voice Assistant
          </h3>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                <Mic size={16} />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Click to speak or type your command</p>
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
          <span className="text-[10px] font-bold text-primary">{AUTOMATIONS.length} active</span>
        </div>
        <div className="space-y-3">
          {AUTOMATIONS.map((auto) => (
            <div key={auto.code} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-primary shrink-0 bg-primary-soft">
                {auto.code}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{auto.label}</p>
                <p className="text-[10px] text-muted">{auto.schedule}</p>
              </div>
              <span className="text-[10px] font-bold text-primary">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-line rounded-xl p-5">
        <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <span className="text-base">📋</span>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: item.color }}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink leading-snug">{item.text}</p>
                <p className="text-[10px] text-muted mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Avatars */}
      <div className="flex items-center gap-1 px-1">
        {USERS_DEFAULT.slice(0, 8).map((u) => (
          <div
            key={u.u}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 cursor-pointer hover:opacity-80 transition"
            style={{ background: u.color }}
            title={u.name}
          >
            {getInitials(u.name)}
          </div>
        ))}
      </div>
    </div>
  );
}
