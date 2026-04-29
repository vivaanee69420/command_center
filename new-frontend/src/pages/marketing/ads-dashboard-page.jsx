import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import RightSidebar from "@/components/shared/right-sidebar";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  DollarSign,
  MousePointerClick,
  Target,
  TrendingUp,
  Eye,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n, prefix = "") {
  if (n == null) return "—";
  if (n >= 1000000) return `${prefix}${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}K`;
  return `${prefix}${Number(n).toLocaleString()}`;
}

function fmtCurrency(n) {
  if (n == null) return "—";
  return `£${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Add Campaign Modal ──────────────────────────────────────────────────────

function AddCampaignModal({ open, onClose, accounts, onSave }) {
  const [form, setForm] = useState({ ad_account_id: "", ext_id: "", name: "", status: "active", daily_budget: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm({ ad_account_id: accounts[0]?.id || "", ext_id: `ext-${Date.now()}`, name: "", status: "active", daily_budget: "" });
  }, [open, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ad_account_id || !form.name.trim()) return;
    setSaving(true);
    try {
      await api.createAdCampaign({
        ad_account_id: form.ad_account_id,
        ext_id: form.ext_id,
        name: form.name.trim(),
        status: form.status,
        daily_budget: form.daily_budget ? parseFloat(form.daily_budget) : null,
      });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted">Campaign Name *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="e.g. Google — Brand Search" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Ad Account *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.ad_account_id} onChange={(e) => set("ad_account_id", e.target.value)} required>
                <option value="">Select</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.platform} — {a.account_id}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Daily Budget (£)</label>
              <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="50.00" value={form.daily_budget} onChange={(e) => set("daily_budget", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Status</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">External ID</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.ext_id} onChange={(e) => set("ext_id", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Campaign"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, iconBg, label, value, subtitle }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">{label}</div>
      <div className="text-2xl font-bold text-ink mt-1">{value}</div>
      {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = ["All Campaigns", "Google", "Meta"];

export default function AdsDashboardPage() {
  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All Campaigns");
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setError(null);
    try {
      // Fetch live data from Meta + Google APIs directly
      const [metaData, googleData, sum, acc] = await Promise.allSettled([
        api.liveMetaCampaigns("last_30d"),
        api.liveGoogleCampaigns(),
        api.liveAdsSummary("last_30d"),
        api.adAccounts(),
      ]);

      const metaCampaigns = metaData.status === "fulfilled" ? (metaData.value?.campaigns || []) : [];
      const googleCampaigns = googleData.status === "fulfilled" ? (googleData.value?.campaigns || []) : [];
      setCampaigns([...metaCampaigns, ...googleCampaigns]);
      setSummary(sum.status === "fulfilled" ? sum.value : null);
      setAccounts(acc.status === "fulfilled" ? acc.value : []);

      // Surface API errors if both failed
      const metaErr = metaData.value?.error;
      const googleErr = googleData.value?.error;
      if (metaErr && googleErr) setError(`Meta: ${metaErr} | Google: ${googleErr}`);
      else if (metaErr) setError(`Meta: ${metaErr}`);
      else if (googleErr) setError(`Google: ${googleErr}`);
    } catch (err) {
      console.error("Load ads failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter campaigns by platform tab — live campaigns have .platform directly
  const filtered = useMemo(() => {
    if (activeTab === "All Campaigns") return campaigns;
    const platformKey = activeTab.toLowerCase();
    return campaigns.filter((c) => c.platform === platformKey);
  }, [campaigns, activeTab]);

  return (
    <>
      <Topbar title="Ads Manager" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-ink">Ads Manager</h1>
                <p className="text-sm text-muted mt-0.5">Campaign performance across all platforms</p>
              </div>
              <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4" /> New Campaign
              </Button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {/* API error banner */}
            {!loading && error && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading && (
              <>
                {/* KPI Strip */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <KpiCard
                    icon={DollarSign}
                    iconBg="bg-green-50 text-green-600"
                    label="Total Spend"
                    value={fmtCurrency(summary?.total_spend)}
                    subtitle="Last 30 days"
                  />
                  <KpiCard
                    icon={Eye}
                    iconBg="bg-blue-50 text-blue-600"
                    label="Impressions"
                    value={fmt(summary?.total_impressions)}
                    subtitle="Last 30 days"
                  />
                  <KpiCard
                    icon={MousePointerClick}
                    iconBg="bg-purple-50 text-purple-600"
                    label="Total Clicks"
                    value={fmt(summary?.total_clicks)}
                    subtitle="Last 30 days"
                  />
                  <KpiCard
                    icon={Target}
                    iconBg="bg-amber-50 text-amber-600"
                    label="Conversions"
                    value={fmt(summary?.total_conversions)}
                    subtitle="Last 30 days"
                  />
                  <KpiCard
                    icon={TrendingUp}
                    iconBg="bg-red-50 text-red-600"
                    label="Avg CPA"
                    value={fmtCurrency(summary?.avg_cpa)}
                    subtitle="Cost per conversion"
                  />
                </div>

                {/* Tab Filter */}
                <div className="flex items-center gap-1 mb-5">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "pb-2 px-3 text-sm transition-colors",
                        activeTab === tab
                          ? "font-semibold text-primary border-b-2 border-primary"
                          : "font-medium text-muted hover:text-ink"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-muted">{filtered.length} campaigns</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="text-center py-20">
                    <Target className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-lg font-semibold text-ink">No campaigns yet</p>
                    <p className="text-sm text-muted mt-1">Create ad accounts and campaigns to track performance</p>
                    <Button className="mt-4 gap-1.5" onClick={() => setAddOpen(true)}>
                      <Plus className="w-4 h-4" /> Add Campaign
                    </Button>
                  </div>
                )}

                {/* Campaign Table */}
                {filtered.length > 0 && (
                  <div className="bg-white border border-line rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-line bg-bg-soft">
                            {["CAMPAIGN", "PLATFORM", "SPEND", "CLICKS", "CONVERSIONS", "ROAS", "STATUS", "SOURCE"].map((col) => (
                              <th key={col} className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((c, i) => {
                            const roas = c.spend > 0 && c.conversions > 0
                              ? ((c.conversions * 100) / c.spend).toFixed(1)
                              : null;
                            return (
                              <tr
                                key={c.id}
                                className={cn(
                                  "border-b border-line last:border-0 hover:bg-bg-soft transition-colors",
                                  i % 2 === 0 ? "bg-white" : "bg-bg-soft/30"
                                )}
                              >
                                <td className="px-5 py-4">
                                  <span className="text-sm font-semibold text-ink">{c.name}</span>
                                  {c.account_name && (
                                    <div className="text-[10px] text-muted">{c.account_name}</div>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                    c.platform === "google" ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
                                  )}>
                                    {c.platform || "—"}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-muted">{fmtCurrency(c.spend)}</td>
                                <td className="px-5 py-4 text-sm text-muted">{fmt(c.clicks)}</td>
                                <td className="px-5 py-4 text-sm text-muted">{fmt(c.conversions)}</td>
                                <td className="px-5 py-4 text-sm font-semibold text-ink">{roas ? `${roas}x` : "—"}</td>
                                <td className="px-5 py-4">
                                  <span className={cn(
                                    "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
                                    c.status === "active" || c.status === "enabled"
                                      ? "bg-green-50 text-green-600"
                                      : "bg-gray-100 text-gray-500"
                                  )}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="text-[10px] text-muted">Live</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <RightSidebar />
        </div>
      </main>

      <AddCampaignModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        accounts={accounts}
        onSave={load}
      />
    </>
  );
}
