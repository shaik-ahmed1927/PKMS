// pages/Notes.jsx
// Lists all notes with All / Pinned / Favourites tabs.
// Each row links to the note detail view.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

function timeAgo(dateStr) {
  const date = dateStr.endsWith('Z') ? new Date(dateStr) : new Date(dateStr + 'Z');
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TABS = ["all", "pinned", "favourites"];

export default function Notes() {
  const navigate    = useNavigate();
  const [tab, setTab] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn:  () => api.get("/notes"),
  });

  const allNotes = data?.notes ?? [];

  const filtered = allNotes.filter((n) => {
    if (tab === "pinned")     return n.pinned;
    if (tab === "favourites") return n.favorite;
    return true;
  });

  return (
    <>
      <div className="topbar">
        <span className="page-title">Notes</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => navigate("/app/notes/new")}>
            + New note
          </button>
        </div>
      </div>

      <div className="content">
        <div className="tab-bar">
          {TABS.map((t) => (
            <div
              key={t}
              className={`tab${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="loader">Loading notes…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No notes here</div>
            <div className="empty-state-desc">
              {tab === "all" ? "Create your first note." : `No ${tab} notes yet.`}
            </div>
            {tab === "all" && (
              <button className="btn btn-primary" onClick={() => navigate("/app/notes/new")}>
                + New note
              </button>
            )}
          </div>
        ) : (
          <table className="list-table">
            <tbody>
              {filtered.map((note) => (
                <tr key={note.id} onClick={() => navigate(`/app/notes/${note.id}`)}>
                  <td>
                    {Boolean(note.pinned) && (
                      <span style={{ marginRight: 8, color: "var(--text3)", fontSize: 11 }}>●</span>
                    )}
                    {note.title}
                  </td>
                  <td className="td-tag">
                    {note.tags[0] && <span className="tag">{note.tags[0].name}</span>}
                  </td>
                  <td className="td-meta">{note.category}</td>
                  <td className="td-meta">{timeAgo(note.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
