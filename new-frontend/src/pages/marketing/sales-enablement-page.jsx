import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, Search, Calculator, FileText,
  MessageSquare, Star, TrendingUp, Lightbulb, Users, Quote
} from "lucide-react";

const TABS = ["Sales Scripts", "Objection Handling", "Price Lists", "Case Studies", "ROI Calculator"];

// ─── Sales Scripts ───────────────────────────────────────────────────────────
const SCRIPTS = [
  {
    id: 1, name: "Initial Consultation Script", purpose: "First patient contact — phone or walk-in",
    lastUpdated: "20 Apr 2026",
    body: `OPENING:
"Hi [Name], thanks for calling GM Dental — my name is [Rep]. I see you're interested in [Treatment]. I'd love to help you get the smile you deserve. Do you have 5 minutes so I can answer a few questions and find you the best option?"

QUALIFYING:
- "How long have you been thinking about this?"
- "Have you had a consultation elsewhere, or is this your first enquiry?"
- "What's most important to you — speed of treatment, price, or the final result?"
- "Is there anything that's been holding you back so far?"

CLOSING:
"Based on what you've told me, I'd love to get you in for a free consultation with Dr [Name]. We have [Day] at [Time] or [Day] at [Time] — which works better for you?"

OBJECTION BRIDGE:
If they hesitate: "I completely understand. Most of our patients felt the same way before their consultation — and they told us afterwards they wish they'd called sooner. Can I pencil you in and you can always reschedule?"`,
  },
  {
    id: 2, name: "Implant Consultation Script", purpose: "Dental implant patients post-consultation",
    lastUpdated: "18 Apr 2026",
    body: `RECAP THE CONSULTATION:
"Hi [Name], it's [Rep] from GM Dental — I'm just calling to follow up on your implant consultation with Dr [Name] on [Date]. How are you feeling about everything discussed?"

VALUE REINFORCEMENT:
- "Just to recap — the treatment plan Dr [Name] recommended was [Plan], and the total investment is [Price]."
- "You mentioned [patient concern] — Dr [Name] has treated hundreds of similar cases with excellent results."
- "One thing patients often don't realise is that implants are actually the most cost-effective long-term solution — unlike dentures or bridges, they can last a lifetime with proper care."

FINANCE BRIDGE:
"We offer 0% finance over 12 months, which works out to just £[monthly] per month. Would that make it easier to move forward?"

CLOSE:
"I can hold that treatment slot for 48 hours. Would you like to confirm today so we can get your smile journey started?"`,
  },
  {
    id: 3, name: "Invisalign Pitch Script", purpose: "Patients enquiring about clear aligners",
    lastUpdated: "15 Apr 2026",
    body: `HOOK:
"Did you know most of our Invisalign patients see visible results within just 3 months? And the best part — nobody can tell you're wearing them."

DISCOVERY:
- "What's the main thing you'd like to change about your smile?"
- "Have you ever looked into braces before? What put you off?"
- "Do you have a specific event or deadline you're working towards?"

THE PITCH:
"At GM Dental, we do a full digital 3D scan so you can actually see your end result before you even commit to treatment. There's no drilling, no metal, no discomfort — just clear, removable aligners you wear 22 hours a day."

PRICING:
"Treatment starts from £3,500, and we offer a free refinement guarantee. We also have finance from £89/month with 0% interest."

CLOSE:
"Would you like to come in for a complimentary smile scan? It takes 20 minutes and you leave knowing exactly what's possible for your smile."`,
  },
  {
    id: 4, name: "Follow-Up Call Script", purpose: "Patients who haven't booked after consultation",
    lastUpdated: "12 Apr 2026",
    body: `OPENING (Day 3 follow-up):
"Hi [Name], it's [Rep] from GM Dental — I just wanted to touch base since your consultation on [Date]. I know it's a big decision and I wanted to make sure all your questions were answered."

IDENTIFY THE BLOCKER:
"Is there anything specific that's been on your mind since you came in? Sometimes patients have questions they forgot to ask — I'm here to help."

COMMON BLOCKERS:
- Price: "Have you had a chance to look at our finance options? Many patients are surprised how affordable it is per month."
- Timing: "We completely understand — we can hold your consultation notes for 3 months so when the timing is right, we don't need to start from scratch."
- Fear: "That's completely natural. Would it help to speak with one of our patients who had the same concern?"

CLOSE:
"I'd hate for you to miss out on the current offer which ends [Date]. Is there anything I can do to help you take that next step today?"`,
  },
  {
    id: 5, name: "Price Objection Script", purpose: "Handling 'too expensive' pushback",
    lastUpdated: "10 Apr 2026",
    body: `ACKNOWLEDGE:
"I completely understand — it's a significant investment, and it's important you feel confident about it."

REFRAME THE VALUE:
"Can I ask — when you say it's expensive, are you comparing it to something specific, or is it just more than you'd budgeted for?"

IF COMPARING TO COMPETITOR:
"That's fair. Have they included [CT scan / ceramic crown / aftercare guarantee] in that price? At GM Dental, everything is included — there are no hidden extras."

IF BUDGET CONCERN:
"The good news is you don't have to pay it all upfront. On our 12-month 0% finance plan, [Treatment] works out to just £[monthly] per month — less than a daily coffee. Would that change things?"

THE TRUE COST COMPARISON:
"I always find it helpful to think about it this way — a dental implant lasts 20+ years with proper care. Over that time, you're paying roughly £[X] per year for a permanent, natural-looking tooth. Dentures and bridges need replacing every 5–10 years and cost almost as much each time."

CLOSE:
"Does that make sense? Would you like me to run through the finance options together?"`,
  },
];

// ─── Objections ──────────────────────────────────────────────────────────────
const OBJECTIONS = [
  {
    id: 1, objection: '"It\'s too expensive"', category: "Price", color: "#ef4444",
    response: "Acknowledge the concern, then reframe the value. Compare the lifetime cost of implants vs repeated denture replacements. Introduce 0% finance and break the monthly cost down (e.g., £2,999 = £83/month over 36 months).",
    tips: ["Never apologise for your price", "Use the coffee comparison — '£2.70 a day'", "Pivot to monthly cost immediately", "Ask: 'What budget were you thinking?'"],
  },
  {
    id: 2, objection: '"I need to think about it"', category: "Timing", color: "#f59e0b",
    response: "Identify what specifically they need to think about. Create gentle urgency without pressure. Offer to book a 'soft hold' slot they can cancel if needed.",
    tips: ["Ask: 'What would help you feel confident to move forward?'", "Mention that treatment slots fill fast", "Offer to send a follow-up summary email", "Set a specific callback time rather than leaving it open"],
  },
  {
    id: 3, objection: '"I\'m going to another dentist"', category: "Competition", color: "#3b82f6",
    response: "Don't panic or badmouth competitors. Ask what's attracting them — is it price, location, or a specific dentist? Highlight your unique value (guarantee, BACD accreditation, same-day implants).",
    tips: ["Ask: 'What specifically are you comparing?'", "Lead with your guarantee and aftercare", "Offer a second opinion consultation free of charge", "Mention Google/Trustpilot rating"],
  },
  {
    id: 4, objection: '"My insurance doesn\'t cover it"', category: "Insurance", color: "#7c3aed",
    response: "Empathise, then pivot to in-house finance options. Explain that most cosmetic and implant work isn't covered anywhere, making your finance plan the practical alternative.",
    tips: ["Don't get drawn into insurance details you don't know", "Focus on what we CAN offer — 0% finance", "Suggest they call their insurer to confirm cover", "Highlight our payment flexibility"],
  },
  {
    id: 5, objection: '"I\'m scared of the dentist / treatment"', category: "Fear", color: "#10b981",
    response: "Take this very seriously — don't minimise it. Offer a meet-the-dentist consultation with no treatment. Describe the IV sedation option. Share patient testimonials of anxious patients.",
    tips: ["Never say 'don't worry' or 'it won't hurt'", "Offer a no-treatment consultation just to meet the team", "Mention sedation dentistry options", "Ask if they'd like to hear from a past patient"],
  },
];

// ─── Price Lists ─────────────────────────────────────────────────────────────
const PRICE_DATA = {
  "GM Dental - Luton": [
    { treatment: "Dental Implant (Single)", standard: 3200, offer: 2999, margin: 58 },
    { treatment: "All-on-4 (Full Arch)", standard: 14995, offer: 12995, margin: 52 },
    { treatment: "Invisalign (Comprehensive)", standard: 4800, offer: 3800, margin: 61 },
    { treatment: "Composite Bonding (per tooth)", standard: 350, offer: 299, margin: 65 },
    { treatment: "Teeth Whitening (In-Chair)", standard: 399, offer: 299, margin: 72 },
    { treatment: "Family Check-Up Bundle", standard: 320, offer: 249, margin: 48 },
  ],
  "GM Dental - Watford": [
    { treatment: "Dental Implant (Single)", standard: 3100, offer: 2999, margin: 57 },
    { treatment: "Invisalign (Lite)", standard: 3200, offer: 2800, margin: 59 },
    { treatment: "Composite Bonding (per tooth)", standard: 340, offer: 299, margin: 64 },
    { treatment: "Teeth Whitening (In-Chair)", standard: 380, offer: 299, margin: 70 },
  ],
};

// ─── Case Studies ─────────────────────────────────────────────────────────────
const CASE_STUDIES = [
  {
    id: 1, title: "Emma's All-on-4 Journey", practice: "GM Dental - Luton",
    profile: "Female, 58. Long-term denture wearer, embarrassed to smile in photos.",
    treatment: "All-on-4 Full Arch Restoration — upper jaw. Treatment completed in 2 appointments over 3 days.",
    result: "Fixed teeth same day. Natural appearance. No more denture adhesive. Patient returned 6 months later for lower arch.",
    testimonial: "I cried in the car on the way home — happy tears. I hadn't smiled properly in 15 years. Dr Sharma changed my life.",
    revenue: 24990, star: 5,
  },
  {
    id: 2, title: "James's Invisalign Transformation", practice: "GM Dental - Harrow",
    profile: "Male, 34. Software engineer. Mild crowding, self-conscious about teeth in video calls.",
    treatment: "Invisalign Comprehensive. 14 months, 28 aligners. No extractions needed.",
    result: "Straight teeth achieved in 14 months. Patient upgraded to whitening treatment at Month 12.",
    testimonial: "I kept it secret from my colleagues until the end. Nobody noticed I was wearing them — and the result was incredible.",
    revenue: 4950, star: 5,
  },
  {
    id: 3, title: "Priya's Smile Makeover", practice: "GM Dental - Wembley",
    profile: "Female, 29. Getting married in 8 months. Chipped front tooth, mild discolouration.",
    treatment: "4 composite veneers + in-chair whitening package.",
    result: "Completed 6 weeks before wedding. Patient bought additional take-home kit for maintenance.",
    testimonial: "Every bride deserves to feel confident on her wedding day. Dr Patel made that possible for me.",
    revenue: 1496, star: 5,
  },
  {
    id: 4, title: "Robert's Single Implant", practice: "GM Dental - Watford",
    profile: "Male, 47. Missing upper molar after failed root canal. Avoiding eating on left side.",
    treatment: "Single titanium implant — molar position. BioHorizons implant, zirconia crown.",
    result: "Full function restored after 4-month healing period. Patient reported no further jaw pain.",
    testimonial: "I was convinced implants would be painful. I had virtually no discomfort — it's the best decision I've made.",
    revenue: 2999, star: 5,
  },
];

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

  const filteredScripts = useMemo(() =>
    SCRIPTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.purpose.toLowerCase().includes(search.toLowerCase())),
    [search]);

  const priceRows = PRICE_DATA[priceLocation] || [];

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
          <div>
            <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-white w-64 mb-4">
              <Search size={13} className="text-muted shrink-0" />
              <input type="text" placeholder="Search scripts..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted" />
            </div>
            <div className="space-y-3">
              {filteredScripts.map((script) => {
                const isOpen = expandedScript === script.id;
                return (
                  <div key={script.id} className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-sm transition">
                    <button
                      onClick={() => setExpandedScript(isOpen ? null : script.id)}
                      className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <FileText size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-ink mb-0.5">{script.name}</div>
                          <div className="text-xs text-muted">{script.purpose}</div>
                          <div className="text-[10px] text-muted mt-1">Last updated: {script.lastUpdated}</div>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-muted shrink-0 mt-1" /> : <ChevronDown size={16} className="text-muted shrink-0 mt-1" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-line px-5 py-4">
                        <pre className="text-xs text-ink whitespace-pre-wrap font-mono bg-bg-soft rounded-lg p-4 leading-relaxed">
                          {script.body}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Objection Handling Tab */}
        {activeTab === "Objection Handling" && (
          <div className="space-y-3">
            {OBJECTIONS.map((obj) => {
              const isOpen = expandedObjn === obj.id;
              return (
                <div key={obj.id} className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-sm transition"
                  style={{ borderLeftWidth: 4, borderLeftColor: obj.color }}>
                  <button
                    onClick={() => setExpandedObjn(isOpen ? null : obj.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-ink">{obj.objection}</span>
                          <span className="text-[10px] bg-bg-shell text-muted font-semibold px-2 py-0.5 rounded-full">{obj.category}</span>
                        </div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-muted shrink-0" /> : <ChevronDown size={16} className="text-muted shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-line px-5 py-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                          <MessageSquare size={11} /> Recommended Response
                        </p>
                        <p className="text-xs text-ink leading-relaxed bg-bg-soft rounded-lg p-3">{obj.response}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Lightbulb size={11} /> Tips
                        </p>
                        <ul className="space-y-1.5">
                          {obj.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-ink">
                              <span className="w-4 h-4 rounded-full bg-primary-soft text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Price Lists Tab */}
        {activeTab === "Price Lists" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <select value={priceLocation} onChange={(e) => setPriceLocation(e.target.value)}
                className="border border-line rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary bg-white">
                {Object.keys(PRICE_DATA).map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    {["Treatment", "Standard Price", "Offer Price", "Saving", "Margin"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-semibold text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {priceRows.map((row, i) => (
                    <tr key={i} className="hover:bg-bg-soft transition">
                      <td className="px-5 py-3 font-semibold text-ink">{row.treatment}</td>
                      <td className="px-5 py-3 text-muted line-through">£{row.standard.toLocaleString()}</td>
                      <td className="px-5 py-3 font-bold text-primary">£{row.offer.toLocaleString()}</td>
                      <td className="px-5 py-3 text-green-600 font-semibold">
                        £{(row.standard - row.offer).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-bg-shell rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${row.margin}%` }} />
                          </div>
                          <span className="text-muted">{row.margin}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Case Studies Tab */}
        {activeTab === "Case Studies" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {CASE_STUDIES.map((cs) => (
              <div key={cs.id} className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-sm transition">
                <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-bg-soft">
                  <div>
                    <div className="text-sm font-bold text-ink">{cs.title}</div>
                    <div className="text-[10px] text-muted">{cs.practice}</div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: cs.star }).map((_, i) => (
                      <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Users size={10} /> Patient Profile
                    </p>
                    <p className="text-xs text-ink">{cs.profile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                      <FileText size={10} /> Treatment
                    </p>
                    <p className="text-xs text-ink">{cs.treatment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                      <TrendingUp size={10} /> Result
                    </p>
                    <p className="text-xs text-ink">{cs.result}</p>
                  </div>
                  <div className="bg-primary-soft rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Quote size={14} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-ink italic leading-relaxed">{cs.testimonial}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-line">
                    <span className="text-[10px] text-muted">Treatment Revenue</span>
                    <span className="text-sm font-bold text-primary">£{cs.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ROI Calculator Tab */}
        {activeTab === "ROI Calculator" && <ROICalculator />}
      </main>
    </>
  );
}
