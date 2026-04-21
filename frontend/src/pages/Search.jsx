// pages/Search.jsx
// Live search across notes, bookmarks, and materials.
// Debounced so it doesn't hit the API on every keystroke.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const TYPE_LABELS = { note: "note", bookmark: "bookmark", material: "material" };

export default function Search() {
  const navigate    = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQ  = useDebounce(query);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debouncedQ],
    queryFn:  () => api.get(`/search?q=${encodeURIComponent(debouncedQ)}`),
    enabled:  debouncedQ.length >= 2,
  });

  function handleClick(item) {
    if (item.type === "note")     navigate(`/notes/${item.id}`);
    if (item.type === "bookmark") window.open(item.url, "_blank", "noopener");
    if (item.type === "material") navigate("/materials");
  }

  return (
    <>
      <div className="topbar">
        <span className="page-title">Search</span>
      </div>

      <div className="content">
        <div className="search-full">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, color: "var(--text3)" }}>
            <circle cx="7" cy="7" r="4.5"/>
            <path d="M10.5 10.5l3 3"/>
          </svg>
          <input
            placeholder="Search notes, bookmarks, materials…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {isFetching && (
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Searching…</span>
          )}
        </div>

        {/* Hint */}
        {query.length < 2 && (
          <div className="empty-state" style={{ padding: "48px 0" }}>
            <div className="empty-state-title">Search everything</div>
            <div className="empty-state-desc">Notes, bookmarks, and materials in one place.</div>
          </div>
        )}

        {/* No results */}
        {debouncedQ.length >= 2 && !isFetching && data?.count === 0 && (
          <div className="empty-state" style={{ padding: "48px 0" }}>
            <div className="empty-state-title">No results for "{debouncedQ}"</div>
            <div className="empty-state-desc">Try different keywords.</div>
          </div>
        )}

        {/* Results */}
        {data?.results?.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontFamily: "var(--mono)" }}>
              {data.count} result{data.count !== 1 ? "s" : ""} for "{data.query}"
            </div>
            {data.results.map((item, i) => (
              <div
                key={i}
                className="search-result-item"
                onClick={() => handleClick(item)}
              >
                <span className="search-result-type">{TYPE_LABELS[item.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="search-result-title">{item.title}</div>
                  {item.snippet && (
                    <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                      {item.snippet}
                    </div>
                  )}
                  {item.url && (
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", marginTop: 2 }}>
                      {item.url}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "var(--text3)", flexShrink: 0 }}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
