import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { Sparkles } from "lucide-react";

const INSIGHT_CARDS = [
  {
    id: 1,
    emoji: "📊",
    emojiBg: "bg-amber-50",
    title: "Revenue Insight",
    description:
      "Revenue is up 18.6% MoM driven by Plan4Growth Academy. Recommend doubling academy ad spend.",
    metric: "+£124k MoM",
    metricColor: "text-green-600",
  },
  {
    id: 2,
    emoji: "👋",
    emojiBg: "bg-orange-50",
    title: "Marketing Insight",
    description:
      "Composite Bonding ads outperform implants on Meta by 2.3x ROAS. Reallocate £40/day budget.",
    metric: "+34% leads",
    metricColor: "text-green-600",
  },
  {
    id: 3,
    emoji: "🔍",
    emojiBg: "bg-blue-50",
    title: "SEO Insight",
    description:
      "Page 'invisalign-maidstone' jumped from #7→#5. Add FAQ schema to push to #3 by next week.",
    metric: "+540 visits",
    metricColor: "text-green-600",
  },
  {
    id: 4,
    emoji: "⚙️",
    emojiBg: "bg-gray-50",
    title: "Operations Insight",
    description:
      "FTS no-show rate is 3.4x normal. Recommend mandatory £50 deposit policy review.",
    metric: "4 no-shows",
    metricColor: "text-red-500",
  },
];

const REPORTS = [
  { id: 1, name: "Monthly Business Report — May", date: "19 May 2025" },
  { id: 2, name: "Marketing Performance — May", date: "19 May 2025" },
  { id: 3, name: "SEO Audit Report", date: "17 May 2025" },
  { id: 4, name: "Sales Pipeline Report", date: "15 May 2025" },
];

export default function InsightsPage() {
  const [mode, setMode] = useState("all");

  return (
    <>
      <Topbar
        title="AI Insights & Reports"
        subtitle="AI-generated insights and automated reports"
        right={
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition">
            <Sparkles size={13} />
            ✨ Generate Report
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter mode={mode} onChange={setMode} />

        <div className="flex gap-6 mt-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* AI Insights Section */}
            <p className="text-base font-bold text-ink mb-4">AI Insights</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {INSIGHT_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-line rounded-xl p-5"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.emojiBg}`}
                  >
                    <span className="text-lg">{card.emoji}</span>
                  </div>
                  <p className="text-sm font-bold text-ink mt-3">{card.title}</p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {card.description}
                  </p>
                  <p className={`text-sm font-bold mt-2 ${card.metricColor}`}>
                    {card.metric}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Reports Section */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-bold text-ink">Recent Reports</p>
              <a
                href="#"
                className="text-xs text-primary font-semibold hover:underline"
              >
                View All Reports →
              </a>
            </div>

            <div className="bg-white border border-line rounded-xl divide-y divide-line">
              {REPORTS.map((report) => (
                <div
                  key={report.id}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {report.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      📅 {report.date}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    View →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
