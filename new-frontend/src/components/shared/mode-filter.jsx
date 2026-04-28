import { cn } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";

const BIZ_TABS = [
  { label: "All", value: "all" },
  ...BUSINESSES.filter(b => b.type === "practice").slice(0, 3).map(b => ({ label: b.name.split(" ")[0], value: b.slug })),
  { label: "P4G Academy", value: "academy" },
  { label: "Lab", value: "lab" },
  { label: "Elevate", value: "accounts" },
];

export default function ModeFilter({ mode, setMode, activeBiz, setActiveBiz, rightAction }) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-bg-shell rounded-full p-1">
          <button
            onClick={() => setMode("simple")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition",
              mode === "simple" ? "bg-primary text-white" : "text-muted hover:text-ink"
            )}
          >
            Simple
          </button>
          <button
            onClick={() => setMode("advanced")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition",
              mode === "advanced" ? "bg-primary text-white" : "text-muted hover:text-ink"
            )}
          >
            Advanced
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {BIZ_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveBiz(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                activeBiz === tab.value
                  ? "bg-primary text-white border-primary"
                  : "border-line text-muted hover:text-ink hover:bg-bg-soft"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {rightAction}
    </div>
  );
}
