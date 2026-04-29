import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Search, Plus, X, Calendar, Tag, Eye, MousePointer,
  TrendingUp, Gift, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";

const TABS = ["Active Offers", "Drafts", "Expired", "Templates"];

const PRACTICES = ["GM Dental - Luton", "GM Dental - Watford", "GM Dental - Harrow", "GM Dental - Wembley"];

// ALL_OFFERS, OFFER_TEMPLATES removed — requires offers backend endpoint.
const ALL_OFFERS = [];
const OFFER_TEMPLATES = [];

const TYPE_BADGE = {
  "Percentage": "bg-purple-50 text-purple-600",
  "Fixed": "bg-blue-50 text-blue-600",
  "Bundle": "bg-green-50 text-green-600",
  "Free": "bg-amber-50 text-amber-600",
};

const STATUS_BADGE = {
  "Active": "bg-green-50 text-green-600",
  "Draft": "bg-slate-100 text-slate-500",
  "Expired": "bg-red-50 text-red-400",
};

const EMPTY_FORM = {
  title: "", description: "", type: "Percentage", value: "",
  validFrom: "", validTo: "", practices: [],
};

export default function OfferLibraryPage() {
  const [activeTab, setActiveTab] = useState("Active Offers");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const tabMap = { "Active Offers": "Active", "Drafts": "Draft", "Expired": "Expired" };

  const displayed = useMemo(() => {
    if (activeTab === "Templates") return [];
    return ALL_OFFERS.filter((o) => {
      const matchStatus = o.status === tabMap[activeTab];
      const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.desc.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [activeTab, search]);

  const handleCopy = (offer) => {
    navigator.clipboard.writeText(`${offer.title} — ${offer.value}: ${offer.desc}`).catch(() => {});
    setCopiedId(offer.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const togglePractice = (p) => {
    setForm((prev) => ({
      ...prev,
      practices: prev.practices.includes(p) ? prev.practices.filter((x) => x !== p) : [...prev.practices, p],
    }));
  };

  return (
    <>
      <Topbar title="Offer Library" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎁"
          title="Offer Library"
          subtitle="Manage promotions, discounts, and bundles across all practices"
          actions={[
            { label: "+ Create Offer", variant: "primary", onClick: () => setShowModal(true) },
          ]}
        />

        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Offers Backend</p>
            <p className="text-xs text-amber-600 leading-relaxed">Offer library requires an <code className="font-mono bg-amber-100 px-1 rounded">offer</code> model and <code className="font-mono bg-amber-100 px-1 rounded">GET /api/offers</code> endpoint. Each offer should include title, description, type, value, validity dates, applicable practices, and performance metrics (views, clicks, conversions, revenue).</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-4 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                activeTab === tab ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab}
              {tab !== "Templates" && (
                <span className={cn("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
                  activeTab === tab ? "bg-white/20 text-white" : "bg-line text-muted")}>
                  {ALL_OFFERS.filter((o) => o.status === tabMap[tab]).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search (not on Templates) */}
        {activeTab !== "Templates" && (
          <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-white w-64 mb-4">
            <Search size={13} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
            />
          </div>
        )}

        {/* Offer Cards */}
        {activeTab !== "Templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.length === 0 && (
              <div className="col-span-3 bg-white border border-line rounded-xl p-10 text-center text-sm text-muted">
                No offers found.
              </div>
            )}
            {displayed.map((offer) => {
              const isExpanded = expandedOffer === offer.id;
              return (
                <div key={offer.id} className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-sm transition"
                  style={{ borderTopWidth: 3, borderTopColor: offer.color }}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-ink">{offer.title}</span>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_BADGE[offer.status])}>
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-snug">{offer.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-3 mb-3">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", TYPE_BADGE[offer.type])}>
                        {offer.type}
                      </span>
                      <span className="text-sm font-bold text-primary">{offer.value}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted mb-3">
                      <Calendar size={10} />
                      {offer.validFrom} — {offer.validTo}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {offer.practices.map((p) => (
                        <span key={p} className="text-[10px] bg-bg-shell text-muted px-2 py-0.5 rounded-full">{p.replace("GM Dental - ", "")}</span>
                      ))}
                    </div>

                    {/* Metrics row */}
                    {offer.status !== "Draft" && (
                      <div className="grid grid-cols-4 gap-1 text-center border-t border-line pt-3">
                        <div>
                          <div className="text-xs font-bold text-ink">{offer.views.toLocaleString()}</div>
                          <div className="text-[9px] text-muted">Views</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-ink">{offer.clicks.toLocaleString()}</div>
                          <div className="text-[9px] text-muted">Clicks</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-ink">{offer.conversions}</div>
                          <div className="text-[9px] text-muted">Conv.</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-primary">£{(offer.revenue / 1000).toFixed(0)}k</div>
                          <div className="text-[9px] text-muted">Rev.</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 border-t border-line bg-bg-soft">
                    <button onClick={() => handleCopy(offer)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-muted hover:text-ink transition">
                      {copiedId === offer.id ? <><Check size={11} className="text-green-500" /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                    <button
                      onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-muted hover:text-ink transition ml-auto">
                      {isExpanded ? <><ChevronUp size={11} /> Less</> : <><Eye size={11} /> Details</>}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-line bg-bg-soft text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted">Usage count</span>
                        <span className="font-semibold text-ink">{offer.usageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Click-through rate</span>
                        <span className="font-semibold text-ink">
                          {offer.views > 0 ? ((offer.clicks / offer.views) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Conversion rate</span>
                        <span className="font-semibold text-ink">
                          {offer.clicks > 0 ? ((offer.conversions / offer.clicks) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Revenue generated</span>
                        <span className="font-semibold text-primary">£{offer.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "Templates" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Offer Templates Backend</p>
              <p className="text-xs text-amber-600 leading-relaxed">Offer templates require a <code className="font-mono bg-amber-100 px-1 rounded">GET /api/offers/templates</code> endpoint returning template definitions (name, description, default fields). Templates can then pre-fill the create offer form.</p>
            </div>
          </div>
        )}

        {/* Create Offer Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                <h2 className="text-sm font-bold text-ink">Create New Offer</h2>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Title</label>
                  <input type="text" placeholder="e.g., Free Consultation"
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Description</label>
                  <textarea rows={2} placeholder="What does this offer include?"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white">
                      {["Percentage", "Fixed", "Bundle", "Free"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Value</label>
                    <input type="text" placeholder="e.g., 20% or £199"
                      value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Start Date</label>
                    <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">End Date</label>
                    <input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 block">Applicable Practices</label>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICES.map((p) => (
                      <button key={p} onClick={() => togglePractice(p)}
                        className={cn("text-xs px-3 py-1.5 rounded-lg border font-semibold transition",
                          form.practices.includes(p)
                            ? "bg-primary text-white border-primary"
                            : "border-line text-muted hover:border-primary/40")}>
                        {p.replace("GM Dental - ", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-6 pb-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border border-line text-muted hover:text-ink transition">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition">
                  Save as Draft
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition">
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
