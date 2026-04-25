// pages/Layout.jsx
// The persistent shell: sidebar on left, topbar on top, page content via <Outlet />.
// This renders once and stays mounted as you navigate between pages.

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1"/>
        <rect x="9" y="1" width="6" height="6" rx="1"/>
        <rect x="1" y="9" width="6" height="6" rx="1"/>
        <rect x="9" y="9" width="6" height="6" rx="1"/>
      </svg>
    ),
  },
  {
    to: "/app/notes",
    label: "Notes",
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h10M3 6h10M3 9h6"/>
      </svg>
    ),
  },
  {
    to: "/app/bookmarks",
    label: "Bookmarks",
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h8a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z"/>
      </svg>
    ),
  },
  {
    to: "/app/materials",
    label: "Materials",
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="12" height="12" rx="1"/>
        <path d="M6 2v12M2 6h4M2 10h4"/>
      </svg>
    ),
  },
  {
    to: "/app/search",
    label: "Search",
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="4.5"/>
        <path d="M10.5 10.5l3 3"/>
      </svg>
    ),
  },
];

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Layout() {
  const { user, logout, toggleTheme, theme } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">pk<span>ms</span></div>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "light" ? "◑" : "◐"}
          </button>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Workspace</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-row" onClick={handleLogout} title="Click to log out">
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
