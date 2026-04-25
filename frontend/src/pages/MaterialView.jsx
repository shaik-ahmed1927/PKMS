// pages/MaterialView.jsx
// Displays a material, allowing the user to add a URL (video/article) and notes.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export default function MaterialView() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    url: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["materials", id],
    queryFn:  () => api.get(`/materials/${id}`),
  });

  useEffect(() => {
    if (data?.material) {
      setForm({
        title: data.material.title || "",
        url:   data.material.url || "",
        notes: data.material.notes || "",
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body) => api.patch(`/materials/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      // navigate("/app/materials"); // User can stay on the page
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      navigate("/app/materials");
    },
  });

  function handle(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function submit(e) {
    if (e) e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    saveMutation.mutate(form);
  }

  async function handleAiSummarize(e) {
    e.preventDefault();
    if (!form.url) return;
    setIsSummarizing(true);
    setError("");
    
    try {
      const res = await api.post("/ai/summarize-url", { url: form.url });
      
      const currentNotes = form.notes.trim();
      const newNotes = currentNotes 
        ? `${currentNotes}\n\n---\n\n✨ **AI Summary:**\n\n${res.summary}`
        : `✨ **AI Summary:**\n\n${res.summary}`;
        
      setForm(f => ({ ...f, notes: newNotes }));
    } catch (err) {
      setError(err.message || "Failed to generate AI summary.");
    } finally {
      setIsSummarizing(false);
    }
  }

  // Auto-save debounced or just manual save button. We'll use manual save for simplicity.
  
  if (isLoading) return <div className="loader">Loading…</div>;
  if (isError)   return <div className="loader">Material not found.</div>;

  const m = data.material;

  return (
    <>
      <div className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate("/app/materials")} style={{ padding: "6px 10px" }}>
          ← Materials
        </button>
        <div className="topbar-actions">
          {saveMutation.isSuccess && <span style={{ color: "var(--success)", fontSize: 13, marginRight: 10 }}>Saved</span>}
          <button className="btn btn-primary" onClick={submit} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save"}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm("Delete this material?")) deleteMutation.mutate();
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="content" style={{ maxWidth: 760 }}>
        {error && <div className="error-msg">{error}</div>}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--mono)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            {m.type}
          </div>
          <input
            className="note-editor-title"
            name="title"
            placeholder="Material title…"
            value={form.title}
            onChange={handle}
            style={{ marginBottom: 12 }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="progress-bar-bg" style={{ flex: 1, height: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${m.progress}%`, height: "100%" }} />
            </div>
            <span style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--mono)" }}>
              {m.current_unit} / {m.total_units} {m.unit_label}s ({m.progress}%)
            </span>
          </div>
        </div>

        <div className="divider" />

        <div style={{ marginBottom: 20 }}>
          <label className="label">Resource Link (Video, Article, etc.)</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="input"
              name="url"
              placeholder="https://..."
              value={form.url}
              onChange={handle}
              style={{ flex: 1 }}
            />
            {form.url && (
              <a href={form.url} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ display: "flex", alignItems: "center" }}>
                Open ↗
              </a>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="label" style={{ marginBottom: 0 }}>Notes</label>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '4px 8px', color: 'var(--text2)' }}
              onClick={handleAiSummarize}
              disabled={isSummarizing || !form.url}
              title={!form.url ? "Add a valid Resource Link to summarize" : "Summarize using Gemini AI"}
            >
              {isSummarizing ? "✨ Summarizing..." : "✨ AI Summarize"}
            </button>
          </div>
          <textarea
            className="note-editor-body"
            name="notes"
            placeholder="Write your notes or summaries here…"
            value={form.notes}
            onChange={handle}
            style={{ minHeight: 300, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}
          />
        </div>
      </div>
    </>
  );
}
