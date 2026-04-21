// pages/Materials.jsx
// Track books, courses, videos etc. Update progress inline.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import Modal from "../components/Modal";

const TYPES = ["book", "course", "video", "podcast", "article"];
const EMPTY = { title: "", type: "book", total_units: 10, current_unit: 0, unit_label: "chapter" };
const TABS  = ["all", "book", "course", "video", "podcast", "article"];

export default function Materials() {
  const queryClient = useQueryClient();
  const [tab,     setTab]     = useState("all");
  const [modal,   setModal]   = useState(null);
  const [current, setCurrent] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [error,   setError]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn:  () => api.get("/materials"),
  });

  const saveMutation = useMutation({
    mutationFn: (body) =>
      modal === "edit"
        ? api.patch(`/materials/${current.id}`, body)
        : api.post("/materials", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, current_unit }) => api.patch(`/materials/${id}`, { current_unit }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["materials"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  function openAdd() { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(m) {
    setCurrent(m);
    setForm({ title: m.title, type: m.type, total_units: m.total_units, current_unit: m.current_unit, unit_label: m.unit_label });
    setError("");
    setModal("edit");
  }
  function closeModal() { setModal(null); setCurrent(null); }

  function handle(e) {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === "number" ? Number(value) : value }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (form.current_unit > form.total_units) { setError("Current unit cannot exceed total"); return; }
    saveMutation.mutate(form);
  }

  const all = data?.materials ?? [];
  const filtered = tab === "all" ? all : all.filter((m) => m.type === tab);

  return (
    <>
      <div className="topbar">
        <span className="page-title">Materials</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Material</button>
        </div>
      </div>

      <div className="content">
        <div className="tab-bar">
          {TABS.map((t) => (
            <div key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="loader">Loading materials…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No {tab === "all" ? "" : tab + " "}materials yet</div>
            <div className="empty-state-desc">Track your reading and learning progress.</div>
            <button className="btn btn-primary" onClick={openAdd}>+ Material</button>
          </div>
        ) : (
          <div>
            {filtered.map((m) => (
              <div key={m.id} className="progress-item">
                <div className="progress-header">
                  <span className="progress-name">{m.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="progress-pct">{m.progress}%</span>
                    <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => openEdit(m)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "3px 8px", fontSize: 12, color: "var(--danger)" }}
                      onClick={() => window.confirm("Delete this material?") && deleteMutation.mutate(m.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${m.progress}%` }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <div className="progress-type">{m.type} · {m.unit_label} {m.current_unit} of {m.total_units}</div>
                  {/* Inline progress bump */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "2px 8px", fontSize: 12 }}
                      disabled={m.current_unit <= 0}
                      onClick={() => progressMutation.mutate({ id: m.id, current_unit: m.current_unit - 1 })}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)", minWidth: 30, textAlign: "center" }}>
                      {m.current_unit}
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "2px 8px", fontSize: 12 }}
                      disabled={m.current_unit >= m.total_units}
                      onClick={() => progressMutation.mutate({ id: m.id, current_unit: m.current_unit + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "Add material" : "Edit material"}
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
              <input className="input" name="title" placeholder="e.g. Designing Data-Intensive Applications" value={form.title} onChange={handle} autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="label">Type</label>
                <select className="input" name="type" value={form.type} onChange={handle}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Unit label</label>
                <input className="input" name="unit_label" placeholder="chapter" value={form.unit_label} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="label">Total units</label>
                <input className="input" type="number" name="total_units" min="1" value={form.total_units} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="label">Current unit</label>
                <input className="input" type="number" name="current_unit" min="0" value={form.current_unit} onChange={handle} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
