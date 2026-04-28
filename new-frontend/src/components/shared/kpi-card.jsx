import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, Users, Calendar, Sparkles, CheckCircle } from "lucide-react";

const ICONS = {
  $: DollarSign,
  people: Users,
  calendar: Calendar,
  sparkle: Sparkles,
  check: CheckCircle,
};

export default function KpiCard({ label, value, icon, delta, subtitle, extra, target, borderColor = "#7c3aed" }) {
  const Icon = ICONS[icon] || DollarSign;
  const isMonetary = icon === "$" || icon === "sparkle";
  const displayValue = isMonetary ? formatCurrency(value) : typeof value === "number" ? formatNumber(value) : value;

  return (
    <div className="bg-white border border-line rounded-xl p-5 relative overflow-hidden" style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</span>
        {delta !== null && delta !== undefined && (
          <span className={cn("text-[11px] font-semibold flex items-center gap-1", delta >= 0 ? "text-primary" : "text-danger")}>
            {delta >= 0 ? "↗" : "↘"} {Math.abs(delta)}%
          </span>
        )}
        {extra && !delta && (
          <span className="text-[11px] font-semibold text-primary">{extra}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-ink tracking-tight">{displayValue}</div>
      {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
      {target && (
        <div className="mt-3">
          <div className="text-[10px] text-muted mb-1">Target: {formatCurrency(target)}</div>
          <div className="h-1.5 bg-line rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, (typeof value === "number" ? value : 0) / target * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
