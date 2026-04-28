import { createContext, useContext, useState, useCallback } from "react";
import { USERS_DEFAULT, STORAGE_KEY } from "@/lib/data";
import { api } from "@/api/client";

const AuthContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return state.session?.user || null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = raw ? JSON.parse(raw) : {};
    if (user) {
      state.session = { user, when: Date.now() };
    } else {
      state.session = null;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());

  const login = useCallback(async (username, password) => {
    // Try real API first
    try {
      const res = await api.login(username, password);
      // Backend returns { access_token, person_id, name, role, scopes }
      const u = {
        u: username,
        name: res.name,
        role: res.role,
        color: "#0e2a47",
        person_id: res.person_id,
        scopes: res.scopes,
      };
      setUser(u);
      saveSession(u);
      return true;
    } catch {
      // Fallback to seed data when backend unavailable
      const found = USERS_DEFAULT.find((x) => x.u === username && x.p === password);
      if (!found) return false;
      setUser(found);
      saveSession(found);
      return true;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveSession(null);
    api.logout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
