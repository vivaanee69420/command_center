import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  { id: 1, emoji: "⚠️", text: "Low leads today at Ashford — only 2 leads received. Daily target is 20+.", time: "2 min ago", read: false },
  { id: 2, emoji: "✅", text: "Task completed: Fix Rochester funnel — marked done by Ruhith Pasha.", time: "8 min ago", read: false },
  { id: 3, emoji: "🧠", text: "AI Brain regenerated — 5 new directives and 2 warnings generated.", time: "1 hour ago", read: false },
  { id: 4, emoji: "📥", text: "New lead from Google Ads — Priya Mehta via Campaign: Ashford Implants. CPL: £62.", time: "1 hour ago", read: true },
  { id: 5, emoji: "🔴", text: "Automation failed: SMS quota exceeded — 'No-show follow-up' failed for 3 contacts.", time: "2 hours ago", read: true },
  { id: 6, emoji: "📊", text: "Weekly report ready — performance report for 21–27 April. Revenue +8.3% vs last week.", time: "3 hours ago", read: true },
];

export default function NotificationsPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <>
      <Topbar title="Notifications" subtitle="Stay on top of alerts and updates" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter
          mode={mode}
          setMode={setMode}
          activeBiz={activeBiz}
          setActiveBiz={setActiveBiz}
        />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">All Notifications</h2>
                <span className="text-xs text-muted">{notifications.length} total</span>
              </div>

              <div className="divide-y divide-line">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-bg-soft/50 transition",
                      !n.read && "border-l-[3px] border-l-primary"
                    )}
                  >
                    <span className="text-base mt-0.5 shrink-0">{n.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm text-ink leading-snug", !n.read && "font-semibold")}>
                        {n.text}
                      </p>
                      <p className="text-[11px] text-muted mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        Unread
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
