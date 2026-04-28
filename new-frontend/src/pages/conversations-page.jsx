import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";

const CONVERSATIONS = [
  {
    id: 1,
    name: "Sarah Patel",
    preview: "Yes — Tuesday 2pm works for me. Do I need to bring anything?",
    channel: "WhatsApp",
    channelClass: "bg-green-100 text-green-700",
    time: "12 min ago",
    unread: 1,
  },
  {
    id: 2,
    name: "James O'Connor",
    preview: "What's the deposit on composite bonding? Just want costs upfront.",
    channel: "SMS",
    channelClass: "bg-blue-100 text-blue-700",
    time: "38 min ago",
    unread: 2,
  },
  {
    id: 3,
    name: "Emma Robinson",
    preview: "Thanks for the proposal. My wife and I want to discuss tonight.",
    channel: "Email",
    channelClass: "bg-gray-100 text-gray-700",
    time: "2 h ago",
    unread: 0,
  },
  {
    id: 4,
    name: "Linda Cooper",
    preview: "AI Voice: Booked her in for Friday 11am with Dr. Mehta.",
    channel: "Bland AI",
    channelClass: "bg-purple-100 text-purple-700",
    time: "4 h ago",
    unread: 0,
  },
];

export default function ConversationsPage() {
  const [activeMode, setActiveMode] = useState("all");

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Conversations"
        subtitle="Unified inbox · WhatsApp · SMS · Email · Voice"
      />

      <div className="flex flex-col flex-1 overflow-auto p-6 gap-4">
        <ModeFilter activeMode={activeMode} onModeChange={setActiveMode} />

        <div className="flex gap-6 flex-1">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Recent section */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {/* Section header */}
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">Recent</span>
                <span className="text-sm text-muted">4</span>
              </div>

              {/* Conversation list */}
              <div className="divide-y divide-line">
                {CONVERSATIONS.map((convo) => (
                  <div
                    key={convo.id}
                    className={cn(
                      "px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-bg-soft/50",
                      convo.unread > 0 && "border-l-[3px] border-l-primary"
                    )}
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      {/* Name + preview on same line */}
                      <p className="text-sm text-ink leading-snug">
                        <span className="font-bold">{convo.name}</span>
                        <span className="text-muted">
                          {" "}
                          · {convo.preview}
                        </span>
                      </p>

                      {/* Channel badge + time + unread */}
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            convo.channelClass
                          )}
                        >
                          {convo.channel}
                        </span>
                        <span className="text-xs text-muted">{convo.time}</span>
                        {convo.unread > 0 && (
                          <span className="text-xs font-semibold text-red-500">
                            · {convo.unread} unread
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
