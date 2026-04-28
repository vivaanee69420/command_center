import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { USERS_DEFAULT } from "@/lib/data";
import { getInitials } from "@/lib/utils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await login(username.trim().toLowerCase(), password);
      if (ok) {
        navigate("/");
      } else {
        setError(true);
      }
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

  const features = ["Dashboard", "Analytics", "SEO", "Ads", "Hormozi Sales", "Voice AI", "Content Studio"];
  const bizEmojis = ["🦷", "🏛️", "🏗️", "😊", "🏡", "🐳", "🐢", "🧪", "📊", "📦"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f0f9ff] via-[#f8fafc] to-[#f1f5f9]">
      <div className="bg-white rounded-2xl shadow-lg max-w-[460px] w-full mx-4 p-10">
        {/* Brand */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-ink">
            GM <span className="text-yellow-500">⚡</span> Marketing OS
          </h1>
          <p className="text-muted text-sm mt-1">£12M Marketing Intelligence Platform — Admin Access</p>
        </div>

        {/* Google Sign In */}
        <button className="w-full mt-6 flex items-center justify-center gap-2 border border-line rounded-xl py-3 text-sm font-medium text-ink hover:bg-bg-soft transition">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs text-muted">Or continue with username</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              className="w-full pl-10 pr-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full pl-10 pr-10 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>

          {error && (
            <div className="mb-3 p-3 bg-danger-soft text-danger rounded-lg text-sm border-l-3 border-danger font-medium">
              Invalid username or password.
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl text-sm font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60">
            <span>⚡</span> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Features */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted mb-2">Platform Features</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {features.map((f) => (
              <span key={f} className="px-3 py-1 border border-line rounded-full text-xs text-muted">{f}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted">Managing 10 businesses, £12M Revenue Target</p>
          <div className="flex justify-center gap-1 mt-2 text-base">
            {bizEmojis.map((e, i) => <span key={i}>{e}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
