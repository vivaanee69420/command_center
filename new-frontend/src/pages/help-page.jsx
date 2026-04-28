import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import {
  Search, ChevronDown, ChevronRight, CheckCircle,
  Rocket, ClipboardList, Megaphone, Users, Brain, Plug,
  Mail, MessageSquare, Book, FileText, GitBranch, ExternalLink,
  Keyboard, LifeBuoy,
} from "lucide-react";

// ── Quick link cards ──────────────────────────────────────────────────────────
const QUICK_LINKS = [
  {
    id: "getting-started",
    icon: <Rocket size={20} />,
    title: "Getting Started",
    description: "Set up your workspace, add businesses and invite team members.",
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    id: "managing-tasks",
    icon: <ClipboardList size={20} />,
    title: "Managing Tasks",
    description: "Create, assign, and track tasks with the ExecutionGuard system.",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    id: "marketing-os",
    icon: <Megaphone size={20} />,
    title: "Marketing OS",
    description: "Run ads, manage leads, and track campaign performance across channels.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    id: "team-management",
    icon: <Users size={20} />,
    title: "Team Management",
    description: "Manage roles, permissions, and daily routines for your team.",
    color: "#10b981",
    bg: "#ecfdf5",
  },
  {
    id: "ai-brain",
    icon: <Brain size={20} />,
    title: "AI Brain",
    description: "Understand how the AI generates directives, warnings, and tasks.",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    id: "integrations",
    icon: <Plug size={20} />,
    title: "Integrations",
    description: "Connect Google Ads, Meta, GoHighLevel, Dentally, and more.",
    color: "#ef4444",
    bg: "#fff1f2",
  },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How do I add a new team member?",
    a: "Navigate to User Management via the sidebar (Team section). Click \"Add User\", fill in their name, email, and assign a role. They will receive an invite email with login credentials. Roles define which modules and businesses each user can access.",
  },
  {
    q: "How does the AI Brain work?",
    a: "The AI Brain runs every 60 minutes via a background scheduler. It reads the last 30 days of telemetry — tasks, revenue, leads, ad spend — then asks Claude for the top 5 strategic directives and any active warnings. High-confidence directives are automatically converted into assigned tasks.",
  },
  {
    q: "How do I connect Google Ads?",
    a: "Go to Integrations in the sidebar and click \"Connect\" next to Google Ads. You will be redirected to a Google OAuth flow. Once authorised, your campaigns and spend data will sync automatically. Refresh intervals are set per integration.",
  },
  {
    q: "What are daily routines?",
    a: "Daily Routines are recurring task checklists assigned to specific roles. They ensure consistent execution of key activities — such as checking ad performance, reviewing leads, or running end-of-day reconciliations. Routines reset each day and progress is tracked per team member.",
  },
  {
    q: "How do I create automation rules?",
    a: "Navigate to GHL Automation or the Automations section in Settings. Click \"Add Rule\", choose a trigger (e.g. lead created, task overdue), set conditions, and define an action (e.g. send SMS, assign task, update pipeline stage). Rules run automatically when conditions are met.",
  },
  {
    q: "How do I track SEO rankings?",
    a: "The SEO Tracking page pulls data from Google Search Console via OAuth. Once connected, you can monitor keyword positions, impression trends, and click-through rates per business. Competitor tracking is available on the Competitor AI page.",
  },
  {
    q: "How do I use voice tasks?",
    a: "On the Voice Tasks page, paste or dictate a transcript from a meeting or call. The system uses AI to split the transcript into actionable tasks, each with a suggested owner and deadline. Review and approve tasks before they are pushed to the task board.",
  },
  {
    q: "What roles are available?",
    a: "CommandOS has the following roles: CEO (full access), COO (full operational), Developer (technical), Marketing Manager, SEO/Social Media Head, Social Media Creator, GHL Expert, SDR, and General Outsourcer. Each role is scoped to specific modules and businesses.",
  },
  {
    q: "How do I view financial reports?",
    a: "The Business P&L page and Business Performance page provide revenue snapshots, trend charts, and pacing metrics per business. Data is sourced from revenue snapshots logged either manually or via integrated practice management software such as Dentally.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach the support team via email at support@commandos.io. For urgent issues, use the live chat widget at the bottom of this page. The typical response time is under 4 business hours for critical issues.",
  },
];

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
const SHORTCUTS = [
  { keys: ["⌘", "K"],       description: "Open global search" },
  { keys: ["⌘", "N"],       description: "Create new task" },
  { keys: ["⌘", "B"],       description: "Toggle sidebar" },
  { keys: ["⌘", "/"],       description: "Show keyboard shortcuts" },
  { keys: ["⌘", "⇧", "D"], description: "Go to Dashboard" },
  { keys: ["⌘", "⇧", "T"], description: "Go to Tasks" },
  { keys: ["⌘", "⇧", "A"], description: "Open AI Brain" },
  { keys: ["⌘", "⇧", "I"], description: "Go to Integrations" },
  { keys: ["Esc"],           description: "Close modal / panel" },
];

// ── System status ─────────────────────────────────────────────────────────────
const SYSTEM_STATUS = [
  { label: "API",          ok: true },
  { label: "Database",     ok: true },
  { label: "AI Brain",     ok: true },
  { label: "Integrations", ok: true },
];

// ── Documentation links ───────────────────────────────────────────────────────
const DOC_LINKS = [
  { label: "API Documentation", icon: <FileText size={15} />, href: "#" },
  { label: "User Guide",        icon: <Book size={15} />,     href: "#" },
  { label: "Changelog",         icon: <GitBranch size={15} />, href: "#" },
];

// ── FAQ Accordion Item ────────────────────────────────────────────────────────
function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-bg-soft/40 transition"
        onClick={onToggle}
      >
        <span className="text-sm font-medium text-ink">{q}</span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  // Filter FAQs by search
  const filteredFaqs = search.trim()
    ? FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : FAQS;

  const filteredQuickLinks = search.trim()
    ? QUICK_LINKS.filter(
        (l) =>
          l.title.toLowerCase().includes(search.toLowerCase()) ||
          l.description.toLowerCase().includes(search.toLowerCase())
      )
    : QUICK_LINKS;

  return (
    <>
      <Topbar title="Help & Support" subtitle="Find answers, shortcuts, and contact support" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <PageHeader
          icon="🆘"
          title="Help & Support"
          subtitle="Search for help articles or browse by category."
        />

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <div className="relative mb-8 max-w-2xl">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full pl-11 pr-4 py-3 border border-line rounded-xl bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Quick links grid ─────────────────────────────────────────────── */}
        {filteredQuickLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Quick Links</h2>
            <div className="grid grid-cols-3 gap-4">
              {filteredQuickLinks.map((link) => (
                <button
                  key={link.id}
                  className="flex items-start gap-4 bg-white border border-line rounded-xl p-4 text-left hover:shadow-sm hover:border-primary/30 transition group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: link.bg, color: link.color }}
                  >
                    {link.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-ink">{link.title}</p>
                      <ChevronRight size={13} className="text-muted opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{link.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ accordion ────────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Frequently Asked Questions
            {search && (
              <span className="ml-2 normal-case font-normal text-muted">
                — {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <FaqItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted">
                No FAQ articles match your search.
              </div>
            )}
          </div>
        </section>

        {/* ── Bottom grid: shortcuts + status + contact + docs ─────────────── */}
        <div className="grid grid-cols-2 gap-6 mb-8">

          {/* Keyboard shortcuts */}
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <Keyboard size={14} />
              Keyboard Shortcuts
            </h2>
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {SHORTCUTS.map((sc, i) => (
                <div
                  key={i}
                  className={cn("flex items-center justify-between px-5 py-3", i < SHORTCUTS.length - 1 && "border-b border-line")}
                >
                  <span className="text-sm text-ink">{sc.description}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-bg-soft border border-line rounded text-[11px] font-semibold text-ink"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right column: System status + Documentation */}
          <div className="flex flex-col gap-6">

            {/* System status */}
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle size={14} />
                System Status
              </h2>
              <div className="bg-white border border-line rounded-xl overflow-hidden">
                {SYSTEM_STATUS.map((svc, i) => (
                  <div
                    key={svc.label}
                    className={cn("flex items-center justify-between px-5 py-3.5", i < SYSTEM_STATUS.length - 1 && "border-b border-line")}
                  >
                    <span className="text-sm font-medium text-ink">{svc.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Documentation links */}
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <Book size={14} />
                Documentation
              </h2>
              <div className="bg-white border border-line rounded-xl overflow-hidden">
                {DOC_LINKS.map((doc, i) => (
                  <a
                    key={doc.label}
                    href={doc.href}
                    className={cn(
                      "flex items-center justify-between px-5 py-3.5 hover:bg-bg-soft transition",
                      i < DOC_LINKS.length - 1 && "border-b border-line"
                    )}
                  >
                    <div className="flex items-center gap-2.5 text-sm text-ink">
                      <span className="text-muted">{doc.icon}</span>
                      {doc.label}
                    </div>
                    <ExternalLink size={13} className="text-muted" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Contact support ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
            <LifeBuoy size={14} />
            Contact Support
          </h2>
          <div className="grid grid-cols-2 gap-4">

            {/* Email */}
            <div className="bg-white border border-line rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Email Support</p>
                <p className="text-xs text-muted mt-0.5 mb-2">We typically respond within 4 business hours.</p>
                <a
                  href="mailto:support@commandos.io"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  support@commandos.io
                </a>
              </div>
            </div>

            {/* Live chat */}
            <div className="bg-white border border-line rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <MessageSquare size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Live Chat</p>
                <p className="text-xs text-muted mt-0.5 mb-2">Available Monday – Friday, 9am – 6pm GMT.</p>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition"
                  onClick={() => {}}
                >
                  <MessageSquare size={12} />
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
