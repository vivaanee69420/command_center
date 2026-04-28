export const ROLE_SCOPES = {
  CEO: { sidebar: "*", marketing: "*", canApprove: true, canDeleteTasks: true, canSeeFinances: true, canManageUsers: true },
  COO: { sidebar: "*", marketing: "*", canApprove: true, canDeleteTasks: true, canSeeFinances: true, canManageUsers: true },
  "Marketing Lead": {
    sidebar: ["home", "businesses", "projects", "crm", "team_hub", "content_cal", "documents", "daily_routines", "marketing", "seo", "ads", "competitors", "backlinks", "ai_brain", "market_intel", "business_performance", "insights", "ghl_auto", "outsourcer", "integrations", "notifications"],
    marketing: "*",
  },
  "Digital + Elevate": {
    sidebar: ["home", "businesses", "projects", "crm", "daily_routines", "marketing", "ads", "integrations", "ghl_auto", "ai_brain", "business_performance", "insights"],
    marketing: ["overview", "ads", "lead_engine", "ghl_auto", "ghl_dash", "integration2", "assets"],
  },
  "Practice Ops": {
    sidebar: ["home", "businesses", "projects", "crm", "team_hub", "content_cal", "documents", "daily_routines", "business_performance"],
    marketing: ["overview", "sales", "ghl_dash", "setter", "voice_tasks", "business_pnl", "team_hub", "assets"],
  },
  "Lab BD": {
    sidebar: ["home", "crm", "projects", "content_cal", "documents", "daily_routines", "marketing", "business_performance"],
    marketing: ["overview", "lead_engine", "offers", "sales", "assets"],
  },
  SDR: {
    sidebar: ["home", "crm", "projects", "content_cal", "daily_routines", "marketing"],
    marketing: ["overview", "lead_engine", "setter", "voice_tasks", "sales", "assets"],
  },
  "SEO Specialist": {
    sidebar: ["home", "projects", "marketing", "seo", "backlinks", "competitors", "business_performance", "daily_routines"],
    marketing: ["seo", "content", "content_cal", "competitors", "assets"],
  },
  "Social Specialist": {
    sidebar: ["home", "projects", "marketing", "content_cal", "business_performance", "daily_routines"],
    marketing: ["content", "content_cal", "ads", "assets"],
  },
  "General Outsourcer": {
    sidebar: ["home", "projects", "content_cal", "daily_routines"],
    marketing: ["assets"],
  },
  Developer: { sidebar: "*", marketing: "*", canApprove: true, canDeleteTasks: true, canSeeFinances: true, canManageUsers: true },
  "Marketing Manager": {
    sidebar: ["home", "businesses", "projects", "crm", "team_hub", "content_cal", "documents", "daily_routines", "marketing", "seo", "ads", "competitors", "backlinks", "ai_brain", "market_intel", "business_performance", "insights", "ghl_auto", "outsourcer", "integrations", "notifications"],
    marketing: "*",
  },
  "SEO/Social Media Head": {
    sidebar: ["home", "projects", "marketing", "seo", "backlinks", "competitors", "business_performance", "daily_routines"],
    marketing: ["seo", "content", "content_cal", "competitors", "ads", "assets"],
  },
  "Social Media Creator": {
    sidebar: ["home", "projects", "marketing", "content_cal", "business_performance", "daily_routines"],
    marketing: ["content", "content_cal", "ads", "assets"],
  },
  "GHL Expert": {
    sidebar: ["home", "businesses", "projects", "crm", "marketing", "integrations", "ghl_auto", "daily_routines"],
    marketing: ["overview", "ghl_auto", "ghl_dash", "assets"],
  },
};

export function canSeeSidebar(role, pageKey) {
  const scope = ROLE_SCOPES[role] || ROLE_SCOPES["General Outsourcer"];
  if (scope.sidebar === "*") return true;
  return scope.sidebar.includes(pageKey);
}
