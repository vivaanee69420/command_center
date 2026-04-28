export const ROLE_SCOPES = {
  CEO: { sidebar: "*", marketing: "*", canApprove: true, canDeleteTasks: true, canSeeFinances: true, canManageUsers: true },
  COO: { sidebar: "*", marketing: "*", canApprove: true, canDeleteTasks: true, canSeeFinances: true, canManageUsers: true },
  "Marketing Lead": {
    sidebar: ["home", "businesses", "projects", "crm", "team", "calendar", "documents", "marketing", "seo", "ads", "competitors", "backlinks", "brain", "reports", "insights", "automations", "outsourcers", "integrations", "notifications", "daily_routines"],
    marketing: "*",
  },
  "Digital + Elevate": {
    sidebar: ["home", "businesses", "projects", "crm", "marketing", "ads", "integrations", "automations", "brain", "reports", "insights", "daily_routines"],
    marketing: ["overview", "ads", "lead_engine", "ghl_auto", "ghl_dash", "integration2", "assets"],
  },
  "Practice Ops": {
    sidebar: ["home", "businesses", "projects", "crm", "team", "calendar", "documents", "reports", "daily_routines"],
    marketing: ["overview", "sales", "ghl_dash", "setter", "voice_tasks", "business_pnl", "team_hub", "assets"],
  },
  "Lab BD": {
    sidebar: ["home", "crm", "projects", "calendar", "documents", "marketing", "reports", "daily_routines"],
    marketing: ["overview", "lead_engine", "offers", "sales", "assets"],
  },
  SDR: {
    sidebar: ["home", "crm", "projects", "calendar", "marketing", "daily_routines"],
    marketing: ["overview", "lead_engine", "setter", "voice_tasks", "sales", "assets"],
  },
  "SEO Specialist": {
    sidebar: ["home", "projects", "marketing", "seo", "backlinks", "competitors", "reports", "daily_routines"],
    marketing: ["seo", "content", "content_cal", "competitors", "assets"],
  },
  "Social Specialist": {
    sidebar: ["home", "projects", "marketing", "calendar", "reports", "daily_routines"],
    marketing: ["content", "content_cal", "ads", "assets"],
  },
  "General Outsourcer": {
    sidebar: ["home", "projects", "calendar", "daily_routines"],
    marketing: ["assets"],
  },
  Developer: { sidebar: "*", marketing: "*", canApprove: true, canDeleteTasks: true, canSeeFinances: true, canManageUsers: true },
  "Marketing Manager": {
    sidebar: ["home", "businesses", "projects", "crm", "team", "calendar", "documents", "marketing", "seo", "ads", "competitors", "backlinks", "brain", "reports", "insights", "automations", "outsourcers", "integrations", "notifications", "daily_routines"],
    marketing: "*",
  },
  "SEO/Social Media Head": {
    sidebar: ["home", "projects", "marketing", "seo", "backlinks", "competitors", "reports", "daily_routines"],
    marketing: ["seo", "content", "content_cal", "competitors", "ads", "assets"],
  },
  "Social Media Creator": {
    sidebar: ["home", "projects", "marketing", "calendar", "reports", "daily_routines"],
    marketing: ["content", "content_cal", "ads", "assets"],
  },
  "GHL Expert": {
    sidebar: ["home", "businesses", "projects", "crm", "marketing", "integrations", "automations", "daily_routines"],
    marketing: ["overview", "ghl_auto", "ghl_dash", "assets"],
  },
};

export function canSeeSidebar(role, pageKey) {
  const scope = ROLE_SCOPES[role] || ROLE_SCOPES["General Outsourcer"];
  if (scope.sidebar === "*") return true;
  return scope.sidebar.includes(pageKey);
}
