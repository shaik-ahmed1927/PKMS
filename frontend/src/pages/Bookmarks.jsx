// pages/Bookmarks.jsx
// Lists all bookmarks. Add / edit / delete via modal.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import Modal from "../components/Modal";
import TagInput from "../components/TagInput";

const EMPTY = { title: "", url: "", description: "", tags: [] };

function hostname(url) {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

export default function Bookmarks() {
  const queryClient = useQueryClient();
  const [modal,   setModal]   = useState(null);  // null | "add" | "edit"
  const [current, setCurrent] = useState(null);  // bookmark being edited
  const [form,    setForm]    = useState(EMPTY);
  const [error,   setError]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn:  () => api.get("/bookmarks"),
  });

  const saveMutation = useMutation({
    mutationFn: (body) =>
      modal === "edit"
        ? api.patch(`/bookmarks/${current.id}`, body)
        : api.post("/bookmarks", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  function openAdd() {
    setForm(EMPTY);
    setError("");
    setModal("add");
  }

  function openEdit(bm) {
    setCurrent(bm);
    setForm({ title: bm.title, url: bm.url, description: bm.description, tags: bm.tags.map((t) => t.name) });
    setError("");
    setModal("edit");
  }

  function closeModal() { setModal(null); setCurrent(null); }

  function handle(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.url.trim())   { setError("URL is required");   return; }
    saveMutation.mutate(form);
  }

  const bookmarks = data?.bookmarks ?? [];

  return (
    <>
      <div className="topbar">
        <span className="page-title">Bookmarks</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Bookmark</button>
        </div>
      </div>

      <div className="content">
        {isLoading ? (
          <div className="loader">Loading bookmarks…</div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No bookmarks yet</div>
            <div className="empty-state-desc">Save URLs to read or reference later.</div>
            <button className="btn btn-primary" onClick={openAdd}>+ Bookmark</button>
          </div>
        ) : (
          <div>
            {bookmarks.map((bm) => (
              <div key={bm.id} className="bm-row">
                <div className="bm-icon">↗</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="bm-title">{bm.title}</div>
                  </a>
                  <div className="bm-url">{hostname(bm.url)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {bm.tags.slice(0, 2).map((t) => (
                    <span key={t.id} className="tag">{t.name}</span>
                  ))}
                  <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => openEdit(bm)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }}
                    onClick={() => window.confirm("Delete bookmark?") && deleteMutation.mutate(bm.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "Add bookmark" : "Edit bookmark"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : "Save"}
              </button>
            </>
          }
        >
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">Title</label>
              <input className="input" name="title" placeholder="Page title" value={form.title} onChange={handle} autoFocus />
            </div>
            <div className="form-group">
              <label className="label">URL</label>
              <input className="input" name="url" type="url" placeholder="https://…" value={form.url} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <input className="input" name="description" placeholder="Optional note" value={form.description} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="label">Tags</label>
              <TagInput tags={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
