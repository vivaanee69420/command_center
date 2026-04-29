import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { RefreshCw } from "lucide-react";
import { api } from "@/api/client";

const SUGGESTED_QUESTIONS = [
  "What were the marketing campaigns last month?",
  "Which businesses underperformed this quarter?",
  "Which practice has the highest no-show rate?",
];

export default function AiBrainPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [directives, setDirectives] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dirs, warns] = await Promise.all([api.directives(), api.warnings()]);
      setDirectives(dirs.filter((d) => !d.dismissed_at));
      setWarnings(warns.filter((w) => !w.closed_at));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const dismiss = async (id) => {
    try {
      await api.dismissDirective(id);
      setDirectives((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const askBrain = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const res = await api.askBrain(question.trim());
      setAnswer(res.answer);
    } catch (e) {
      setAnswer(`Error: ${e.message}`);
    } finally {
      setAsking(false);
    }
  };

  const regenerate = async () => {
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
        title="AI Brain"
        subtitle="Your knowledge hub and AI assistant"
        actions={
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-60"
          >
            <RefreshCw size={15} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Regenerating..." : "Regenerate Brain"}
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter />

        <div className="flex gap-6 mt-6">
          <div className="flex gap-6 flex-1 min-w-0">

            {/* Left column */}
            <div className="flex-1 min-w-0">

              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { emoji: "🧠", emojiBg: "bg-amber-50", label: "DIRECTIVES", value: directives.length, sublabel: "active" },
                  { emoji: "⚠️", emojiBg: "bg-red-50", label: "WARNINGS", value: warnings.length, sublabel: "open" },
                  { emoji: "✨", emojiBg: "bg-purple-50", label: "HIGH PRIORITY", value: directives.filter((d) => d.score >= 0.85).length, sublabel: "auto-tasked at ≥0.85" },
                ].map((card) => (
                  <div key={card.label} className="bg-white border border-line rounded-xl p-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${card.emojiBg}`}>
                      {card.emoji}
                    </div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-3">{card.label}</div>
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
                  {loading ? (
                    <div className="px-5 py-6 text-sm text-muted">Loading...</div>
                  ) : directives.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-muted">No active directives. Click Regenerate Brain to generate new ones.</div>
                  ) : (
                    directives.map((d) => (
                      <div key={d.id} className="px-5 py-4 flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-sm text-ink leading-snug">{d.text}</div>
                          <div className="text-xs text-muted mt-1">score {d.score.toFixed(2)} · {d.kind}</div>
                        </div>
                        <button
                          onClick={() => dismiss(d.id)}
                          className="text-xs text-primary font-semibold flex-shrink-0"
                        >
                          Dismiss
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-ink">Active warnings</span>
                  </div>
                  <div className="bg-white border border-line rounded-xl divide-y divide-line">
                    {warnings.map((w) => (
                      <div key={w.id} className="px-5 py-4">
                        <div className="text-sm text-ink leading-snug">{w.text}</div>
                        <div className="text-xs text-muted mt-1">severity {w.severity} · {w.kind}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Ask AI */}
            <div className="w-[360px] flex-shrink-0">
              <div className="bg-white border border-line rounded-xl p-5">
                <div className="text-base font-bold text-ink">Ask AI</div>
                <div className="text-xs text-muted mt-1">
                  Anything about your business — answers grounded in real data
                </div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) askBrain(); }}
                  rows={3}
                  placeholder="e.g. What's the trend in marketing campaigns?"
                  className="mt-3 w-full border border-line rounded-lg p-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <button
                  onClick={askBrain}
                  disabled={asking || !question.trim()}
                  className="mt-3 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-60"
                >
                  {asking ? "Thinking..." : "Ask 🧠"}
                </button>

                {answer && (
                  <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <div className="text-xs font-bold text-violet-700 mb-1">ANSWER</div>
                    <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{answer}</div>
                  </div>
                )}

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

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
