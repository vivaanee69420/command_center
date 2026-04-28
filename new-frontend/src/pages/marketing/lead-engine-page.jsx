import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { RefreshCw, Download, AlertTriangle, Globe } from "lucide-react";

const KPI_CARDS = [
  {
    label: "Total Leads",
    value: 503,
    color: "#10b981",
    breakdown: [
      { label: "Email", count: 421 },
      { label: "Personal", count: 312 },
      { label: "Lemlist", count: 187 },
      { label: "GHL", count: 94 },
      { label: "Replied", count: 38 },
      { label: "Booked", count: 12 },
    ],
  },
  {
    label: "UK Practice Owners",
    value: 502,
    color: "#7c3aed",
    breakdown: [
      { label: "Email", count: 419 },
      { label: "Personal", count: 311 },
      { label: "Lemlist", count: 185 },
      { label: "GHL", count: 93 },
      { label: "Replied", count: 37 },
      { label: "Booked", count: 12 },
    ],
  },
  {
    label: "UK Associates",
    value: 1,
    color: "#3b82f6",
    breakdown: [
      { label: "Email", count: 1 },
      { label: "Personal", count: 1 },
      { label: "Lemlist", count: 1 },
      { label: "GHL", count: 0 },
      { label: "Replied", count: 1 },
      { label: "Booked", count: 0 },
    ],
  },
  {
    label: "India Colleges",
    value: 0,
    color: "#f59e0b",
    breakdown: [
      { label: "Email", count: 0 },
      { label: "Personal", count: 0 },
      { label: "Lemlist", count: 0 },
      { label: "GHL", count: 0 },
      { label: "Replied", count: 0 },
      { label: "Booked", count: 0 },
    ],
  },
];

const BADGE_COLORS = {
  Email: "bg-info-soft text-info",
  Personal: "bg-purple-soft text-purple",
  Lemlist: "bg-warning-soft text-warning",
  GHL: "bg-orange-soft text-orange",
  Replied: "bg-primary-soft text-primary",
  Booked: "bg-danger-soft text-danger",
};

const CQC_REGIONS = [
  "London",
  "South East",
  "South West",
  "East Midlands",
  "West Midlands",
  "North West",
  "North East",
  "Yorkshire",
  "East of England",
];

const PERSONAS = [
  "UK Practice Owners",
  "UK Associates",
  "India Colleges",
];

export default function LeadEnginePage() {
  const [postcode, setPostcode] = useState("");
  const [nhsLimit, setNhsLimit] = useState(50);
  const [cqcRegion, setCqcRegion] = useState("London");
  const [cqcLimit, setCqcLimit] = useState(50);
  const [findPersona, setFindPersona] = useState("UK Practice Owners");
  const [findLimit, setFindLimit] = useState(20);

  return (
    <>
      <Topbar title="Lead Engine" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🔗"
          title="Lead Engine"
          subtitle="B2B Outbound Pipeline — Apollo → Hunter → Claude → Instantly/Lemlist/GHL"
          actions={[
            { label: "Refresh", icon: <RefreshCw size={14} />, variant: "outline" },
            { label: "Export All CSV", icon: <Download size={14} />, variant: "primary" },
          ]}
        />

        {/* Info Banner */}
        <div className="mb-5 bg-warning-soft border border-warning rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink mb-2">Lead Requirements for Each Stage:</p>
              <ul className="text-xs text-ink space-y-1 list-disc list-inside">
                <li><span className="font-medium">Hunter Enrich:</span> Requires first name, last name, and company/domain — enriches with professional email address</li>
                <li><span className="font-medium">Claude Personalise:</span> Requires name + email + practice/company name — generates personalised icebreaker</li>
                <li><span className="font-medium">Instantly/Lemlist Push:</span> Requires email + icebreaker — pushes to cold email campaign</li>
                <li><span className="font-medium">GHL Push:</span> Requires phone number — pushes to GHL CRM for SMS/WhatsApp/call sequences</li>
              </ul>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPI_CARDS.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-line rounded-xl p-5"
              style={{ borderLeftWidth: 4, borderLeftColor: card.color }}
            >
              <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">
                {card.label}
              </div>
              <div className="text-3xl font-bold text-ink mb-3">{card.value}</div>
              <div className="flex flex-wrap gap-1.5">
                {card.breakdown.map((b) => (
                  <span
                    key={b.label}
                    className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", BADGE_COLORS[b.label])}
                  >
                    {b.label}: {b.count}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lead Sources */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-ink mb-3">Lead Sources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* NHS Dental Practices */}
            <div className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base font-bold text-ink">NHS Dental Practices</span>
                <span className="text-[10px] bg-primary-soft text-primary font-semibold px-2 py-0.5 rounded-full">NHS API</span>
              </div>
              <p className="text-xs text-muted mb-4">Pull NHS dental practices by postcode. Returns practice name, address, phone, website.</p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 block">Postcode</label>
                  <input
                    type="text"
                    placeholder="e.g. SW1A 1AA"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 block">Limit</label>
                  <input
                    type="number"
                    value={nhsLimit}
                    onChange={(e) => setNhsLimit(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>
              <button className="w-full py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                Pull NHS Practices
              </button>
            </div>

            {/* CQC Registered Practices */}
            <div className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base font-bold text-ink">CQC Registered Practices</span>
                <span className="text-[10px] bg-info-soft text-info font-semibold px-2 py-0.5 rounded-full">CQC API</span>
              </div>
              <p className="text-xs text-muted mb-4">Pull CQC-registered dental practices by region. Returns name, address, CQC rating, contact info.</p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 block">Region</label>
                  <select
                    value={cqcRegion}
                    onChange={(e) => setCqcRegion(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
                  >
                    {CQC_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 block">Limit</label>
                  <input
                    type="number"
                    value={cqcLimit}
                    onChange={(e) => setCqcLimit(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>
              <button className="w-full py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                Pull CQC Practices
              </button>
            </div>
          </div>
        </div>

        {/* Find Missing Websites */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-ink mb-3">Find Missing Websites</h2>
          <div className="bg-white border border-line rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-muted" />
              <span className="text-sm font-bold text-ink">Google Website Finder</span>
            </div>
            <p className="text-xs text-muted mb-4">
              For leads missing a website URL, Claude will search Google using their practice name + location to find and populate the website field.
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 block">Persona</label>
                <select
                  value={findPersona}
                  onChange={(e) => setFindPersona(e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
                >
                  {PERSONAS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 block">Limit</label>
                <input
                  type="number"
                  value={findLimit}
                  onChange={(e) => setFindLimit(e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
                />
              </div>
              <button className="px-5 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                Find Websites via Google
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline Control */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-ink mb-3">Pipeline Control</h2>
          <div className="bg-white border border-line rounded-xl p-5">
            <p className="text-xs text-muted">Pipeline control actions (Hunter enrich, Claude personalise, Instantly/Lemlist push, GHL push) will appear here once leads are loaded.</p>
          </div>
        </div>
      </main>
    </>
  );
}
