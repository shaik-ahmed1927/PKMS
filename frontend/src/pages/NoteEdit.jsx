// pages/NoteEdit.jsx
// Used for both creating (/notes/new) and editing (/notes/:id/edit).
// Detects which mode based on whether :id is present in URL params.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import TagInput from "../components/TagInput";

const CATEGORIES = ["general", "work", "learning", "personal", "project", "reference"];

export default function NoteEdit() {
  const { id }      = useParams();        // undefined when creating
  const isEditing   = Boolean(id);
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title:    "",
    content:  "",
    category: "general",
    pinned:   false,
    favorite: false,
    tags:     [],
  });
  const [error, setError] = useState("");

  // Load existing note when editing
  const { data } = useQuery({
    queryKey:  ["notes", id],
    queryFn:   () => api.get(`/notes/${id}`),
    enabled:   isEditing,
  });

  useEffect(() => {
    if (data?.note) {
      const n = data.note;
      setForm({
        title:    n.title,
        content:  n.content,
        category: n.category,
        pinned:   Boolean(n.pinned),
        favorite: Boolean(n.favorite),
        tags:     n.tags.map((t) => t.name),
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body) =>
      isEditing
        ? api.patch(`/notes/${id}`, body)
        : api.post("/notes", body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      const noteId = isEditing ? id : res.note.id;
      navigate(`/notes/${noteId}`);
    },
    onError: (err) => setError(err.message),
  });

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    saveMutation.mutate(form);
  }

  return (
    <>
      <div className="topbar">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(isEditing ? `/notes/${id}` : "/notes")}
          style={{ padding: "6px 10px" }}
        >
          ← {isEditing ? "Back" : "Notes"}
        </button>
        <div className="topbar-actions">
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>
            <input type="checkbox" name="pinned" checked={form.pinned} onChange={handle} />
            Pinned
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>
            <input type="checkbox" name="favorite" checked={form.favorite} onChange={handle} />
            Favourite
          </label>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : isEditing ? "Save" : "Create note"}
          </button>
        </div>
      </div>

      <div className="content" style={{ maxWidth: 760 }}>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={submit}>
          {/* Title */}
          <input
            className="note-editor-title"
            name="title"
            placeholder="Note title…"
            value={form.title}
            onChange={handle}
            autoFocus={!isEditing}
          />

          {/* Meta row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                name="category"
                value={form.category}
                onChange={handle}
                style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label">Tags</label>
              <TagInput
                tags={form.tags}
                onChange={(tags) => setForm((f) => ({ ...f, tags }))}
              />
            </div>
          </div>

          <div className="divider" />

          {/* Content */}
          <textarea
            className="note-editor-body"
            name="content"
            placeholder="Start writing…"
            value={form.content}
            onChange={handle}
          />
        </form>
      </div>
    </>
  );
}
