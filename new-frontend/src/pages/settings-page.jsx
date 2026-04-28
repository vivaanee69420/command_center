import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/layout/topbar";
import ModeFilter from "@/components/shared/mode-filter";
import RightSidebar from "@/components/shared/right-sidebar";
import { USERS_DEFAULT } from "@/lib/data";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("simple");
  const [activeBiz, setActiveBiz] = useState("all");
  const [workspaceName, setWorkspaceName] = useState("GM Dental Group");
  const [timezone, setTimezone] = useState("Europe/London");
  const [currency, setCurrency] = useState("GBP (£)");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Configure your workspace" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <ModeFilter
          mode={mode}
          setMode={setMode}
          activeBiz={activeBiz}
          setActiveBiz={setActiveBiz}
        />

        <div className="flex gap-6">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* General Settings */}
            <div className="bg-white border border-line rounded-xl p-6">
              <h2 className="text-base font-bold text-ink mb-5">General Settings</h2>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 block">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full border-b border-line py-2 text-sm text-ink outline-none focus:border-primary transition bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 block">
                    Time Zone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full border-b border-line py-2 text-sm text-ink outline-none focus:border-primary transition bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 block">
                    Default Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border-b border-line py-2 text-sm text-ink outline-none focus:border-primary transition bg-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

            {/* Billing & Subscription */}
            <div className="bg-white border border-line rounded-xl p-6">
              <h2 className="text-base font-bold text-ink mb-4">Billing & Subscription</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
                  >
                    C
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Pro Plan</p>
                    <p className="text-xs text-muted">£179/month · Self-hosted · 8 seats</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>

          {/* Right column — Team & Access */}
          <div className="w-[320px] shrink-0 space-y-6">
            <div className="bg-white border border-line rounded-xl p-6">
              <h2 className="text-base font-bold text-ink mb-4">Team & Access</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Total members</p>
                    <p className="text-[11px] text-muted">{USERS_DEFAULT.length} active</p>
                  </div>
                  <p className="text-2xl font-bold text-ink">{USERS_DEFAULT.length}</p>
                </div>
                <div className="border-t border-line" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Pending invites</p>
                  <p className="text-2xl font-bold text-ink">0</p>
                </div>
                <div className="border-t border-line" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Roles</p>
                  <p className="text-2xl font-bold text-ink">10</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/user-management")}
                className="mt-5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 w-full"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                Manage Team
              </button>
            </div>
          </div>

          <RightSidebar />
        </div>
      </main>
    </>
  );
}
