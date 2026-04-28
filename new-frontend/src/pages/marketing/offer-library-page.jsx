import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { Copy, ChevronRight, Sparkles, Search } from "lucide-react";

const OFFERS = [
  {
    title: "Single Dental Implant",
    entity: "GM Dental Practices",
    price: "£2,500 - £3,500",
    desc: "Same-day consultation, CT scan included, 10-year guarantee",
    color: "#10b981",
  },
  {
    title: "All-on-4 Full Arch",
    entity: "GM Dental Practices",
    price: "£12,995 - £18,995",
    desc: "Fixed teeth in one day, no more dentures, finance available",
    color: "#10b981",
  },
  {
    title: "Invisalign",
    entity: "GM Dental Practices",
    price: "£3,500 - £5,500",
    desc: "Invisible braces, no metal, predictable results with 3D preview",
    color: "#10b981",
  },
  {
    title: "Implant Taster Day",
    entity: "Plan4Growth Academy",
    price: "£997",
    desc: "Hands-on implant placement on models, see if implantology is for you",
    color: "#fb923c",
  },
  {
    title: "Advanced Implant Diploma",
    entity: "Plan4Growth Academy",
    price: "£12,997",
    desc: "12-month program, live patient surgery, mentorship included, start earning from month 2",
    color: "#fb923c",
  },
  {
    title: "Italy Surgical Residency",
    entity: "Plan4Growth Academy",
    price: "£7,997",
    desc: "5-day intensive in Italy, 20+ live surgeries, complex cases, luxury experience",
    color: "#fb923c",
  },
  {
    title: "Elevate Pro",
    entity: "Elevate Accounts",
    price: "£197/month",
    desc: "Full bookkeeping, tax planning, quarterly reviews",
    color: "#7c3aed",
  },
];

const PERSONAS = [
  { name: "UK Practice Owners", entity: "GM Dental Practices", desc: "Dental practice owners seeking implant training and business growth", tags: ["#uk_practice_owners", "#implants", "#b2b"] },
  { name: "UK Associates", entity: "GM Dental Practices", desc: "Associate dentists looking to upskill and start their implant journey", tags: ["#associates", "#career", "#training"] },
  { name: "India Dental Colleges", entity: "Plan4Growth Academy", desc: "Indian dental colleges interested in partnership and referral programs", tags: ["#india", "#colleges", "#partnerships"] },
  { name: "Dental Entrepreneurs", entity: "Plan4Growth Academy", desc: "Dentists wanting to scale their practices and build a brand", tags: ["#entrepreneurs", "#scale", "#brand"] },
  { name: "Small Practice Owners", entity: "Elevate Accounts", desc: "Practice owners needing financial clarity and tax optimisation", tags: ["#finance", "#tax", "#bookkeeping"] },
];

const TABS = [
  { key: "offers", label: "Offers", count: 9 },
  { key: "personas", label: "Personas", count: 5 },
];

const ENTITY_OPTIONS = ["All Entities", "GM Dental Practices", "Plan4Growth Academy", "Elevate Accounts"];

const ENTITY_BADGE = {
  "GM Dental Practices": "bg-primary-soft text-primary",
  "Plan4Growth Academy": "bg-orange-soft text-orange",
  "Elevate Accounts": "bg-purple-soft text-purple",
};

export default function OfferLibraryPage() {
  const [activeTab, setActiveTab] = useState("offers");
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("All Entities");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const filteredOffers = OFFERS.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || o.desc.toLowerCase().includes(search.toLowerCase());
    const matchEntity = entityFilter === "All Entities" || o.entity === entityFilter;
    return matchSearch && matchEntity;
  });

  const filteredPersonas = PERSONAS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    const matchEntity = entityFilter === "All Entities" || p.entity === entityFilter;
    return matchSearch && matchEntity;
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <>
      <Topbar title="Offer Library" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📦"
          title="Offer & Audience Library"
          subtitle="Single source of truth for all offers, prices, USPs, and audience personas"
          actions={[
            { label: "Competitor Research", icon: <Sparkles size={14} />, variant: "outline" },
            { label: "+ Add Offer", variant: "primary" },
          ]}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-4 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                activeTab === tab.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 bg-white flex-1 max-w-sm">
            <Search size={14} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
          >
            {ENTITY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Offers Tab */}
        {activeTab === "offers" && (
          <div className="space-y-2">
            {filteredOffers.length === 0 && (
              <div className="bg-white border border-line rounded-xl p-8 text-center text-sm text-muted">No offers match your filters.</div>
            )}
            {filteredOffers.map((offer, idx) => (
              <div
                key={idx}
                className="bg-white border border-line rounded-xl flex items-center overflow-hidden hover:shadow-sm transition"
                style={{ borderLeftWidth: 4, borderLeftColor: offer.color }}
              >
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-ink">{offer.title}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", ENTITY_BADGE[offer.entity] || "bg-bg-soft text-muted")}>
                      {offer.entity}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{offer.desc}</p>
                </div>
                <div className="flex items-center gap-3 px-5">
                  <span className="text-sm font-bold text-primary whitespace-nowrap">{offer.price}</span>
                  <button
                    onClick={() => handleCopy(`${offer.title} — ${offer.price}: ${offer.desc}`, idx)}
                    className="text-muted hover:text-ink transition"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                  <ChevronRight size={14} className="text-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Personas Tab */}
        {activeTab === "personas" && (
          <div className="space-y-2">
            {filteredPersonas.length === 0 && (
              <div className="bg-white border border-line rounded-xl p-8 text-center text-sm text-muted">No personas match your filters.</div>
            )}
            {filteredPersonas.map((persona, idx) => (
              <div
                key={idx}
                className="bg-white border border-line rounded-xl flex items-center overflow-hidden hover:shadow-sm transition"
                style={{ borderLeftWidth: 4, borderLeftColor: "#3b82f6" }}
              >
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-ink">{persona.name}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", ENTITY_BADGE[persona.entity] || "bg-bg-soft text-muted")}>
                      {persona.entity}
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-2">{persona.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-bg-shell text-muted px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5">
                  <button className="text-muted hover:text-ink transition">
                    <Copy size={14} />
                  </button>
                  <ChevronRight size={14} className="text-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
