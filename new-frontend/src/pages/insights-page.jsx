import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { Sparkles, RefreshCw } from "lucide-react";
import { api } from "@/api/client";

const KIND_META = {
  ad_cpl_drift: { emoji: "📊", emojiBg: "bg-amber-50", title: "Marketing Insight" },
  dentally_no_show: { emoji: "⚙️", emojiBg: "bg-gray-50", title: "Operations Insight" },
  gsc_drop: { emoji: "🔍", emojiBg: "bg-blue-50", title: "SEO Insight" },
  revenue_below_pace: { emoji: "💰", emojiBg: "bg-green-50", title: "Revenue Insight" },
  lead_silence: { emoji: "👋", emojiBg: "bg-orange-50", title: "Lead Insight" },
};

const defaultMeta = { emoji: "✨", emojiBg: "bg-purple-50", title: "AI Insight" };

export default function InsightsPage() {
  const [mode, setMode] = useState("all");
  const [directives, setDirectives] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const loadData = async () => {
    try {
      const [dirs, warns] = await Promise.all([api.directives(), api.warnings()]);
      setDirectives(dirs.filter((d) => !d.dismissed_at));
      setWarnings(warns.filter((w) => !w.closed_at));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.regenerate();
      setLoading(true);
      await loadData();
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <>
      <Topbar
        title="AI Insights & Reports"
        subtitle="AI-generated insights and automated reports"
        actions={
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition disabled:opacity-60"
          >
            {regenerating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {regenerating ? "Regenerating..." : "✨ Regenerate Insights"}
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter mode={mode} onChange={setMode} />

        <div className="flex gap-6 mt-6">
          <div className="flex-1 min-w-0">
            {/* AI Insights from Directives */}
            <p className="text-base font-bold text-ink mb-4">AI Insights</p>

            {loading ? (
              <div className="text-sm text-muted py-4">Loading insights...</div>
            ) : directives.length === 0 ? (
              <div className="bg-white border border-line rounded-xl p-8 text-center text-sm text-muted mb-6">
                No insights yet. Click Regenerate Insights to generate AI directives from your telemetry.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {directives.slice(0, 6).map((d) => {
                  const meta = KIND_META[d.kind] || defaultMeta;
                  return (
                    <div key={d.id} className="bg-white border border-line rounded-xl p-5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.emojiBg}`}>
                        <span className="text-lg">{meta.emoji}</span>
                      </div>
                      <p className="text-sm font-bold text-ink mt-3">{meta.title}</p>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{d.text}</p>
                      <p className={`text-sm font-bold mt-2 ${d.score >= 0.85 ? "text-green-600" : "text-amber-600"}`}>
                        Score: {d.score.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Warnings */}
            {warnings.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-bold text-ink">Active Warnings</p>
                </div>
                <div className="bg-white border border-line rounded-xl divide-y divide-line mb-6">
                  {warnings.map((w) => (
                    <div key={w.id} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{w.text}</p>
                        <p className="text-xs text-muted mt-0.5">severity {w.severity} · {w.kind}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
