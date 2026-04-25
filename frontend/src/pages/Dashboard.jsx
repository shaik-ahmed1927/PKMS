// pages/Dashboard.jsx
// Shows stats, recent notes grid, activity feed, and learning progress.

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function timeAgo(dateStr) {
  const date = dateStr.endsWith('Z') ? new Date(dateStr) : new Date(dateStr + 'Z');
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn:  () => api.get("/stats"),
  });

  const { data: notesData } = useQuery({
    queryKey: ["notes", "recent"],
    queryFn:  () => api.get("/notes"),
  });

  const { data: materialsData } = useQuery({
    queryKey: ["materials"],
    queryFn:  () => api.get("/materials"),
  });

  const recentNotes     = notesData?.notes?.slice(0, 3) ?? [];
  const inProgressMats  = materialsData?.materials?.filter((m) => m.progress > 0 && m.progress < 100).slice(0, 3) ?? [];

  return (
    <>
      <div className="topbar">
        <span className="page-title">Dashboard</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => navigate("/app/notes/new")}>
            + New note
          </button>
        </div>
      </div>

      <div className="content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Notes</div>
            <div className="stat-val">{statsLoading ? "—" : stats?.notes ?? 0}</div>
            <div className="stat-sub">{stats?.pinned ?? 0} pinned</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Bookmarks</div>
            <div className="stat-val">{statsLoading ? "—" : stats?.bookmarks ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Materials</div>
            <div className="stat-val">{statsLoading ? "—" : stats?.materials ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tags</div>
            <div className="stat-val">{statsLoading ? "—" : stats?.tags ?? 0}</div>
          </div>
        </div>

        {/* Recent notes */}
        <div className="section-header">
          <span className="section-title">Recent notes</span>
          <Link to="/app/notes" className="see-all">See all →</Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <div className="empty-state-title">No notes yet</div>
            <div className="empty-state-desc">Start capturing your thoughts and ideas</div>
            <button className="btn btn-primary" onClick={() => navigate("/app/notes/new")}>
              + Create your first note
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                to={`/app/notes/${note.id}`}
                className={`note-card${note.pinned ? " pinned" : ""}`}
              >
                <div className="note-card-title">{note.title}</div>
                <div className="note-card-excerpt">{note.content || "No content"}</div>
                <div className="note-meta">
                  {note.tags.slice(0, 2).map((t) => (
                    <span key={t.id} className="tag">{t.name}</span>
                  ))}
                  <span className="note-date">{timeAgo(note.updated_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom two-column */}
        <div className="two-col">
          {/* Activity */}
          <div>
            <div className="section-header">
              <span className="section-title">Recent activity</span>
            </div>
            {(stats?.recentActivity ?? []).length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div className="empty-state-title">No recent activity</div>
                <div className="empty-state-desc">Nothing yet — start adding notes or bookmarks.</div>
              </div>
            ) : (
              stats.recentActivity.map((item, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${item.type}`} />
                  <div className="activity-text">
                    <strong>{item.title}</strong>
                  </div>
                  <div className="activity-time">{timeAgo(item.date)}</div>
                </div>
              ))
            )}
          </div>

          {/* Learning progress */}
          <div>
            <div className="section-header">
              <span className="section-title">Learning progress</span>
              <Link to="/app/materials" className="see-all">See all →</Link>
            </div>
            {inProgressMats.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <div className="empty-state-title">Nothing being tracked yet</div>
                <div className="empty-state-desc">Add books, courses or articles you are working through</div>
                <button className="btn btn-primary" onClick={() => navigate("/app/materials")}>
                  + Add learning material
                </button>
              </div>
            ) : (
              inProgressMats.map((m) => (
                <div key={m.id} className="progress-item">
                  <div className="progress-header">
                    <span className="progress-name">{m.title}</span>
                    <span className="progress-pct">{m.progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${m.progress}%` }} />
                  </div>
                  <div className="progress-type">
                    {m.type} · {m.unit_label} {m.current_unit} of {m.total_units}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
