// routes/search.js
// Single endpoint that searches notes, bookmarks, and materials in one query.
// Returns results grouped by type with a snippet of matched content.

const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters" });
  }

  const pattern = `%${q}%`;
  const uid = req.user.id;

  const notes = await db.prepare(`SELECT id, title, content, category, updated_at, 'note' as type
       FROM notes
       WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
       ORDER BY updated_at DESC LIMIT 20`
    )
    .all(uid, pattern, pattern);

  const mappedNotes = notes.map((n) => ({
    ...n,
    snippet: n.content.length > 120 ? n.content.slice(0, 120) + "…" : n.content,
  }));

  const bookmarks = await db.prepare(`SELECT id, title, url, description, created_at, 'bookmark' as type
       FROM bookmarks
       WHERE user_id = ? AND (title LIKE ? OR url LIKE ? OR description LIKE ?)
       ORDER BY created_at DESC LIMIT 20`
    )
    .all(uid, pattern, pattern, pattern);

  const materials = await db.prepare(`SELECT id, title, type as material_type, current_unit, total_units, updated_at, 'material' as type
       FROM materials
       WHERE user_id = ? AND title LIKE ?
       ORDER BY updated_at DESC LIMIT 20`
    )
    .all(uid, pattern);

  const results = [...mappedNotes, ...bookmarks, ...materials];

  res.json({ query: q, count: results.length, results });
}));

module.exports = router;
