import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { Sparkles, Smile } from "lucide-react";

const TABS = [
  { key: "reel", label: "Reel Script" },
  { key: "caption", label: "Caption Writer" },
  { key: "calendar", label: "30-Day Calendar" },
  { key: "repurpose", label: "Repurpose" },
];

const ENTITIES = [
  "GM Dental Practices",
  "Plan4Growth Academy",
  "GM Lab",
  "Elevate Accounts",
];

const HOOK_STYLES = [
  "Question Hook - 'Did you know...?'",
  "Shock Hook - 'Most people don't realise...'",
  "Story Hook - 'I was sitting in the chair when...'",
  "Transformation Hook - 'Before vs After'",
  "Controversy Hook - 'Unpopular opinion:'",
];

const DURATIONS = ["15s", "30s", "60s"];

export default function ContentFactoryPage() {
  const [activeTab, setActiveTab] = useState("reel");
  const [entity, setEntity] = useState("GM Dental Practices");
  const [topic, setTopic] = useState("");
  const [hookStyle, setHookStyle] = useState(HOOK_STYLES[0]);
  const [duration, setDuration] = useState("30s");

  return (
    <>
      <Topbar title="Content Factory" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎬"
          title="Content Factory"
          subtitle="AI-powered content generation for all your marketing needs"
          actions={[
            { label: "Research with Manus", icon: <Sparkles size={14} />, variant: "outline" },
          ]}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                activeTab === tab.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "reel" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Form */}
            <div className="bg-white border border-line rounded-xl p-5">
              <h2 className="text-sm font-bold text-ink mb-4">Generate Reel Script</h2>

              <div className="space-y-4">
                {/* Entity */}
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Entity</label>
                  <select
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
                  >
                    {ENTITIES.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g., Why dental implants beat dentures"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition"
                  />
                </div>

                {/* Hook Style */}
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Hook Style</label>
                  <select
                    value={hookStyle}
                    onChange={(e) => setHookStyle(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition bg-white"
                  >
                    {HOOK_STYLES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Duration</label>
                  <div className="flex items-center gap-1">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-semibold border transition",
                          duration === d
                            ? "bg-primary text-white border-primary"
                            : "border-line text-muted hover:border-primary/40 hover:text-ink"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  className="w-full py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 mt-2"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  Generate Content
                </button>
              </div>
            </div>

            {/* Right: Output Empty State */}
            <div className="bg-white border border-line rounded-xl p-5 flex flex-col items-center justify-center min-h-[340px] text-center">
              <Smile size={48} className="text-line mb-4" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-ink mb-1">Your generated content will appear here</p>
              <p className="text-xs text-muted">Fill in the form and click Generate</p>
            </div>
          </div>
        )}

        {activeTab !== "reel" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Sparkles size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">Coming Soon</p>
            <p className="text-xs text-muted">This content type will be available shortly.</p>
          </div>
        )}
      </main>
    </>
  );
}
