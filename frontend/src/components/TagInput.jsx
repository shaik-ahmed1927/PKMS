// components/TagInput.jsx
// Type a tag name and press Enter or comma to add it.
// Shows existing tags as removable pills.

import { useState } from "react";

export default function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState("");

  function add(val) {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  }

  function remove(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKey(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
      setInput("");
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      remove(tags[tags.length - 1]);
    }
  }

  function handleBlur() {
    if (input.trim()) {
      add(input);
      setInput("");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "7px 10px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--bg)",
        cursor: "text",
        minHeight: 38,
        alignItems: "center",
        transition: "border-color 0.15s",
      }}
      onClick={(e) => e.currentTarget.querySelector("input").focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="tag"
          style={{ gap: 4 }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); remove(tag); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              color: "var(--tag-text)",
              fontSize: 12,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? "Add tags (press Enter)…" : ""}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 13,
          color: "var(--text)",
          fontFamily: "var(--font)",
          flex: 1,
          minWidth: 80,
        }}
      />
    </div>
  );
}
