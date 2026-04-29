class CommandOSAPI {
  constructor(base) {
    this.base = (base || import.meta.env.VITE_API_URL || "http://localhost:8765/api").replace(/\/$/, "");
    this.token = localStorage.getItem("cos_token") || null;
  }

  async _req(path, opts = {}) {
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const r = await fetch(this.base + path, { ...opts, headers });
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`${r.status} ${path}: ${body}`);
    }
    return r.status === 204 ? null : r.json();
  }

  async login(username, password) {
    const t = await this._req("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
    this.token = t.access_token;
    localStorage.setItem("cos_token", this.token);
    return t;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("cos_token");
  }

  async me() { return this._req("/auth/me"); }
  async today() { return this._req("/today"); }
  async tasks(filter = {}) {
    const q = new URLSearchParams(filter).toString();
    return this._req("/tasks" + (q ? "?" + q : ""));
  }
  async createTask(t) { return this._req("/tasks", { method: "POST", body: JSON.stringify(t) }); }
  async patchTask(id, t) { return this._req(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(t) }); }
  async deleteTask(id) { return this._req(`/tasks/${id}`, { method: "DELETE" }); }
  async splitVoice(transcript, defaultOwnerId) { return this._req("/voice/split", { method: "POST", body: JSON.stringify({ transcript, default_owner_id: defaultOwnerId }) }); }
  async approveVoice(transcript, items) { return this._req("/voice/approve", { method: "POST", body: JSON.stringify({ transcript, items }) }); }
  async businesses() { return this._req("/businesses"); }
  async people() { return this._req("/people"); }
  async projects() { return this._req("/projects"); }
  async createProject(data) { return this._req("/projects", { method: "POST", body: JSON.stringify(data) }); }
  async patchProject(id, data) { return this._req(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
  async deleteProject(id) { return this._req(`/projects/${id}`, { method: "DELETE" }); }
  async leads(stage) { return this._req("/leads" + (stage ? `?stage=${stage}` : "")); }
  async createLead(data) { return this._req("/leads", { method: "POST", body: JSON.stringify(data) }); }
  async patchLead(id, data) { return this._req(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
  async deleteLead(id) { return this._req(`/leads/${id}`, { method: "DELETE" }); }
  async revenue(businessId) { return this._req("/revenue" + (businessId ? `?business_id=${businessId}` : "")); }
  async directives() { return this._req("/directives"); }
  async warnings() { return this._req("/warnings"); }
  async dismissDirective(id) { return this._req(`/directives/${id}/dismiss`, { method: "POST" }); }
  async regenerate() { return this._req("/brain/regenerate", { method: "POST" }); }
  async askBrain(question, businessId) { return this._req("/ask-brain", { method: "POST", body: JSON.stringify({ question, business_id: businessId }) }); }
  async automations() { return this._req("/automations"); }
  async addAutomation(rule) { return this._req("/automations", { method: "POST", body: JSON.stringify(rule) }); }
  async integStatus() { return this._req("/integrations/status"); }
  async integConnect(provider) { return this._req(`/integrations/${provider}/connect`); }

  // Routines
  async routineTemplates(role) { return this._req("/routines/templates" + (role ? `?role=${role}` : "")); }
  async createRoutineTemplate(data) { return this._req("/routines/templates", { method: "POST", body: JSON.stringify(data) }); }
  async deleteRoutineTemplate(id) { return this._req(`/routines/templates/${id}`, { method: "DELETE" }); }
  async routineLogs(date, personId) {
    const q = new URLSearchParams();
    if (date) q.set("date", date);
    if (personId) q.set("person_id", personId);
    const qs = q.toString();
    return this._req("/routines/logs" + (qs ? "?" + qs : ""));
  }
  async logRoutine(data) { return this._req("/routines/logs", { method: "POST", body: JSON.stringify(data) }); }

  // Ads
  async adAccounts(businessId) { return this._req("/ads/accounts" + (businessId ? `?business_id=${businessId}` : "")); }
  async createAdAccount(data) { return this._req("/ads/accounts", { method: "POST", body: JSON.stringify(data) }); }
  async deleteAdAccount(id) { return this._req(`/ads/accounts/${id}`, { method: "DELETE" }); }
  async adCampaigns(accountId, platform) {
    const q = new URLSearchParams();
    if (accountId) q.set("account_id", accountId);
    if (platform) q.set("platform", platform);
    const qs = q.toString();
    return this._req("/ads/campaigns" + (qs ? "?" + qs : ""));
  }
  async createAdCampaign(data) { return this._req("/ads/campaigns", { method: "POST", body: JSON.stringify(data) }); }
  async patchAdCampaign(id, data) { return this._req(`/ads/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
  async deleteAdCampaign(id) { return this._req(`/ads/campaigns/${id}`, { method: "DELETE" }); }
  async adMetrics(campaignId, dateFrom, dateTo) {
    const q = new URLSearchParams();
    if (campaignId) q.set("campaign_id", campaignId);
    if (dateFrom) q.set("date_from", dateFrom);
    if (dateTo) q.set("date_to", dateTo);
    const qs = q.toString();
    return this._req("/ads/metrics" + (qs ? "?" + qs : ""));
  }
  async adsSummary(businessId, dateFrom, dateTo) {
    const q = new URLSearchParams();
    if (businessId) q.set("business_id", businessId);
    if (dateFrom) q.set("date_from", dateFrom);
    if (dateTo) q.set("date_to", dateTo);
    const qs = q.toString();
    return this._req("/ads/summary" + (qs ? "?" + qs : ""));
  }

  // Conversations (GHL)
  async conversations(slug, limit = 50) {
    const q = new URLSearchParams();
    if (slug) q.set("slug", slug);
    if (limit !== 50) q.set("limit", limit);
    const qs = q.toString();
    return this._req("/conversations" + (qs ? "?" + qs : ""));
  }
  async conversationMessages(conversationId, slug) {
    return this._req(`/conversations/${conversationId}/messages?slug=${slug}`);
  }

  // Dashboard
  async dashboardSidebar() { return this._req("/dashboard/sidebar"); }
  async dashboardSummary() { return this._req("/dashboard/summary"); }
  async aiCeoInsights(context, focusArea = "overall") {
    return this._req("/dashboard/ai-ceo/insights", { method: "POST", body: JSON.stringify({ context, focusArea }) });
  }
  async aiCeoGenerateTasks(context, targetDay) {
    return this._req("/dashboard/ai-ceo/generate-team-tasks", { method: "POST", body: JSON.stringify({ context, targetDay }) });
  }
}

export const api = new CommandOSAPI();
export default CommandOSAPI;
