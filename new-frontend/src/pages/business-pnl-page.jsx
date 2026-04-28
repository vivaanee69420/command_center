import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";

const BUSINESSES_LIST = [
  "GM Dental Ashford",
  "GM Dental Rochester",
  "GM Dental Barnet",
  "GM Dental Bexleyheath",
  "Warwick Lodge Dental",
  "Rye Dental Practice",
  "Elevate Dental Academy",
  "GM Dental Lab",
  "Elevate Accounts",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = ["2024", "2025", "2026"];

const PNL_SECTIONS = [
  {
    title: "Revenue",
    color: "#10b981",
    bg: "#f0fdf4",
    headerText: "#065f46",
    items: [
      "Treatment Revenue",
      "Consultations",
      "Hygiene Services",
      "Cosmetic",
      "Implants & Surgery",
      "Orthodontics",
      "Other Revenue",
    ],
  },
  {
    title: "Direct Costs",
    color: "#3b82f6",
    bg: "#eff6ff",
    headerText: "#1e3a8a",
    items: ["Dental Materials", "Lab Fees", "Clinician Pay", "Nursing Staff"],
  },
  {
    title: "Overheads",
    color: "#ef4444",
    bg: "#fef2f2",
    headerText: "#7f1d1d",
    items: [
      "Rent & Rates",
      "Utilities",
      "Insurance",
      "Software",
      "Equipment",
      "CQC",
      "Admin & Reception",
      "Practice Management",
    ],
  },
  {
    title: "Marketing",
    color: "#f97316",
    bg: "#fff7ed",
    headerText: "#7c2d12",
    items: [
      "Google Ads",
      "Facebook/Meta Ads",
      "SEO & Content",
      "Social Media Mgmt",
      "Other Marketing",
    ],
  },
  {
    title: "Other Costs",
    color: "#6b7280",
    bg: "#f9fafb",
    headerText: "#111827",
    items: ["Finance & Accounting", "Legal", "Training", "Miscellaneous"],
  },
];

function PnLCard({ section }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(section.items.map((item) => [item, ""]))
  );

  const total = section.items.reduce((sum, item) => sum + (parseFloat(values[item]) || 0), 0);

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: section.bg, borderBottom: `2px solid ${section.color}` }}>
        <h3 className="text-sm font-bold" style={{ color: section.headerText }}>{section.title}</h3>
        <span className="text-sm font-bold" style={{ color: section.color }}>
          {total > 0 ? formatCurrency(total) : "£0"}
        </span>
      </div>
      <div className="p-4 space-y-2">
        {section.items.map((item) => (
          <div key={item} className="flex items-center justify-between gap-3">
            <label className="text-xs text-muted flex-1">{item}</label>
            <input
              type="number"
              min="0"
              value={values[item]}
              onChange={(e) => setValues((prev) => ({ ...prev, [item]: e.target.value }))}
              placeholder="0"
              className="w-28 text-right text-xs border border-line rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary text-ink bg-bg-soft"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessPnlPage() {
  const [business, setBusiness] = useState("GM Dental Ashford");
  const [month, setMonth] = useState("Apr");
  const [year, setYear] = useState("2026");

  const summaryRows = [
    { label: "Revenue", value: 0, color: "#10b981" },
    { label: "Direct Costs", value: 0, color: "#3b82f6" },
    { label: "Overheads", value: 0, color: "#ef4444" },
    { label: "Marketing", value: 0, color: "#f97316" },
    { label: "Other Costs", value: 0, color: "#6b7280" },
  ];

  const totalCosts = 0;
  const netProfit = 0;
  const margin = 0;

  return (
    <>
      <Topbar title="Business Profit & Loss" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          title="Business Profit & Loss"
          subtitle="Track monthly P&L by business against targets"
          right={
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {BUSINESSES_LIST.map((b) => <option key={b}>{b}</option>)}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="text-xs border border-line rounded-lg px-3 py-2 bg-white text-ink font-medium focus:outline-none"
              >
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition">
                Save
              </button>
            </div>
          }
        />

        {/* Business Header Card */}
        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-bold text-ink">{business}</h2>
              <p className="text-xs text-muted mt-0.5">
                {business.toLowerCase().replace(/\s+/g, "") + ".co.uk"} · {month} {year}
              </p>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Revenue", value: "£0", color: "#10b981" },
                { label: "Total Costs", value: "£0", color: "#ef4444" },
                { label: "Net Profit", value: "£0", color: "#3b82f6" },
                { label: "Margin %", value: "0%", color: "#7c3aed" },
              ].map((k) => (
                <div key={k.label} className="text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wide font-semibold">{k.label}</p>
                  <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* P&L Grid — 3 columns first row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {PNL_SECTIONS.slice(0, 3).map((section) => (
            <PnLCard key={section.title} section={section} />
          ))}
        </div>

        {/* Second row — 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {PNL_SECTIONS.slice(3).map((section) => (
            <PnLCard key={section.title} section={section} />
          ))}
        </div>

        {/* P&L Summary */}
        <div className="bg-white border border-line rounded-xl p-5">
          <h2 className="text-sm font-bold text-ink mb-4">P&L Summary</h2>
          <div className="space-y-2 max-w-md">
            {summaryRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-line-soft">
                <span className="text-sm text-muted">{row.label}</span>
                <span className="text-sm font-semibold" style={{ color: row.color }}>{formatCurrency(row.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 border-b border-line">
              <span className="text-sm font-semibold text-red-500">Total Costs</span>
              <span className="text-sm font-bold text-red-500">{formatCurrency(totalCosts)}</span>
            </div>
            <div className={cn("flex items-center justify-between py-3 px-3 rounded-lg mt-2", netProfit >= 0 ? "bg-green-50" : "bg-red-50")}>
              <span className={cn("text-sm font-bold uppercase tracking-wide", netProfit >= 0 ? "text-green-700" : "text-red-700")}>
                Net Profit
              </span>
              <span className={cn("text-base font-bold", netProfit >= 0 ? "text-green-700" : "text-red-700")}>
                {formatCurrency(netProfit)} ({margin}%)
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
