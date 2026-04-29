import { useState, useEffect, useMemo, useRef } from "react";
import Topbar from "@/components/layout/topbar";
import RightSidebar from "@/components/shared/right-sidebar";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  Trash2,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Phone,
  GripVertical,
  Building2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = ["lead", "contacted", "booked", "proposal", "won", "lost"];
const STAGE_LABELS = { lead: "New", contacted: "Contacted", booked: "Booked", proposal: "Proposal", won: "Won", lost: "Lost" };
const STAGE_COLORS = {
  lead: "bg-blue-50 text-blue-700",
  contacted: "bg-purple-50 text-purple-700",
  booked: "bg-amber-50 text-amber-700",
  proposal: "bg-indigo-50 text-indigo-700",
  won: "bg-green-50 text-green-700",
  lost: "bg-gray-50 text-gray-500",
};
const STAGE_HEADER_COLORS = {
  lead: "border-t-blue-500",
  contacted: "border-t-purple-500",
  booked: "border-t-amber-500",
  proposal: "border-t-indigo-500",
  won: "border-t-green-500",
  lost: "border-t-gray-400",
};

function fmtCurrency(n) {
  if (n == null) return "—";
  return `£${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Add Lead Modal ──────────────────────────────────────────────────────────

function AddLeadModal({ open, onClose, businesses, onSave }) {
  const [form, setForm] = useState({ business_id: "", name: "", email: "", phone: "", source: "", stage: "lead", value_est: "", persona: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm({ business_id: businesses[0]?.id || "", name: "", email: "", phone: "", source: "", stage: "lead", value_est: "", persona: "" });
  }, [open, businesses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_id || !form.name.trim()) return;
    setSaving(true);
    try {
      await api.createLead({
        business_id: form.business_id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source || null,
        stage: form.stage,
        value_est: form.value_est ? parseFloat(form.value_est) : null,
        persona: form.persona || null,
      });
      onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Business *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.business_id} onChange={(e) => set("business_id", e.target.value)} required>
                <option value="">Select</option>
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Phone</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Source</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.source} onChange={(e) => set("source", e.target.value)}>
                <option value="">—</option>
                {["Meta", "Google", "Referral", "GHL", "Website", "Walk-in"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.persona} onChange={(e) => set("persona", e.target.value)}>
                <option value="">—</option>
                {["Implant", "Cosmetic", "Ortho", "General", "Whitening", "Emergency"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Est. Value (£)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.value_est} onChange={(e) => set("value_est", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Lead"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Draggable Lead Card (HTML5 Drag & Drop) ────────────────────────────────

function DraggableLeadCard({ lead, bizMap, onDelete, onDragStart }) {
  const biz = bizMap[lead.business_id];

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id);
    onDragStart(lead.id);
    // Make drag image slightly transparent
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-white border border-line rounded-lg p-3 hover:shadow-sm transition-shadow group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div className="mt-1 text-gray-300 hover:text-gray-500 shrink-0">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-ink truncate">{lead.name || "Unnamed"}</p>
            <button onClick={(e) => { e.stopPropagation(); onDelete(lead); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-opacity shrink-0">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-muted mt-0.5 truncate">{biz?.name || "—"}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {lead.value_est && (
              <span className="text-xs font-bold text-ink">{fmtCurrency(lead.value_est)}</span>
            )}
            {lead.source && (
              <span className="text-[10px] bg-bg-soft px-1.5 py-0.5 rounded text-muted">{lead.source}</span>
            )}
            {lead.persona && (
              <span className="text-[10px] bg-bg-soft px-1.5 py-0.5 rounded text-muted">{lead.persona}</span>
            )}
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted">
              <Phone className="w-2.5 h-2.5" /> {lead.phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────────────────────

function DroppableColumn({ stage, cards, bizMap, onDelete, onDragStart, onDrop }) {
  const [isOver, setIsOver] = useState(false);
  const stageValue = cards.reduce((s, l) => s + (Number(l.value_est) || 0), 0);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    // Only trigger if leaving column, not entering child
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) onDrop(leadId, stage);
  };

  return (
    <div className="flex-1 min-w-[200px]">
      {/* Column header */}
      <div className={cn("bg-white border border-line rounded-t-xl px-4 py-3 border-t-2", STAGE_HEADER_COLORS[stage])}>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-ink uppercase tracking-wider">
            {STAGE_LABELS[stage]}
          </span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STAGE_COLORS[stage])}>
            {cards.length}
          </span>
        </div>
        <div className="text-sm font-bold text-ink mt-1">{fmtCurrency(stageValue)}</div>
      </div>

      {/* Cards container — drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-x border-b border-line rounded-b-xl p-2 space-y-2 min-h-[200px] transition-colors",
          isOver ? "bg-primary/5 border-primary/30" : "bg-bg-soft/50"
        )}
      >
        {cards.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            bizMap={bizMap}
            onDelete={onDelete}
            onDragStart={onDragStart}
          />
        ))}
        {cards.length === 0 && (
          <div className={cn("text-xs text-center py-8 rounded-lg border-2 border-dashed", isOver ? "border-primary/40 text-primary" : "border-transparent text-muted")}>
            {isOver ? "Drop here" : "No leads"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, iconBg, label, value }) {
  return (
    <div className="bg-white border border-line rounded-xl p-4">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2">{label}</div>
      <div className="text-xl font-bold text-ink mt-0.5">{value}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [leads, setLeads] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [filterBizId, setFilterBizId] = useState("all");
  const draggedIdRef = useRef(null);

  const load = async () => {
    try {
      const [lds, biz] = await Promise.all([api.leads(), api.businesses()]);
      setLeads(lds);
      setBusinesses(biz);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const bizMap = useMemo(() => {
    const m = {};
    businesses.forEach((b) => { m[b.id] = b; });
    return m;
  }, [businesses]);

  const leadMap = useMemo(() => {
    const m = {};
    leads.forEach((l) => { m[l.id] = l; });
    return m;
  }, [leads]);

  // Filter by subaccount then group by stage
  const filteredLeads = useMemo(() =>
    filterBizId === "all" ? leads : leads.filter((l) => l.business_id === filterBizId),
    [leads, filterBizId]
  );

  const grouped = useMemo(() => {
    const g = {};
    STAGES.forEach((s) => { g[s] = []; });
    filteredLeads.forEach((l) => {
      if (g[l.stage]) g[l.stage].push(l);
      else g.lead.push(l);
    });
    return g;
  }, [filteredLeads]);

  // KPIs — based on filtered leads
  const totalLeads = filteredLeads.length;
  const totalValue = filteredLeads.reduce((s, l) => s + (Number(l.value_est) || 0), 0);
  const wonLeads = grouped.won.length;
  const convRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const handleDelete = async (lead) => {
    if (!confirm(`Delete lead "${lead.name}"?`)) return;
    try {
      await api.deleteLead(lead.id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  // ─── HTML5 Drag Handlers ──────────────────────────────────────────────

  const handleDragStart = (leadId) => {
    draggedIdRef.current = leadId;
  };

  const handleDrop = async (leadId, targetStage) => {
    draggedIdRef.current = null;
    const draggedLead = leadMap[leadId];
    if (!draggedLead || targetStage === draggedLead.stage) return;

    // Optimistic update
    setLeads((prev) => prev.map((l) => l.id === draggedLead.id ? { ...l, stage: targetStage } : l));

    try {
      await api.patchLead(draggedLead.id, { stage: targetStage });
    } catch (err) {
      console.error("Move failed:", err);
      await load(); // Revert on failure
    }
  };

  return (
    <>
      <Topbar title="CRM" />
      <main className="p-6 max-w-[1800px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-ink">CRM / Sales Pipeline</h1>
            <p className="text-sm text-muted mt-0.5">Drag leads between stages to update pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Subaccount filter */}
            <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 bg-white">
              <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
              <select
                value={filterBizId}
                onChange={(e) => setFilterBizId(e.target.value)}
                className="text-xs text-ink bg-transparent border-0 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Subaccounts</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" /> Add Lead
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!loading && (
              <>
                {/* KPI Strip */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <KpiCard icon={Users} iconBg="bg-purple-50 text-purple-600" label="Total Leads" value={totalLeads} />
                  <KpiCard icon={DollarSign} iconBg="bg-green-50 text-green-600" label="Pipeline Value" value={fmtCurrency(totalValue)} />
                  <KpiCard icon={Target} iconBg="bg-amber-50 text-amber-600" label="Won Deals" value={wonLeads} />
                  <KpiCard icon={TrendingUp} iconBg="bg-blue-50 text-blue-600" label="Conversion Rate" value={`${convRate}%`} />
                </div>

                {/* Kanban Board — HTML5 Drag & Drop */}
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {STAGES.map((stage) => (
                    <DroppableColumn
                      key={stage}
                      stage={stage}
                      cards={grouped[stage]}
                      bizMap={bizMap}
                      onDelete={handleDelete}
                      onDragStart={handleDragStart}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <RightSidebar />
        </div>
      </main>

      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        businesses={businesses}
        onSave={load}
      />
    </>
  );
}
