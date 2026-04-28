import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { canSeeSidebar } from "@/lib/constants";
import { BUSINESSES } from "@/lib/data";
import { getInitials, cn } from "@/lib/utils";
import {
  LayoutGrid, Globe, Mic, ChevronRight, ChevronLeft, ChevronDown,
  Users, Sparkles, TrendingUp, UserCircle, Settings, LogOut,
  Search, CalendarDays, BarChart3, Receipt,
  Link, Inbox, BookOpen, PenTool, ShieldCheck, Phone, Zap, Megaphone, BarChart,
  Kanban, ListChecks, Radar, Clock,
} from "lucide-react";

const practices = BUSINESSES.filter((b) => b.type === "practice");
const otherBiz = BUSINESSES.filter((b) => b.type !== "practice");

const NAV_ITEMS = [
  { key: "home", label: "Group Dashboard", icon: LayoutGrid, path: "/", badge: "CEO" },
  { key: "voice_tasks", label: "Voice Tasks", icon: Mic, path: "/voice-tasks", badge: "AI" },
];

const MARKETING_SUBITEMS = [
  { key: "lead_engine", label: "Lead Engine", icon: Link, path: "/marketing/lead-engine" },
  { key: "manus_inbox", label: "Manus Inbox", icon: Inbox, path: "/marketing/manus-inbox" },
  { key: "offers", label: "Offer Library", icon: BookOpen, path: "/marketing/offers" },
  { key: "content", label: "Content Factory", icon: PenTool, path: "/marketing/content-factory" },
  { key: "sales", label: "Sales Enablement", icon: ShieldCheck, path: "/marketing/sales" },
  { key: "setter", label: "Setter Dashboard", icon: Phone, path: "/marketing/setter" },
  { key: "ghl_auto", label: "GHL Automation", icon: Zap, path: "/marketing/ghl-automation" },
  { key: "ads", label: "Ads Dashboard", icon: Megaphone, path: "/marketing/ads" },
  { key: "ghl_dash", label: "GHL Dashboard", icon: BarChart, path: "/marketing/ghl-dashboard" },
];

const BOTTOM_ITEMS = [
  { key: "team_hub", label: "Team Hub", icon: Users, path: "/team-hub", badge: "TEAM" },
  { key: "competitors", label: "Competitor AI", icon: Sparkles, path: "/competitor-ai", badge: "AI" },
];

const ANALYTICS_ITEMS = [
  { key: "team_scoreboard", label: "Team Scoreboard", icon: TrendingUp, path: "/team-scoreboard", badge: "2" },
  { key: "seo", label: "SEO Command Center", icon: Search, path: "/seo" },
  { key: "content_cal", label: "Content Calendar", icon: CalendarDays, path: "/content-calendar" },
  { key: "business_performance", label: "Biz Performance", icon: BarChart3, path: "/business-performance" },
  { key: "business_pnl", label: "Business P&L", icon: Receipt, path: "/business-pnl" },
];

const TOOLS_ITEMS = [
  { key: "kanban", label: "Kanban Board", icon: Kanban, path: "/kanban" },
  { key: "simple_tasks", label: "Simple Tasks", icon: ListChecks, path: "/simple-tasks" },
  { key: "mission_control", label: "Mission Control", icon: Radar, path: "/mission-control" },
  { key: "outsourcer", label: "Outsourcer Portal", icon: Clock, path: "/outsourcer-tracker" },
];

const ADMIN_ITEMS = [
  { key: "user_management", label: "User Management", icon: UserCircle, path: "/user-management" },
  { key: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

function NavItem({ item, role }) {
  if (!canSeeSidebar(role, item.key)) return null;
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
          isActive
            ? "bg-primary text-white"
            : "text-ink hover:bg-bg-soft"
        )
      }
    >
      <item.icon size={18} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-md",
          item.badge === "P4G" ? "bg-orange-soft text-orange" :
          item.badge === "Elevate" ? "bg-primary-soft text-primary" :
          item.badge === "TEAM" ? "bg-bg-soft text-muted" :
          "bg-ink/10 text-ink/70"
        )}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

function PracticeItem({ biz }) {
  return (
    <NavLink
      to={`/practices/${biz.slug}`}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
          isActive ? "bg-primary text-white" : "text-ink hover:bg-bg-soft"
        )
      }
    >
      <span className="text-base">{biz.emoji}</span>
      <span className="flex-1">{biz.name}</span>
      <ChevronRight size={14} className="text-muted" />
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [practicesOpen, setPracticesOpen] = useState(true);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const role = user?.role || "CEO";

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  if (collapsed) {
    return (
      <aside className="w-[60px] bg-white border-r border-line h-screen sticky top-0 flex flex-col items-center py-4">
        <button onClick={() => setCollapsed(false)} className="text-muted hover:text-ink mb-4">
          <ChevronRight size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[190px] bg-white border-r border-line h-screen sticky top-0 flex flex-col overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-lg text-ink">GM</span>
          <span className="font-extrabold text-lg text-primary">OS</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-muted hover:text-ink">
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* User profile */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: user?.color || "#0e2a47" }}
        >
          {getInitials(user?.name || "U")}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate">{user?.name}</div>
          <div className="text-[11px] text-muted truncate">{user?.role} · Full Access</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.key} item={item} role={role} />
        ))}

        {/* Marketing OS with submenu */}
        {canSeeSidebar(role, "marketing") && (
          <div>
            <button
              onClick={() => setMarketingOpen(!marketingOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors w-full",
                marketingOpen ? "bg-primary/10 text-primary" : "text-ink hover:bg-bg-soft"
              )}
            >
              <Globe size={18} />
              <span className="flex-1 text-left">Marketing OS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-ink/10 text-ink/70">9M</span>
              <ChevronDown size={14} className={cn("transition-transform", !marketingOpen && "-rotate-90")} />
            </button>
            {marketingOpen && (
              <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-line pl-2">
                {MARKETING_SUBITEMS.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
                        isActive ? "bg-primary text-white" : "text-muted hover:text-ink hover:bg-bg-soft"
                      )
                    }
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Practices */}
        <div className="mt-4">
          <button
            onClick={() => setPracticesOpen(!practicesOpen)}
            className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-wider w-full"
          >
            <span>Practices</span>
            <ChevronRight size={12} className={cn("transition-transform", practicesOpen && "rotate-90")} />
          </button>
          {practicesOpen && (
            <div className="mt-1 space-y-0.5">
              {practices.map((b) => <PracticeItem key={b.slug} biz={b} />)}
            </div>
          )}
        </div>

        {/* Other businesses */}
        <div className="mt-3 space-y-0.5">
          {otherBiz.map((b) => (
            <NavLink
              key={b.slug}
              to={`/practices/${b.slug}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                  isActive ? "bg-primary text-white" : "text-ink hover:bg-bg-soft"
                )
              }
            >
              <span className="text-base">{b.emoji}</span>
              <span className="flex-1">{b.name}</span>
              {b.type === "academy" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-soft text-orange">P4G</span>}
              {b.slug === "accounts" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-soft text-primary">Elevate</span>}
            </NavLink>
          ))}
        </div>

        {/* Team + Competitor */}
        <div className="mt-3 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavItem key={item.key} item={item} role={role} />
          ))}
        </div>

        {/* Tools */}
        <div className="mt-4">
          <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-wider">Tools</div>
          <div className="mt-1 space-y-0.5">
            {TOOLS_ITEMS.map((item) => (
              <NavItem key={item.key} item={item} role={role} />
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div className="mt-4">
          <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-wider">Analytics</div>
          <div className="mt-1 space-y-0.5">
            {ANALYTICS_ITEMS.map((item) => (
              <NavItem key={item.key} item={item} role={role} />
            ))}
          </div>
        </div>
      </nav>

      {/* Admin + Sign Out */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-line pt-2">
        {ADMIN_ITEMS.map((item) => (
          <NavItem key={item.key} item={item} role={role} />
        ))}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-primary hover:bg-primary-light transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
