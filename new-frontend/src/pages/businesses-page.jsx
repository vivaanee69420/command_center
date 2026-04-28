import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { BUSINESSES } from "@/lib/data";
import { api } from "@/api/client";
import { Plus, Loader2 } from "lucide-react";

const BIZ_COLORS = {
  practice: "#3b82f6",
  academy: "#f59e0b",
  lab: "#8b5cf6",
  service: "#10b981",
};

export default function BusinessesPage() {
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [businesses, setBusinesses] = useState(BUSINESSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.businesses();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setBusinesses(data.map((b) => {
            const fallback = BUSINESSES.find((f) => f.slug === b.slug) || {};
            return { ...fallback, ...b };
          }));
        }
      } catch {
        // use defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Topbar title="Businesses" subtitle="All GM Group entities" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter
          mode={mode}
          setMode={setMode}
          activeBiz={activeBiz}
          setActiveBiz={setActiveBiz}
          rightAction={
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              <Plus size={14} />
              Add Business
            </button>
          }
        />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* Businesses Table */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">All Businesses</h2>
                <span className="text-xs text-muted">{businesses.length} total</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Business</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Revenue (30D)</th>
                      <th className="text-center px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Leads</th>
                      <th className="text-center px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Active Projects</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider">Health Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((biz) => {
                      const color = BIZ_COLORS[biz.type] || "#94a3b8";
                      const target = Math.round(biz.revenue * 1.2);
                      const healthPct = Math.min(100, Math.round((biz.revenue / target) * 100));
                      return (
                        <tr key={biz.slug} className="border-b border-line last:border-b-0 hover:bg-bg-soft/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                              <span className="text-sm font-semibold text-ink">{biz.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-ink font-medium">
                            £{biz.revenue?.toLocaleString() || "0"}
                          </td>
                          <td className="px-5 py-3.5 text-center text-sm font-semibold text-ink">
                            {biz.leads || 0}
                          </td>
                          <td className="px-5 py-3.5 text-center text-sm font-semibold text-ink">
                            {biz.bookings || 0}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden max-w-[120px]">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${healthPct}%`,
                                    background: healthPct >= 80 ? "#10b981" : healthPct >= 50 ? "#f59e0b" : "#ef4444",
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-ink w-8">{healthPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
