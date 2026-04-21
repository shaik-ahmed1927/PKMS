// App.jsx
// Defines all routes. ProtectedRoute redirects to /login if not authenticated.
// PublicRoute redirects to /dashboard if already logged in.

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout       from "./pages/Layout";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import Notes        from "./pages/Notes";
import NoteView     from "./pages/NoteView";
import NoteEdit     from "./pages/NoteEdit";
import Bookmarks    from "./pages/Bookmarks";
import Materials    from "./pages/Materials";
import Search       from "./pages/Search";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)  return null;
  if (user)     return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected — all inside Layout (sidebar + topbar) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index                element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="notes"         element={<Notes />} />
        <Route path="notes/new"     element={<NoteEdit />} />
        <Route path="notes/:id"     element={<NoteView />} />
        <Route path="notes/:id/edit" element={<NoteEdit />} />
        <Route path="bookmarks"     element={<Bookmarks />} />
        <Route path="materials"     element={<Materials />} />
        <Route path="search"        element={<Search />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
