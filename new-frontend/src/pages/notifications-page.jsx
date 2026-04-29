import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { api } from "@/api/client";

const KIND_EMOJI = {
  task: "✅",
  warning: "⚠️",
  lead: "📥",
  automation: "🔴",
  report: "📊",
  brain: "🧠",
};

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function markRead(id) {
    setReadIds((prev) => new Set([...prev, id]));
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

              {loading ? (
                <div className="px-5 py-6 text-sm text-muted">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-6 text-sm text-muted">No notifications yet.</div>
              ) : (
                <div className="divide-y divide-line">
                  {notifications.map((n) => {
                    const isRead = readIds.has(n.id);
                    const emoji = KIND_EMOJI[n.kind] || "🔔";
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          "flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-bg-soft/50 transition",
                          !isRead && "border-l-[3px] border-l-primary"
                        )}
                      >
                        <span className="text-base mt-0.5 shrink-0">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm text-ink leading-snug", !isRead && "font-semibold")}>
                            {n.title}{n.body ? ` — ${n.body}` : ""}
                          </p>
                          <p className="text-[11px] text-muted mt-1">{timeAgo(n.sent_at)}</p>
                        </div>
                        {!isRead && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            Unread
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
