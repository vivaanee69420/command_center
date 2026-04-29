import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { api } from "@/api/client";
import { MessageSquare, RefreshCw, AlertCircle, Building2 } from "lucide-react";

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ConversationsPage() {
  const [activeMode, setActiveMode] = useState("all");
  const [conversations, setConversations] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [filterSlug, setFilterSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ghlErrors, setGhlErrors] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [convData, bizData] = await Promise.all([
        api.conversations(filterSlug || null),
        api.businesses(),
      ]);
      setConversations(convData.conversations || []);
      setGhlErrors(convData.errors || []);
      setBusinesses(bizData.businesses || bizData || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterSlug]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  async function openConversation(convo) {
    setSelectedConvo(convo);
    setMessages([]);
    setMessagesLoading(true);
    try {
      const data = await api.conversationMessages(convo.id, convo.slug);
      setMessages(data.messages || []);
    } catch (e) {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  // Filter by channel based on mode
  const filtered = conversations.filter((c) => {
    if (activeMode === "all") return true;
    const ch = (c.channel || "").toLowerCase();
    if (activeMode === "whatsapp") return ch === "whatsapp";
    if (activeMode === "sms") return ch === "sms";
    if (activeMode === "email") return ch === "email";
    return true;
  });

  const unreadCount = filtered.filter((c) => c.unread > 0).length;

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Conversations"
        subtitle="Unified inbox · WhatsApp · SMS · Email · GHL"
      />

      <div className="flex flex-col flex-1 overflow-auto p-6 gap-4">
        <div className="flex items-center gap-3">
          <ModeFilter activeMode={activeMode} onModeChange={setActiveMode} />

          {/* Sub-account filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Building2 className="w-4 h-4 text-muted" />
            <select
              value={filterSlug}
              onChange={(e) => setFilterSlug(e.target.value)}
              className="text-sm border border-line rounded-lg px-3 py-1.5 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All practices</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.slug}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={loadConversations}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-bg-soft border border-line text-muted"
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* GHL errors banner */}
        {ghlErrors.length > 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Token issues: {ghlErrors.map((e) => `${e.slug} (${e.error})`).join(", ")}.
              Regenerate tokens in GHL dashboard.
            </span>
          </div>
        )}

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Conversation list */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white border border-line rounded-xl overflow-hidden flex flex-col flex-1">
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">
                  {filterSlug ? businesses.find(b => b.slug === filterSlug)?.name || filterSlug : "All Practices"}
                </span>
                <span className="text-sm text-muted">
                  {loading ? "…" : `${filtered.length} · ${unreadCount} unread`}
                </span>
              </div>

              <div className="divide-y divide-line overflow-auto flex-1">
                {loading && (
                  <div className="px-5 py-8 text-center text-sm text-muted">
                    Loading conversations…
                  </div>
                )}

                {error && !loading && (
                  <div className="px-5 py-8 text-center text-sm text-red-500">
                    {error}
                  </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <MessageSquare className="w-8 h-8 text-muted mx-auto mb-3" />
                    <p className="text-sm font-medium text-ink">No conversations</p>
                    <p className="text-xs text-muted mt-1">
                      {ghlErrors.length > 0
                        ? "GHL tokens need renewal — see banner above"
                        : "GHL sync pending or no active conversations"}
                    </p>
                  </div>
                )}

                {!loading && filtered.map((convo) => (
                  <div
                    key={convo.id}
                    onClick={() => openConversation(convo)}
                    className={cn(
                      "px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-bg-soft/50 transition-colors",
                      convo.unread > 0 && "border-l-[3px] border-l-primary",
                      selectedConvo?.id === convo.id && "bg-primary/5"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {(convo.name || "?")[0].toUpperCase()}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm text-ink", convo.unread > 0 && "font-bold")}>
                          {convo.name}
                        </p>
                        <span className="text-xs text-muted shrink-0">
                          {relativeTime(convo.last_message_at)}
                        </span>
                      </div>

                      <p className="text-xs text-muted truncate">
                        {convo.preview || "No messages yet"}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "inline px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          convo.channel_class || "bg-gray-100 text-gray-700"
                        )}>
                          {convo.channel}
                        </span>
                        <span className="text-[10px] text-muted">{convo.business}</span>
                        {convo.unread > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {convo.unread > 9 ? "9+" : convo.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message thread panel */}
          {selectedConvo && (
            <div className="w-96 flex flex-col bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line">
                <p className="font-bold text-ink text-sm">{selectedConvo.name}</p>
                <p className="text-xs text-muted">{selectedConvo.business} · {selectedConvo.channel}</p>
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
                {messagesLoading && (
                  <p className="text-sm text-muted text-center py-4">Loading messages…</p>
                )}
                {!messagesLoading && messages.length === 0 && (
                  <p className="text-sm text-muted text-center py-4">No messages loaded</p>
                )}
                {!messagesLoading && messages.map((msg, i) => {
                  const isInbound = msg.direction === "inbound" || msg.type === 1;
                  return (
                    <div key={i} className={cn("flex", isInbound ? "justify-start" : "justify-end")}>
                      <div className={cn(
                        "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                        isInbound
                          ? "bg-bg-soft text-ink"
                          : "bg-primary text-white"
                      )}>
                        {msg.body || msg.message || msg.text || "(no content)"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
