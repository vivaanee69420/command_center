import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

const TABS = ["All Documents", "Reports", "Contracts", "SOPs", "Invoices", "Others"];

// DOCUMENTS removed — requires file upload backend endpoint (GET/POST /api/documents).

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

  // filtered would compute from DOCUMENTS — pending backend

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

            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Pending — File Upload Backend</p>
                <p className="text-xs text-amber-600 leading-relaxed">Documents require a file upload endpoint. Add a <code className="font-mono bg-amber-100 px-1 rounded">document</code> model, S3/Cloudflare R2 storage integration, and <code className="font-mono bg-amber-100 px-1 rounded">POST /api/documents</code> upload + <code className="font-mono bg-amber-100 px-1 rounded">GET /api/documents</code> list endpoints.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </main>
    </>
  );
}
