/**
 * PendingBanner — shown in place of sections that have no backend yet.
 * Props:
 *   title   — short label shown in the badge (default "Pending")
 *   reason  — what needs to be built / connected
 *   compact — render as a single line instead of a card
 */
export default function PendingBanner({ title = "Pending", reason, compact = false }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {title}
      </span>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
      <div>
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">{title}</p>
        {reason && <p className="text-xs text-amber-600 leading-relaxed">{reason}</p>}
      </div>
    </div>
  );
}
