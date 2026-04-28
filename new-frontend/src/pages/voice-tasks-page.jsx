import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { Mic, Crosshair } from "lucide-react";

const TABS = [
  { key: "record", label: "Record" },
  { key: "history", label: "History (6)" },
  { key: "team", label: "Team Tasks" },
];

export default function VoiceTasksPage() {
  const [activeTab, setActiveTab] = useState("record");
  const [context, setContext] = useState("");
  const [recording, setRecording] = useState(false);

  return (
    <>
      <Topbar title="Voice-to-Task AI" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon={
            <div className="w-9 h-9 rounded-full bg-danger flex items-center justify-center shrink-0">
              <Mic size={18} className="text-white" />
            </div>
          }
          title="Voice-to-Task AI"
          subtitle="Speak your instructions and AI creates tasks for your team"
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition",
                activeTab === tab.key
                  ? "bg-danger text-white"
                  : "text-muted hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "record" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Record Instructions */}
            <div className="bg-white border border-line rounded-xl p-5">
              <h2 className="text-sm font-bold text-ink mb-4">Record Instructions</h2>

              {/* Context Input */}
              <div className="mb-6">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">
                  Context (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., This is about the Q2 marketing campaign"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-danger transition"
                />
              </div>

              {/* Mic Button */}
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <button
                  onClick={() => setRecording((r) => !r)}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition shadow-md hover:shadow-lg",
                    recording
                      ? "bg-danger animate-pulse"
                      : "bg-danger hover:opacity-90"
                  )}
                >
                  <Mic size={36} className="text-white" />
                </button>
                <p className="text-xs text-muted font-medium">
                  {recording ? "Recording... click to stop" : "Click to start recording"}
                </p>
              </div>
            </div>

            {/* Right: Extracted Tasks */}
            <div className="bg-white border border-line rounded-xl p-5 flex flex-col items-center justify-center min-h-[340px] text-center">
              <div className="w-16 h-16 rounded-full bg-bg-soft border border-line flex items-center justify-center mb-4">
                <Crosshair size={28} className="text-muted" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-ink mb-1">Record your instructions</p>
              <p className="text-xs text-muted max-w-[220px]">
                AI will extract tasks, scripts, and follow-ups
              </p>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Mic size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">Recording History</p>
            <p className="text-xs text-muted">Your past recordings and extracted tasks will appear here.</p>
          </div>
        )}

        {activeTab === "team" && (
          <div className="bg-white border border-line rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Mic size={40} className="text-line mb-4" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink mb-1">Team Tasks</p>
            <p className="text-xs text-muted">Tasks assigned to team members from voice recordings will appear here.</p>
          </div>
        )}
      </main>
    </>
  );
}
