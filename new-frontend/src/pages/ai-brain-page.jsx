import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { Upload } from "lucide-react";

const KPI_CARDS = [
  {
    emoji: "🧠",
    emojiBg: "bg-amber-50",
    label: "KNOWLEDGE BASE",
    value: "240",
    sublabel: "documents indexed",
  },
  {
    emoji: "📊",
    emojiBg: "bg-green-50",
    label: "REPORTS ANALYSED",
    value: "89",
    sublabel: "all-time",
  },
  {
    emoji: "✨",
    emojiBg: "bg-purple-50",
    label: "INSIGHTS GENERATED",
    value: "124",
    sublabel: "this month",
  },
];

const DIRECTIVES = [
  {
    id: 1,
    text: "Warwick Meta CPL drifted +28% in 7d (£42→£54). Pause 'Smile Today' adset, scale 'Free CBCT' to £80/day.",
    score: "0.92",
    tag: "ad_cpl_drift",
  },
  {
    id: 2,
    text: "FTS Dentally shows 4 no-shows yesterday vs 1.2 avg. Flag staff training; trigger £50 deposit policy review.",
    score: "0.87",
    tag: "dentally_no_show",
  },
  {
    id: 3,
    text: "Plan4Growth landing page conversion dropped to 1.8% (was 3.4%). Test new hero variant.",
    score: "0.81",
    tag: "conversion_drop",
  },
];

const SUGGESTED_QUESTIONS = [
  "What were the marketing campaigns last month?",
  "Which businesses underperformed this quarter?",
  "Email subscriber count for Plan4Growth?",
];

export default function AiBrainPage() {
  const [question, setQuestion] = useState("");
  const [dismissed, setDismissed] = useState(new Set());

  return (
    <>
      <Topbar
        title="AI Brain"
        subtitle="Your knowledge hub and AI assistant"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition">
            <Upload size={15} />
            Upload Knowledge
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter />

        <div className="flex gap-6 mt-6">
          {/* Main content: two columns */}
          <div className="flex gap-6 flex-1 min-w-0">

            {/* Left column */}
            <div className="flex-1 min-w-0">

              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {KPI_CARDS.map((card) => (
                  <div
                    key={card.label}
                    className="bg-white border border-line rounded-xl p-5"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${card.emojiBg}`}
                    >
                      {card.emoji}
                    </div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-3">
                      {card.label}
                    </div>
                    <div className="text-2xl font-bold text-ink">{card.value}</div>
                    <div className="text-xs text-muted">{card.sublabel}</div>
                  </div>
                ))}
              </div>

              {/* Top Directives */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-ink">Top directives</span>
                  <span className="text-xs text-muted">scored 0–1 · auto-task at ≥0.85</span>
                </div>
                <div className="bg-white border border-line rounded-xl divide-y divide-line">
                  {DIRECTIVES.filter((d) => !dismissed.has(d.id)).map((d) => (
                    <div key={d.id} className="px-5 py-4 flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="text-sm text-ink leading-snug">{d.text}</div>
                        <div className="text-xs text-muted mt-1">
                          score {d.score} · {d.tag}
                        </div>
                      </div>
                      <button
                        onClick={() => setDismissed((prev) => new Set([...prev, d.id]))}
                        className="text-xs text-primary font-semibold flex-shrink-0"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="w-[360px] flex-shrink-0">
              <div className="bg-white border border-line rounded-xl p-5">
                <div className="text-base font-bold text-ink">Ask AI</div>
                <div className="text-xs text-muted mt-1">
                  Anything about your business — answers grounded in real data
                </div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  placeholder="e.g. What's the trend in marketing campaigns?"
                  className="mt-3 w-full border border-line rounded-lg p-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <button className="mt-3 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition">
                  Ask 🧠
                </button>

                <div className="mt-4">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                    SUGGESTED QUESTIONS
                  </div>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <div
                      key={i}
                      onClick={() => setQuestion(q)}
                      className="text-xs text-ink py-2 border-b border-line cursor-pointer hover:text-primary transition-colors"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
