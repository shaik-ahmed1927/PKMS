// routes/bookmarks.js
// CRUD for bookmarks. Tags work the same way as notes.

const express = require("express");
const asyncHandler = require("express-async-handler");
const { z } = require("zod");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

async function enrichBookmark(bm) {
  const tags = await db.prepare(`SELECT t.id, t.name, t.color FROM tags t
       JOIN bookmark_tags bt ON bt.tag_id = t.id
       WHERE bt.bookmark_id = ?`
    )
    .all(bm.id);
  return { ...bm, tags };
}

async function syncTags(bookmarkId, userId, tagNames = []) {
  await db.prepare("DELETE FROM bookmark_tags WHERE bookmark_id = ?").run(bookmarkId);
  for (const name of tagNames) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;
    let tag = await db.prepare("SELECT id FROM tags WHERE user_id = ? AND name = ?").get(userId, trimmed);
    if (!tag) {
      const res = await db.prepare("INSERT INTO tags (user_id, name) VALUES (?, ?)").run(userId, trimmed);
      tag = { id: res.lastInsertRowid };
    }
    await db.prepare("INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING").run(bookmarkId, tag.id);
  }
}

const BookmarkSchema = z.object({
  title:       z.string().min(1).max(255),
  url:         z.string().url(),
  description: z.string().optional().default(""),
  tags:        z.array(z.string()).optional().default([]),
});

router.get("/", asyncHandler(async (req, res) => {
  const { search } = req.query;
  let sql = "SELECT * FROM bookmarks WHERE user_id = ?";
  const params = [req.user.id];
  if (search) {
    sql += " AND (title LIKE ? OR url LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY created_at DESC";
  const bookmarks = await db.prepare(sql).all(...params);
  res.json({ bookmarks: await Promise.all(bookmarks.map(enrichBookmark)) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const bm = await db.prepare("SELECT * FROM bookmarks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!bm) return res.status(404).json({ error: "Bookmark not found" });
  res.json({ bookmark: await enrichBookmark(bm) });
}));

router.post("/", asyncHandler(async (req, res, next) => {
  try {
    const data = BookmarkSchema.parse(req.body);
    const result = await db.prepare("INSERT INTO bookmarks (user_id, title, url, description) VALUES (?, ?, ?, ?)")
      .run(req.user.id, data.title, data.url, data.description);
    await syncTags(result.lastInsertRowid, req.user.id, data.tags);
    const bm = await db.prepare("SELECT * FROM bookmarks WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ bookmark: await enrichBookmark(bm) });
  } catch (err) {
    next(err);
  }
}));

router.patch("/:id", asyncHandler(async (req, res, next) => {
  try {
    const existing = await db.prepare("SELECT * FROM bookmarks WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: "Bookmark not found" });

    const data = BookmarkSchema.partial().parse(req.body);
    const fields = [];
    const params = [];

    if (data.title       !== undefined) { fields.push("title = ?");       params.push(data.title); }
    if (data.url         !== undefined) { fields.push("url = ?");         params.push(data.url); }
    if (data.description !== undefined) { fields.push("description = ?"); params.push(data.description); }

    if (fields.length > 0) {
      fields.push("updated_at = CURRENT_TIMESTAMP");
      params.push(req.params.id);
      await db.prepare(`UPDATE bookmarks SET ${fields.join(", ")} WHERE id = ?`).run(...params);
    }
    if (data.tags !== undefined) await syncTags(req.params.id, req.user.id, data.tags);

    const updated = await db.prepare("SELECT * FROM bookmarks WHERE id = ?").get(req.params.id);
    res.json({ bookmark: await enrichBookmark(updated) });
  } catch (err) {
    next(err);
  }
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await db.prepare("DELETE FROM bookmarks WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Bookmark not found" });
  res.json({ message: "Bookmark deleted" });
}));

module.exports = router;
