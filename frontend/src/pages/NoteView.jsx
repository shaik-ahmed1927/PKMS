// pages/NoteView.jsx
// Displays a single note in read mode with its tags and linked notes.

import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

function timeAgo(dateStr) {
  const date = dateStr.endsWith('Z') ? new Date(dateStr) : new Date(dateStr + 'Z');
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NoteView() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", id],
    queryFn:  () => api.get(`/notes/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      navigate("/app/notes");
    },
  });

  const togglePin = useMutation({
    mutationFn: (val) => api.patch(`/notes/${id}`, { pinned: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", id] }),
  });

  const toggleFav = useMutation({
    mutationFn: (val) => api.patch(`/notes/${id}`, { favorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", id] }),
  });

  if (isLoading) return <div className="loader">Loading…</div>;
  if (isError)   return <div className="loader">Note not found.</div>;

  const note = data.note;

  return (
    <>
      <div className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate("/app/notes")} style={{ padding: "6px 10px" }}>
          ← Notes
        </button>
        <div className="topbar-actions">
          <button
            className="btn btn-ghost"
            onClick={() => togglePin.mutate(!note.pinned)}
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? "📌 Pinned" : "Pin"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => toggleFav.mutate(!note.favorite)}
            title={note.favorite ? "Remove from favourites" : "Add to favourites"}
          >
            {note.favorite ? "★ Fav" : "☆ Fav"}
          </button>
          <button className="btn" onClick={() => navigate(`/app/notes/${id}/edit`)}>
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm("Delete this note?")) deleteMutation.mutate();
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="content" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: "var(--text)", marginBottom: 12, lineHeight: 1.3 }}>
            {note.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {note.tags.map((t) => (
              <span key={t.id} className="tag">{t.name}</span>
            ))}
            <span style={{ color: "var(--text3)", fontSize: 12, fontFamily: "var(--mono)", marginLeft: "auto" }}>
              {note.category} · updated {timeAgo(note.updated_at)}
            </span>
          </div>
        </div>

        <div className="divider" />

        {/* Content */}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: "var(--text)",
            whiteSpace: "pre-wrap",
            marginBottom: 40,
            minHeight: 200,
          }}
        >
          {note.content || <span style={{ color: "var(--text3)" }}>No content</span>}
        </div>

        {/* Linked notes */}
        {note.links?.length > 0 && (
          <>
            <div className="divider" />
            <div style={{ marginTop: 24 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>Linked notes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {note.links.map((link) => (
                  <Link
                    key={link.id}
                    to={`/app/notes/${link.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: 13.5,
                      fontWeight: 500,
                      transition: "background 0.12s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg2)")}
                    onMouseOut={(e)  => (e.currentTarget.style.background = "")}
                  >
                    <span style={{ color: "var(--text3)" }}>↗</span>
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
