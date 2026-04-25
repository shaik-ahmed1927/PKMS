// App.jsx
// Defines all routes. ProtectedRoute redirects to /login if not authenticated.
// PublicRoute redirects to /dashboard if already logged in.
// The root "/" path shows the Landing page for unauthenticated visitors.

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Bookmarks from './pages/Bookmarks';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Community from './pages/Community';
import Blog from './pages/Blog';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Materials from './pages/Materials';
import MaterialView from './pages/MaterialView';
import NoteEdit from './pages/NoteEdit';
import Notes from './pages/Notes';
import NoteView from './pages/NoteView';
import Register from './pages/Register';
import Search from './pages/Search';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Landing — shown at root for unauthenticated visitors */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />
      
      {/* Public resource pages */}
      <Route path="/docs" element={<Docs />} />
      <Route path="/community" element={<Community />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Public auth pages */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected — all inside Layout (sidebar + topbar) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/new" element={<NoteEdit />} />
        <Route path="notes/:id" element={<NoteView />} />
        <Route path="notes/:id/edit" element={<NoteEdit />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="materials" element={<Materials />} />
        <Route path="materials/:id" element={<MaterialView />} />
        <Route path="search" element={<Search />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
