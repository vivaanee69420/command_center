import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { canSeeSidebar } from "@/lib/constants";
import { BUSINESSES } from "@/lib/data";
import { getInitials, cn } from "@/lib/utils";
import {
  LayoutGrid, Globe, ChevronRight, ChevronLeft, ChevronDown,
  Users, Sparkles, Settings, LogOut,
  Search, CalendarDays, BarChart3,
  Link, Inbox, BookOpen, PenTool, ShieldCheck, Phone, Zap, Megaphone, BarChart,
  Brain, TrendingUp, Bell, Puzzle, Building2, FolderKanban, UserCheck,
  ClipboardList, Clock, FileText, MessageSquare, DollarSign,
} from "lucide-react";

const practices = BUSINESSES.filter((b) => b.type === "practice");
const otherBiz = BUSINESSES.filter((b) => b.type !== "practice");

// ── Navigation structure matching CommandOS.html screenshot ──────────────────

const COMMAND_ITEMS = [
  { key: "home",       label: "Command Centre",  icon: LayoutGrid,   path: "/",                 badge: "5" },
  { key: "projects",   label: "All Tasks",       icon: ClipboardList, path: "/simple-tasks",    badge: null },
  { key: "projects",   label: "Kanban",          icon: FolderKanban,  path: "/kanban",           badge: null },
  { key: "content_cal",label: "Calendar",         icon: CalendarDays,  path: "/content-calendar", badge: null },
];

const PLANS_ITEMS = [
  { key: "projects",      label: "£250k Recovery",    icon: TrendingUp,   path: "/projects",        badge: null },
  { key: "daily_routines",label: "90-Day Plan",        icon: ClipboardList, path: "/daily-routines",  badge: null },
  { key: "daily_routines",label: "Daily Routines",     icon: Clock,         path: "/daily-routines",  badge: null },
];

const MARKETING_SUBITEMS = [
  { key: "lead_engine",  label: "Lead Engine",      icon: Link,       path: "/marketing/lead-engine" },
  { key: "manus_inbox",  label: "Manus Inbox",      icon: Inbox,      path: "/marketing/manus-inbox" },
  { key: "offers",       label: "Offer Library",    icon: BookOpen,   path: "/marketing/offers" },
  { key: "content",      label: "Content Factory",  icon: PenTool,    path: "/marketing/content-factory" },
  { key: "sales",        label: "Sales Enablement", icon: ShieldCheck,path: "/marketing/sales" },
  { key: "setter",       label: "Setter Dashboard", icon: Phone,      path: "/marketing/setter" },
  { key: "ghl_auto",     label: "GHL Automation",   icon: Zap,        path: "/marketing/ghl-automation" },
  { key: "ads",          label: "Ads Dashboard",    icon: Megaphone,  path: "/marketing/ads" },
  { key: "ghl_dash",     label: "GHL Dashboard",    icon: BarChart,   path: "/marketing/ghl-dashboard" },
];

const MARKETING_TOP_ITEMS = [
  { key: "seo",         label: "SEO & Rankings",       icon: Search,    path: "/seo",           badge: null },
  { key: "ads",         label: "Ads Manager",          icon: Megaphone, path: "/marketing/ads", badge: null },
  { key: "competitors", label: "Competitor Analysis",   icon: Sparkles,  path: "/competitor-ai", badge: null },
  { key: "backlinks",   label: "Backlink Monitor",      icon: Link,      path: "/backlinks",     badge: null },
];

const SALES_ITEMS = [
  { key: "crm",         label: "Sales Pipeline",   icon: UserCheck,      path: "/crm",                    badge: null },
  { key: "crm",         label: "Leads",            icon: Users,          path: "/marketing/lead-engine",  badge: null },
  { key: "crm",         label: "Conversations",    icon: MessageSquare,  path: "/marketing/manus-inbox",  badge: null },
];

const OPERATIONS_ITEMS = [
  { key: "outsourcer",  label: "Outsourcer Tracker",  icon: Clock,      path: "/outsourcer-tracker", badge: null },
  { key: "business_performance", label: "Revenue & Finance", icon: DollarSign, path: "/business-pnl",  badge: null },
  { key: "documents",   label: "Documents",           icon: FileText,   path: "/documents",          badge: null },
];

const INTELLIGENCE_ITEMS = [
  { key: "ai_brain",             label: "AI Brain",             icon: Brain,      path: "/ai-brain",             badge: null },
  { key: "insights",             label: "AI Insights & Reports",icon: TrendingUp, path: "/insights",             badge: null },
  { key: "market_intel",         label: "Research Engine",       icon: Search,     path: "/market-intel",         badge: null },
];

const AUTOMATION_ITEMS = [
  { key: "ghl_auto",     label: "Automations",   icon: Zap,     path: "/marketing/ghl-automation", badge: null },
  { key: "integrations", label: "Integrations",  icon: Puzzle,  path: "/integrations",              badge: null },
  { key: "notifications",label: "Notifications", icon: Bell,    path: "/notifications",             badge: "12" },
];

const MANAGE_ITEMS = [
  { key: "businesses",  label: "Businesses",    icon: Building2, path: "/businesses",       badge: null },
  { key: "team_hub",    label: "Team / People", icon: Users,     path: "/team-hub",         badge: null },
  { key: "settings",    label: "Settings",      icon: Settings,  path: "/settings",         badge: null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function Badge({ label, isActive }) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none",
        isActive ? "bg-white text-[#7c3aed]" : "bg-bg-soft text-muted"
      )}
    >
      {label}
    </span>
  );
}

function NavItem({ item, role, collapsed }) {
  if (!canSeeSidebar(role, item.key)) return null;
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-[7px] text-[13px] font-medium transition-colors group",
          collapsed ? "justify-center px-0 py-2" : "px-[10px] py-[7px]",
          isActive
            ? "bg-[#ede9fe] text-[#7c3aed]"
            : "text-ink hover:bg-bg-soft"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
            <item.icon size={15} />
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && <Badge label={item.badge} isActive={isActive} />}
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

function SectionHeader({ label, collapsed }) {
  if (collapsed) return <div className="my-2 border-t border-line" />;
  return (
    <div className="px-[10px] pt-4 pb-1 text-[9.5px] font-bold text-muted uppercase tracking-widest">
      {label}
    </div>
  );
}

function PracticeItem({ biz, collapsed }) {
  return (
    <NavLink
      to={`/practices/${biz.slug}`}
      title={collapsed ? biz.name : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-[7px] text-[13px] font-medium transition-colors",
          collapsed ? "justify-center px-0 py-2" : "px-[10px] py-[7px]",
          isActive
            ? "bg-[#ede9fe] text-[#7c3aed]"
            : "text-ink hover:bg-bg-soft"
        )
      }
    >
      <span className="text-base leading-none shrink-0">{biz.emoji}</span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{biz.name}</span>
          {biz.type === "academy" && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-bg-soft text-muted">P4G</span>
          )}
          {biz.slug === "accounts" && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-bg-soft text-muted">Elevate</span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [practicesOpen, setPracticesOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const role = user?.role || "CEO";

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  // ── Collapsed sidebar ────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <aside className="w-[60px] bg-white border-r border-line h-screen sticky top-0 flex flex-col items-center py-4 gap-1 overflow-hidden">
        <div
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-white font-extrabold text-sm mb-2 shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
        >
          C
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-muted hover:text-ink mb-2"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
        <div className="flex flex-col items-center gap-0.5 w-full px-1">
          {COMMAND_ITEMS.map((item) =>
            canSeeSidebar(role, item.key) ? (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center w-[38px] h-[34px] rounded-[7px] transition-colors",
                    isActive ? "bg-[#ede9fe] text-[#7c3aed]" : "text-ink hover:bg-bg-soft"
                  )
                }
              >
                <item.icon size={16} />
              </NavLink>
            ) : null
          )}
        </div>
      </aside>
    );
  }

  // ── Expanded sidebar ─────────────────────────────────────────────────────
  return (
    <aside
      className="bg-white border-r border-line h-screen sticky top-0 flex flex-col overflow-y-auto"
      style={{ width: 248 }}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
          >
            C
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-bold text-ink">CommandOS</div>
            <div className="text-[10px] text-muted">V3 · Preview</div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted hover:text-ink shrink-0"
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 px-2 pb-2 overflow-y-auto">

        {/* ── COMMAND ── */}
        <SectionHeader label="Command" />
        <div className="space-y-0.5">
          {COMMAND_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── PLANS ── */}
        <SectionHeader label="Plans" />
        <div className="space-y-0.5">
          {PLANS_ITEMS.map((item, i) => (
            <NavItem key={item.label + i} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── MARKETING ── */}
        <SectionHeader label="Marketing" />
        <div className="space-y-0.5">
          {/* Marketing OS — expandable */}
          {canSeeSidebar(role, "marketing") && (
            <div>
              <button
                onClick={() => setMarketingOpen(!marketingOpen)}
                className={cn(
                  "flex items-center gap-2.5 px-[10px] py-[7px] rounded-[7px] text-[13px] font-medium transition-colors w-full",
                  marketingOpen
                    ? "bg-[#ede9fe] text-[#7c3aed]"
                    : "text-ink hover:bg-bg-soft"
                )}
              >
                <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0">
                  <Globe size={15} />
                </span>
                <span className="flex-1 text-left truncate">Marketing OS</span>
                <ChevronDown
                  size={13}
                  className={cn("shrink-0 transition-transform", !marketingOpen && "-rotate-90")}
                />
              </button>
              {marketingOpen && (
                <div className="ml-4 mt-0.5 mb-0.5 space-y-0.5 border-l-2 border-line pl-2">
                  {MARKETING_SUBITEMS.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-[7px] text-[12px] font-medium transition-colors",
                          isActive
                            ? "bg-[#ede9fe] text-[#7c3aed]"
                            : "text-muted hover:text-ink hover:bg-bg-soft"
                        )
                      }
                    >
                      <item.icon size={13} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {MARKETING_TOP_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── SALES ── */}
        <SectionHeader label="Sales" />
        <div className="space-y-0.5">
          {SALES_ITEMS.map((item, i) => (
            <NavItem key={item.label + i} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── OPERATIONS ── */}
        <SectionHeader label="Operations" />
        <div className="space-y-0.5">
          {OPERATIONS_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── INTELLIGENCE ── */}
        <SectionHeader label="Intelligence" />
        <div className="space-y-0.5">
          {INTELLIGENCE_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── AUTOMATION ── */}
        <SectionHeader label="Automation" />
        <div className="space-y-0.5">
          {AUTOMATION_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── MANAGE ── */}
        <SectionHeader label="Manage" />
        <div className="space-y-0.5">
          {MANAGE_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} role={role} collapsed={false} />
          ))}
        </div>

        {/* ── PRACTICES (collapsible) ── */}
        <div className="mt-2">
          <button
            onClick={() => setPracticesOpen(!practicesOpen)}
            className="flex items-center gap-2 px-[10px] py-1 text-[9.5px] font-bold text-muted uppercase tracking-widest w-full hover:text-ink transition-colors"
          >
            <span className="flex-1 text-left">Locations</span>
            <ChevronRight
              size={11}
              className={cn("transition-transform", practicesOpen && "rotate-90")}
            />
          </button>
          {practicesOpen && (
            <div className="mt-0.5 space-y-0.5">
              {practices.map((b) => (
                <PracticeItem key={b.slug} biz={b} collapsed={false} />
              ))}
              {otherBiz.map((b) => (
                <PracticeItem key={b.slug} biz={b} collapsed={false} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer — user identity */}
      <div className="shrink-0 border-t border-line px-3 py-3 flex items-center gap-2.5">
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #0e2a47, #1f6fb5)" }}
        >
          {getInitials(user?.name || "U")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink truncate">{user?.name}</div>
          <div className="text-[10px] text-muted truncate">{user?.role}</div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="shrink-0 text-muted hover:text-[#7c3aed] transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
