/**
 * api_client.js — drop-in adapter to swap localStorage → real API in CommandOS.html
 *
 * Usage in CommandOS.html:
 *   <script src="./api_client.js"></script>
 *   <script>
 *     const api = new CommandOSAPI("http://localhost:8765/api");
 *     await api.login("gaurav", "ceo123");
 *     const today = await api.today();
 *     const tasks = await api.tasks({ me_only: true });
 *   </script>
 */
class CommandOSAPI {
  constructor(base = "http://localhost:8765/api") {
    this.base = base.replace(/\/$/, "");
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

  // --- auth ---
  async login(username, password) {
    const t = await this._req("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
    this.token = t.access_token;
    localStorage.setItem("cos_token", this.token);
    localStorage.setItem("cos_user", JSON.stringify(t));
    return t;
  }
  logout() { this.token = null; localStorage.removeItem("cos_token"); localStorage.removeItem("cos_user"); }
  async me() { return this._req("/auth/me"); }

  // --- today / tasks ---
  async today() { return this._req("/today"); }
  async tasks(filter = {}) {
    const q = new URLSearchParams(filter).toString();
    return this._req("/tasks" + (q ? "?" + q : ""));
  }
  async createTask(t) { return this._req("/tasks", { method: "POST", body: JSON.stringify(t) }); }
  async patchTask(id, t) { return this._req(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(t) }); }
  async deleteTask(id) { return this._req(`/tasks/${id}`, { method: "DELETE" }); }

  // --- voice ---
  async splitVoice(transcript, default_owner_id) {
    return this._req("/voice/split", { method: "POST", body: JSON.stringify({ transcript, default_owner_id }) });
  }
  async approveVoice(transcript, items) {
    return this._req("/voice/approve", { method: "POST", body: JSON.stringify({ transcript, items }) });
  }

  // --- core ---
  async businesses() { return this._req("/businesses"); }
  async people()     { return this._req("/people"); }
  async projects()   { return this._req("/projects"); }
  async leads(stage) { return this._req("/leads" + (stage ? `?stage=${stage}` : "")); }
  async revenue(business_id) { return this._req("/revenue" + (business_id ? `?business_id=${business_id}` : "")); }

  // --- intel ---
  async directives() { return this._req("/directives"); }
  async warnings()   { return this._req("/warnings"); }
  async dismissDirective(id) { return this._req(`/directives/${id}/dismiss`, { method: "POST" }); }
  async regenerate() { return this._req("/brain/regenerate", { method: "POST" }); }
  async askBrain(question, business_id) {
    return this._req("/ask-brain", { method: "POST", body: JSON.stringify({ question, business_id }) });
  }

  // --- automations ---
  async automations() { return this._req("/automations"); }
  async addAutomation(rule) { return this._req("/automations", { method: "POST", body: JSON.stringify(rule) }); }

  // --- integrations ---
  async integStatus() { return this._req("/integrations/status"); }
  async integConnect(provider) { return this._req(`/integrations/${provider}/connect`); }
}

// Convenience: auto-detect backend availability
window.detectBackend = async function (base = "http://localhost:8765/api") {
  try {
    const r = await fetch(base + "/health", { method: "GET" });
    return r.ok;
  } catch (e) { return false; }
};

window.CommandOSAPI = CommandOSAPI;
