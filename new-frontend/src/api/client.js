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
  async leads(stage) { return this._req("/leads" + (stage ? `?stage=${stage}` : "")); }
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

  // Dashboard
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
