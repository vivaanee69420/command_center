import { useState } from "react";
import { Search, Bell, MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Topbar({ title, subtitle }) {
  const [mode, setMode] = useState("simple");

  return (
    <header
      className="sticky top-0 z-20 bg-white border-b border-line flex items-center gap-4"
      style={{ padding: "14px 26px" }}
    >
      {/* Left: Title + Subtitle */}
      <div className="flex flex-col justify-center min-w-0">
        <h1
          className="font-bold leading-tight text-ink truncate"
          style={{ fontSize: "20px" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-muted leading-tight truncate"
            style={{ fontSize: "12px" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-3 shrink-0">

        {/* Search bar */}
        <div
          className="flex items-center gap-2 bg-bg-soft border border-line rounded-lg px-3 py-1.5"
          style={{ width: "300px" }}
        >
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted text-ink"
          />
          <kbd className="text-[10px] text-muted bg-white border border-line rounded px-1.5 py-0.5 font-semibold shrink-0">
            ⌘K
          </kbd>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            className="flex items-center justify-center bg-bg-soft border border-line rounded-lg text-muted hover:bg-gray-100 transition"
            style={{ width: "36px", height: "36px" }}
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
          {/* Red badge */}
          <span
            className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-500 text-white font-bold rounded-full leading-none"
            style={{ fontSize: "9px", minWidth: "16px", height: "16px", padding: "0 3px" }}
          >
            19
          </span>
        </div>

        {/* WhatsApp icon */}
        <div className="relative">
          <button
            className="flex items-center justify-center rounded-lg transition hover:opacity-80"
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#dcfce7",
              color: "#15803d",
            }}
            aria-label="WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
          {/* Green badge */}
          <span
            className="absolute -top-1.5 -right-1.5 flex items-center justify-center font-bold rounded-full leading-none text-white"
            style={{
              fontSize: "9px",
              minWidth: "16px",
              height: "16px",
              padding: "0 3px",
              backgroundColor: "#15803d",
            }}
          >
            9
          </span>
        </div>

        {/* Simple / Advanced mode toggle */}
        <div className="flex items-center border border-line rounded-full overflow-hidden text-xs font-medium">
          <button
            onClick={() => setMode("simple")}
            className={cn(
              "px-3 py-1 transition",
              mode === "simple"
                ? "bg-gray-900 text-white"
                : "bg-white text-muted hover:bg-bg-soft"
            )}
          >
            Simple
          </button>
          <button
            onClick={() => setMode("advanced")}
            className={cn(
              "px-3 py-1 transition",
              mode === "advanced"
                ? "bg-gray-900 text-white"
                : "bg-white text-muted hover:bg-bg-soft"
            )}
          >
            Advanced
          </button>
        </div>

        {/* + New Task button */}
        <button
          onClick={() => console.log("New Task modal — coming soon")}
          className="flex items-center gap-1.5 text-white text-xs font-semibold rounded-lg px-3 py-2 transition"
          style={{ backgroundColor: "#7c3aed" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d28d9")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7c3aed")}
        >
          <Plus size={14} />
          New Task
          <span className="ml-0.5 text-purple-200">&#9662;</span>
        </button>

      </div>
    </header>
  );
}
