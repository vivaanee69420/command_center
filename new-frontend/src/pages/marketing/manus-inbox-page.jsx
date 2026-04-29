import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, getInitials } from "@/lib/utils";
import {
  Search, Send, Archive, CheckCheck, Star, Clock,
  Bot, FileText, Mail, MailOpen, ChevronDown, ChevronUp, X
} from "lucide-react";

const PRACTICES = ["All Practices", "GM Dental - Luton", "GM Dental - Watford", "GM Dental - Harrow", "GM Dental - Wembley"];
const STATUS_FILTERS = ["All", "Unread", "Read", "Replied"];

// MESSAGES, AUTO_REPLIES, TEMPLATES removed — requires Manus/email messaging backend.
const MESSAGES = [];
const AUTO_REPLIES = [];
const TEMPLATES = [];

export default function ManusInboxPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [practiceFilter, setPracticeFilter] = useState("All Practices");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateEdits, setTemplateEdits] = useState({});

  const unread = MESSAGES.filter((m) => m.status === "Unread").length;
  const repliedToday = MESSAGES.filter((m) => m.status === "Replied" && (m.time.includes("AM") || m.time.includes("PM"))).length;

  const KPI = [
    { label: "Unread Messages", value: unread, color: "#ef4444" },
    { label: "Replied Today", value: repliedToday, color: "#10b981" },
    { label: "Avg Response Time", value: "4m 12s", color: "#7c3aed" },
    { label: "Auto-Replies Sent", value: AUTO_REPLIES.length, color: "#3b82f6" },
  ];

  const filtered = useMemo(() => MESSAGES.filter((m) => {
    const matchSearch = !search || m.sender.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    const matchPractice = practiceFilter === "All Practices" || m.practice === practiceFilter;
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchPractice && matchStatus;
  }), [search, practiceFilter, statusFilter]);

  const TABS = [
    { key: "inbox", label: "Inbox", count: MESSAGES.length },
    { key: "sent", label: "Sent", count: MESSAGES.filter(m => m.status === "Replied").length },
    { key: "auto", label: "Auto-Replies", count: AUTO_REPLIES.length },
    { key: "templates", label: "Templates", count: TEMPLATES.length },
  ];

  const STATUS_STYLE = {
    Unread: "bg-red-50 text-red-600",
    Read: "bg-slate-100 text-slate-500",
    Replied: "bg-green-50 text-green-600",
  };

  return (
    <>
      <Topbar title="Manus Inbox" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📬"
          title="Manus Inbox"
          subtitle="AI-powered message centre — patient enquiries, replies, templates"
        />

        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Manus Messaging Backend</p>
            <p className="text-xs text-amber-600 leading-relaxed">The inbox requires a messaging backend that connects to patient enquiry channels (email, web form, WhatsApp). Add a <code className="font-mono bg-amber-100 px-1 rounded">message</code> model, <code className="font-mono bg-amber-100 px-1 rounded">GET /api/messages</code> endpoint, and integrate the AI auto-reply pipeline. Templates and sent messages are also backend-dependent.</p>
          </div>
        </div>

        {/* Tabs (disabled until backend exists) */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-4 w-fit mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5",
                activeTab === tab.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab.label}
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-line text-muted")}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Inbox Tab */}
        {(activeTab === "inbox" || activeTab === "sent") && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-white w-56">
                <Search size={13} className="text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
                />
              </div>
              <select value={practiceFilter} onChange={(e) => setPracticeFilter(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white">
                {PRACTICES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white">
                {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              {filtered
                .filter((m) => activeTab === "sent" ? m.status === "Replied" : true)
                .map((msg) => {
                  const isExpanded = expandedMsg === msg.id;
                  return (
                    <div key={msg.id} className={cn("bg-white border rounded-xl overflow-hidden transition",
                      msg.status === "Unread" ? "border-primary/30" : "border-line",
                      isExpanded ? "shadow-sm" : "hover:shadow-sm cursor-pointer"
                    )}>
                      {/* Row */}
                      <div className="flex items-start gap-3 p-4" onClick={() => setExpandedMsg(isExpanded ? null : msg.id)}>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(msg.sender)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={cn("text-sm font-semibold text-ink", msg.status === "Unread" && "font-bold")}>
                              {msg.sender}
                            </span>
                            {msg.priority && <Star size={11} className="text-amber-400 fill-amber-400" />}
                            <span className="text-[10px] bg-bg-shell text-muted px-2 py-0.5 rounded-full">{msg.practice}</span>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto", STATUS_STYLE[msg.status])}>
                              {msg.status}
                            </span>
                          </div>
                          <div className={cn("text-xs text-ink mb-0.5", msg.status === "Unread" && "font-semibold")}>{msg.subject}</div>
                          <div className="text-xs text-muted truncate">{msg.preview}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] text-muted whitespace-nowrap">{msg.time}</span>
                          {isExpanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="border-t border-line px-4 pb-4 pt-3">
                          <p className="text-xs text-ink leading-relaxed mb-4 bg-bg-soft rounded-lg p-3">{msg.body}</p>
                          <div className="flex gap-2 mb-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-soft text-muted hover:text-ink border border-line transition">
                              <CheckCheck size={12} /> Mark as Read
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-soft text-muted hover:text-ink border border-line transition">
                              <Archive size={12} /> Archive
                            </button>
                          </div>
                          <div className="border border-line rounded-lg overflow-hidden">
                            <textarea
                              rows={3}
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs outline-none resize-none text-ink placeholder:text-muted"
                            />
                            <div className="flex items-center justify-between px-3 py-2 border-t border-line bg-bg-soft">
                              <span className="text-[10px] text-muted">Replying to {msg.sender}</span>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition">
                                <Send size={11} /> Send Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Auto-Replies Tab */}
        {activeTab === "auto" && (
          <div className="space-y-4">
            {AUTO_REPLIES.map((ar) => (
              <div key={ar.id} className="bg-white border border-line rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-bg-soft">
                  <div className="flex items-center gap-2">
                    <Bot size={14} className="text-primary" />
                    <span className="text-xs font-bold text-ink">{ar.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">
                      {ar.confidence}% confidence
                    </span>
                    <span className="text-[10px] text-muted">{ar.sentAt}</span>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Mail size={11} /> Original from {ar.originalSender}
                    </p>
                    <p className="text-xs text-muted bg-bg-soft rounded-lg p-3 leading-relaxed">{ar.original}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Bot size={11} /> AI Auto-Reply Sent
                    </p>
                    <p className="text-xs text-ink bg-primary-soft rounded-lg p-3 leading-relaxed">{ar.aiReply}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-3">
            {TEMPLATES.map((tpl) => {
              const isEditing = editingTemplate === tpl.id;
              const currentBody = templateEdits[tpl.id] ?? tpl.body;
              return (
                <div key={tpl.id} className="bg-white border border-line rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-line">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-muted" />
                      <span className="text-sm font-bold text-ink">{tpl.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (isEditing) setEditingTemplate(null);
                          else setEditingTemplate(tpl.id);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {isEditing ? "Done" : "Edit"}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {isEditing ? (
                      <textarea
                        rows={5}
                        value={currentBody}
                        onChange={(e) => setTemplateEdits((prev) => ({ ...prev, [tpl.id]: e.target.value }))}
                        className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition resize-none"
                      />
                    ) : (
                      <p className="text-xs text-muted leading-relaxed">{currentBody}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
