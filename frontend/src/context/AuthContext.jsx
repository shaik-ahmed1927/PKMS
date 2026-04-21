// context/AuthContext.jsx
// Provides current user state and theme toggle to the whole app.
// Fetches /api/auth/me on mount to restore session from cookie.

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme]     = useState(() => localStorage.getItem("theme") || "light");

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Restore session on page load
  useEffect(() => {
    api.get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await api.post("/auth/register", { name, email, password });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post("/auth/logout", {}).catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, theme, toggleTheme, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
