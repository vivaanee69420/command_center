import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, Search, Calculator, FileText,
  MessageSquare, Star, TrendingUp, Lightbulb, Users, Quote
} from "lucide-react";

const TABS = ["Sales Scripts", "Objection Handling", "Price Lists", "Case Studies", "ROI Calculator"];

// SCRIPTS, OBJECTIONS, PRICE_DATA, CASE_STUDIES removed — requires sales enablement backend.
const SCRIPTS = [];
const OBJECTIONS = [];
const PRICE_DATA = {};
const CASE_STUDIES = [];

// ─── ROI Calculator ──────────────────────────────────────────────────────────
function ROICalculator() {
  const [adSpend, setAdSpend] = useState(5000);
  const [cpl, setCpl] = useState(35);
  const [convRate, setConvRate] = useState(15);
  const [avgValue, setAvgValue] = useState(2800);

  const leads = cpl > 0 ? Math.floor(adSpend / cpl) : 0;
  const conversions = Math.floor(leads * (convRate / 100));
  const revenue = conversions * avgValue;
  const profit = revenue - adSpend;
  const roi = adSpend > 0 ? ((profit / adSpend) * 100).toFixed(0) : 0;
  const breakEven = avgValue > 0 ? Math.ceil(adSpend / avgValue) : 0;
  const roas = adSpend > 0 ? (revenue / adSpend).toFixed(1) : 0;

  const InputRow = ({ label, value, onChange, prefix, suffix, min, max, step }) => (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <label className="text-xs font-semibold text-ink">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs text-muted">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step || 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 border border-line rounded-lg px-2 py-1.5 text-xs text-right outline-none focus:border-primary transition"
        />
        {suffix && <span className="text-xs text-muted">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Inputs */}
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line flex items-center gap-2">
          <Calculator size={15} className="text-primary" />
          <h3 className="text-sm font-bold text-ink">Campaign Inputs</h3>
        </div>
        <div className="px-5">
          <InputRow label="Monthly Ad Spend" value={adSpend} onChange={setAdSpend} prefix="£" min={0} step={100} />
          <InputRow label="Cost Per Lead (CPL)" value={cpl} onChange={setCpl} prefix="£" min={1} />
          <InputRow label="Lead-to-Patient Conversion Rate" value={convRate} onChange={setConvRate} suffix="%" min={1} max={100} />
          <InputRow label="Average Treatment Value" value={avgValue} onChange={setAvgValue} prefix="£" min={0} step={100} />
        </div>
      </div>

      {/* Results */}
      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line flex items-center gap-2">
          <TrendingUp size={15} className="text-green-600" />
          <h3 className="text-sm font-bold text-ink">Projected Results</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-soft rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-ink">{leads}</div>
              <div className="text-[11px] text-muted font-medium mt-0.5">Leads Generated</div>
            </div>
            <div className="bg-bg-soft rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-ink">{conversions}</div>
              <div className="text-[11px] text-muted font-medium mt-0.5">New Patients</div>
            </div>
            <div className="bg-primary-soft rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">£{revenue.toLocaleString()}</div>
              <div className="text-[11px] text-muted font-medium mt-0.5">Projected Revenue</div>
            </div>
            <div className={cn("rounded-xl p-4 text-center", profit >= 0 ? "bg-green-50" : "bg-red-50")}>
              <div className={cn("text-2xl font-bold", profit >= 0 ? "text-green-600" : "text-red-600")}>
                £{profit.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted font-medium mt-0.5">Net Profit</div>
            </div>
          </div>
          <div className="border-t border-line pt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Return on Ad Spend (ROAS)</span>
              <span className={cn("font-bold", Number(roas) >= 3 ? "text-green-600" : "text-amber-600")}>{roas}x</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">ROI</span>
              <span className={cn("font-bold", Number(roi) >= 0 ? "text-green-600" : "text-red-600")}>{roi}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Break-Even (patients needed)</span>
              <span className="font-bold text-ink">{breakEven}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Cost per Acquired Patient</span>
              <span className="font-bold text-ink">
                £{conversions > 0 ? Math.round(adSpend / conversions).toLocaleString() : "—"}
              </span>
            </div>
          </div>
          <div className={cn("rounded-xl p-3 mt-2", Number(roi) >= 200 ? "bg-green-50" : Number(roi) >= 0 ? "bg-amber-50" : "bg-red-50")}>
            <p className={cn("text-xs font-semibold", Number(roi) >= 200 ? "text-green-700" : Number(roi) >= 0 ? "text-amber-700" : "text-red-700")}>
              {Number(roi) >= 200
                ? `Strong ROI — every £1 spent returns £${(revenue / adSpend).toFixed(2)} in revenue.`
                : Number(roi) >= 0
                ? "Positive but low ROI — consider increasing conversion rate or average treatment value."
                : "Negative ROI — reduce CPL or increase treatment conversion rate."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalesEnablementPage() {
  const [activeTab, setActiveTab] = useState("Sales Scripts");
  const [expandedScript, setExpandedScript] = useState(null);
  const [expandedObjn, setExpandedObjn] = useState(null);
  const [search, setSearch] = useState("");
  const [priceLocation, setPriceLocation] = useState("GM Dental - Luton");

  // filteredScripts and priceRows removed — pending backend data

  return (
    <>
      <Topbar title="Sales Enablement" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎯"
          title="Sales Enablement"
          subtitle="Scripts, objection handling, price lists, case studies, and ROI tools"
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-6 w-fit flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap",
                activeTab === tab ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sales Scripts Tab */}
        {activeTab === "Sales Scripts" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Sales Scripts Backend</p>
              <p className="text-xs text-amber-600 leading-relaxed">Sales scripts require a <code className="font-mono bg-amber-100 px-1 rounded">sales_script</code> model and <code className="font-mono bg-amber-100 px-1 rounded">GET /api/sales/scripts</code> endpoint. Each script includes name, purpose, body text, and last-updated timestamp. Build a CMS or store scripts in the database with version history.</p>
            </div>
          </div>
        )}

        {/* Objection Handling Tab */}
        {activeTab === "Objection Handling" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Objection Handling Backend</p>
              <p className="text-xs text-amber-600 leading-relaxed">Objection handling requires a <code className="font-mono bg-amber-100 px-1 rounded">sales_objection</code> model and <code className="font-mono bg-amber-100 px-1 rounded">GET /api/sales/objections</code> endpoint. Each entry includes the objection text, category, recommended response, and tips array.</p>
            </div>
          </div>
        )}

        {/* Price Lists Tab */}
        {activeTab === "Price Lists" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Price List Backend</p>
              <p className="text-xs text-amber-600 leading-relaxed">Price lists require a <code className="font-mono bg-amber-100 px-1 rounded">price_list</code> model and <code className="font-mono bg-amber-100 px-1 rounded">GET /api/sales/prices?practice=slug</code> endpoint. Each row includes treatment name, standard price, offer price, and margin per practice.</p>
            </div>
          </div>
        )}

        {/* Case Studies Tab */}
        {activeTab === "Case Studies" && (
          <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — Case Studies Backend</p>
              <p className="text-xs text-amber-600 leading-relaxed">Case studies require a <code className="font-mono bg-amber-100 px-1 rounded">case_study</code> model and <code className="font-mono bg-amber-100 px-1 rounded">GET /api/sales/case-studies</code> endpoint. Each case includes patient profile, treatment, result, testimonial, revenue, and star rating.</p>
            </div>
          </div>
        )}

        {/* ROI Calculator Tab */}
        {activeTab === "ROI Calculator" && <ROICalculator />}
      </main>
    </>
  );
}
