import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

const TABS = ["All Documents", "Reports", "Contracts", "SOPs", "Invoices", "Others"];

const DOCUMENTS = [
  {
    id: 1,
    emoji: "📊",
    name: "Marketing Report — May",
    business: "All Businesses",
    type: "Report",
    typeBadge: "bg-blue-50 text-blue-600",
    uploadedBy: "Zeeshan Ahmed",
    date: "19 May 2025",
  },
  {
    id: 2,
    emoji: "🔍",
    name: "SEO Audit Report",
    business: "Prime Wellness",
    type: "Report",
    typeBadge: "bg-blue-50 text-blue-600",
    uploadedBy: "Sarah Khan",
    date: "17 May 2025",
  },
  {
    id: 3,
    emoji: "📈",
    name: "Google Ads Performance",
    business: "Ascend Dental",
    type: "Report",
    typeBadge: "bg-blue-50 text-blue-600",
    uploadedBy: "Sarah Khan",
    date: "15 May 2025",
  },
  {
    id: 4,
    emoji: "📄",
    name: "Client Contract — Ascend",
    business: "Ascend Dental",
    type: "Contract",
    typeBadge: "bg-amber-50 text-amber-600",
    uploadedBy: "Maria Ahmad",
    date: "14 May 2025",
  },
  {
    id: 5,
    emoji: "📋",
    name: "SOP — Onboarding",
    business: "All Businesses",
    type: "SOP",
    typeBadge: "bg-green-50 text-green-600",
    uploadedBy: "Maria Ahmad",
    date: "13 May 2025",
  },
  {
    id: 6,
    emoji: "🧾",
    name: "Invoice #INV-1003",
    business: "Elite Aesthetics",
    type: "Invoice",
    typeBadge: "bg-purple-50 text-purple-600",
    uploadedBy: "Ayesha Malik",
    date: "12 May 2025",
  },
  {
    id: 7,
    emoji: "📅",
    name: "Content Calendar — June",
    business: "All Businesses",
    type: "Calendar",
    typeBadge: "bg-teal-50 text-teal-600",
    uploadedBy: "Ayesha Malik",
    date: "11 May 2025",
  },
];

const TAB_TYPE_MAP = {
  "All Documents": null,
  Reports: "Report",
  Contracts: "Contract",
  SOPs: "SOP",
  Invoices: "Invoice",
  Others: "Others",
};

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("All Documents");

  const filtered =
    activeTab === "All Documents"
      ? DOCUMENTS
      : activeTab === "Others"
      ? DOCUMENTS.filter(
          (d) => !["Report", "Contract", "SOP", "Invoice"].includes(d.type)
        )
      : DOCUMENTS.filter((d) => d.type === TAB_TYPE_MAP[activeTab]);

  return (
    <>
      <Topbar
        title="Documents"
        subtitle="Store and manage all your documents"
        right={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition shadow-sm">
            <Upload size={15} />
            Upload Document
          </button>
        }
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter />

        <div className="flex gap-6 mt-5">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tab Filter */}
            <div className="flex items-center gap-1 mb-5 border-b border-line">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-2 px-3",
                    activeTab === tab
                      ? "text-sm font-semibold text-primary border-b-2 border-primary"
                      : "text-sm font-medium text-muted hover:text-ink"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Documents Table */}
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5">
                      Document
                    </th>
                    <th className="text-left text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5">
                      Business
                    </th>
                    <th className="text-left text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5">
                      Type
                    </th>
                    <th className="text-left text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5">
                      Uploaded By
                    </th>
                    <th className="text-left text-[10px] font-bold text-muted uppercase tracking-wider px-5 py-3.5">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-line hover:bg-bg-soft/50 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{doc.emoji}</span>
                          <span className="text-sm font-semibold text-ink">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted">{doc.business}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            doc.typeBadge
                          )}
                        >
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted">{doc.uploadedBy}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted">{doc.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
