import { useState, useEffect } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { api } from "@/api/client";

const STAGE_COLORS = {
  lead: "bg-green-100 text-green-700",
  new: "bg-green-100 text-green-700",
  contacted: "bg-blue-100 text-blue-700",
  booked: "bg-purple-100 text-purple-700",
  proposal: "bg-amber-100 text-amber-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

export default function LeadsPage() {
  const [mode, setMode] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.allSettled([api.liveGhlContacts(), api.liveGhlOpportunities()])
      .then(([contactsRes, oppsRes]) => {
        const contacts = contactsRes.status === "fulfilled" ? (contactsRes.value?.contacts || []) : [];
        const opps = oppsRes.status === "fulfilled" ? (oppsRes.value?.opportunities || []) : [];
        const oppByContact = {};
        for (const opp of opps) {
          if (opp.contact_id && !oppByContact[opp.contact_id]) oppByContact[opp.contact_id] = opp;
        }
        setLeads(contacts.map((c) => {
          const opp = oppByContact[c.id] || {};
          return {
            id: c.id,
            name: c.name || "Unknown",
            stage: opp.stage || c.stage || "lead",
            source: c.source || "",
            value_est: opp.value || 0,
            phone: c.phone || "",
            persona: c.tags?.length ? c.tags[0] : "",
          };
        }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Leads"
        subtitle={loading ? "Loading..." : `All leads · ${leads.length} total`}
      />

      <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
        <ModeFilter mode={mode} onChange={setMode} />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line flex justify-between items-center">
                <span className="text-base font-bold text-ink">Recent leads</span>
                <span className="text-sm text-muted">{leads.length}</span>
              </div>

              {error ? (
                <div className="px-5 py-6 text-sm text-red-500">{error}</div>
              ) : loading ? (
                <div className="px-5 py-6 text-sm text-muted">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="px-5 py-6 text-sm text-muted">No leads found.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Name</th>
                      <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Stage</th>
                      <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Source</th>
                      <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Value</th>
                      <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Phone</th>
                      <th className="text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-line last:border-0 hover:bg-bg-soft/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-ink">{lead.name || "—"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STAGE_COLORS[lead.stage] || "bg-gray-100 text-gray-600"}`}>
                            {lead.stage}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted">{lead.source || "—"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted">
                            {lead.value_est ? `£${lead.value_est.toLocaleString()}` : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted font-mono">{lead.phone || "—"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-muted">{lead.persona || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
