import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { USERS_DEFAULT } from "@/lib/data";
import { getInitials, cn } from "@/lib/utils";

const FEATURES = [
  "Multi-user access · per-role permission scopes",
  "Outsourcers only see the tasks you assign them",
  "Always-on AI research · 14 source agents",
  "Live Meta Ads · PageSpeed · Search Console connectors",
  "CEO + COO daily routines · 90-day plan baked in",
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await login(username.trim().toLowerCase(), password);
      if (ok) navigate("/");
      else setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin(u, p) {
    setUsername(u);
    setPassword(p);
    const ok = await login(u, p);
    if (ok) navigate("/");
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2" style={{ background: "#faf9ff" }}>

      {/* ── Left panel ── */}
      <div
        className="relative flex flex-col justify-between overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #f5f3ff 0%, #ede9fe 35%, #faf9ff 100%)",
          padding: "56px 64px",
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: 120, right: 60, width: 140, height: 140,
            background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: 80, left: 40, width: 180, height: 180,
            background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div
            className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              boxShadow: "0 8px 20px rgba(124,58,237,0.30)",
            }}
          >
            C
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold" style={{ color: "#1a1033" }}>CommandOS</div>
            <div className="text-[10.5px] font-medium uppercase tracking-widest" style={{ color: "#6b5a8a" }}>
              Holistic Business Operating System
            </div>
          </div>
        </div>

        {/* Tagline + features */}
        <div className="relative z-10 max-w-[480px] mt-10 md:mt-0">
          {/* Live pill */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-wider mb-6"
            style={{ background: "#ede9fe", color: "#6d28d9" }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full"
              style={{ background: "#7c3aed", boxShadow: "0 0 0 3px rgba(124,58,237,0.25)" }}
            />
            Live · v1
          </div>

          <h1
            className="text-[42px] font-bold leading-[1.08] mb-5"
            style={{ letterSpacing: "-0.025em", color: "#1a1033" }}
          >
            Run every business{" "}
            <em className="not-italic" style={{ color: "#7c3aed" }}>calmly</em>.
            <br />
            One screen.
          </h1>

          <p className="text-[15.5px] leading-relaxed max-w-[440px]" style={{ color: "#5b5270" }}>
            The complete GM Group operating system — five practices, the lab, Plan4Growth, Biological Clinician, Elevate.
            Built so each person sees only what they need to do today.
          </p>

          <ul className="mt-7 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[13.5px]" style={{ color: "#1a1033" }}>
                <span
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "#ede9fe",
                    color: "#7c3aed",
                    boxShadow: "inset 0 0 0 1px rgba(124,58,237,0.18)",
                  }}
                >
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11.5px]" style={{ color: "#8a7fa0" }}>
          © GM Dental Group · Self-hosted · no telemetry
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex items-center justify-center bg-white"
        style={{ padding: "48px 40px", borderLeft: "1px solid #ece8f3" }}
      >
        <div className="max-w-[440px] w-full" style={{ padding: "40px 36px" }}>
          <h2 className="text-2xl font-bold mb-1.5" style={{ color: "#1a1033", letterSpacing: "-0.01em" }}>
            Welcome back
          </h2>
          <p className="text-sm mb-7" style={{ color: "#6b5a8a" }}>
            Sign in to your CommandOS workspace.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 mt-4" style={{ color: "#6b5a8a" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. gaurav"
              value={username}
              autoComplete="username"
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              className="w-full py-3.5 px-4 rounded-[10px] text-sm font-normal outline-none transition-all"
              style={{
                border: "1.5px solid #e2dde8",
                color: "#1a1033",
                background: "#fff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#7c3aed";
                e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2dde8";
                e.target.style.boxShadow = "none";
              }}
            />

            <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 mt-4" style={{ color: "#6b5a8a" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full py-3.5 px-4 rounded-[10px] text-sm font-normal outline-none transition-all"
              style={{
                border: "1.5px solid #e2dde8",
                color: "#1a1033",
                background: "#fff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#7c3aed";
                e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2dde8";
                e.target.style.boxShadow = "none";
              }}
            />

            {error && (
              <div
                className="mt-3.5 py-3 px-3.5 rounded-lg text-sm font-medium"
                style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  borderLeft: "3px solid #dc2626",
                }}
              >
                Invalid username or password.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-[10px] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.22)",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          {/* Quick access accounts */}
          {showQuick && (
            <div className="mt-7 pt-5" style={{ borderTop: "1px solid #ece8f3" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] uppercase tracking-wider font-bold" style={{ color: "#8a7fa0" }}>
                  Quick access · test accounts
                </span>
                <button
                  onClick={() => setShowQuick(false)}
                  className="text-[11px] font-semibold hover:underline"
                  style={{ color: "#7c3aed" }}
                >
                  hide
                </button>
              </div>
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {USERS_DEFAULT.map((u) => (
                  <button
                    key={u.u}
                    onClick={() => handleQuickLogin(u.u, u.p)}
                    className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-[10px] transition-all text-left"
                    style={{
                      border: "1px solid #ece8f3",
                      background: "#faf9ff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#7c3aed";
                      e.currentTarget.style.background = "#f5f3ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#ece8f3";
                      e.currentTarget.style.background = "#faf9ff";
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ background: u.color }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-semibold" style={{ color: "#1a1033" }}>{u.name}</div>
                        <div className="text-[10.5px]" style={{ color: "#6b5a8a" }}>{u.role}</div>
                      </div>
                    </div>
                    <code
                      className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: "#ede9fe", color: "#6d28d9" }}
                    >
                      {u.u}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
