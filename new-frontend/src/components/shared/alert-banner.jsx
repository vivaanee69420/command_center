import { AlertTriangle, XCircle } from "lucide-react";

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-danger" />
        <span className="text-sm font-bold text-danger">CRITICAL ALERTS ({alerts.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert, i) => (
          <div key={i} className="border border-danger-soft rounded-xl p-4 bg-white">
            <div className="flex items-start gap-3">
              <XCircle size={18} className="text-danger mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold text-ink">{alert.title}</div>
                <div className="text-xs text-muted mt-0.5">{alert.description}</div>
                <div className="text-[10px] text-muted mt-1">{alert.business} · {alert.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
