import { Search, Pencil, Bell } from "lucide-react";

export default function Topbar({ title }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-line px-6 py-3 flex items-center gap-4">
      <h1 className="text-sm font-semibold text-ink">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-white w-[200px]">
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
          />
          <kbd className="text-[10px] text-muted bg-bg-soft border border-line rounded px-1.5 py-0.5 font-semibold">⌘K</kbd>
        </div>
        {/* Edit */}
        <button className="flex items-center gap-1.5 border border-line rounded-lg px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg-soft transition">
          <Pencil size={14} />
          Edit
        </button>
        {/* Notifications */}
        <button className="w-8 h-8 flex items-center justify-center border border-line rounded-lg text-muted hover:bg-bg-soft transition">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
