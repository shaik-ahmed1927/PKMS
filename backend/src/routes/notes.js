// routes/notes.js
// Full CRUD for notes. Also handles tag attachment and bidirectional note linking.

const express = require("express");
const asyncHandler = require("express-async-handler");
const { z } = require("zod");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// ─── Helpers ───────────────────────────────────────────────────────────────

// Fetches tags and linked note IDs for a note
async function enrichNote(note) {
  const tags = await db.prepare(`SELECT t.id, t.name, t.color FROM tags t
       JOIN note_tags nt ON nt.tag_id = t.id
       WHERE nt.note_id = ?`
    )
    .all(note.id);

  const links = await db.prepare(`SELECT n.id, n.title FROM notes n
       JOIN note_links nl ON (nl.target_id = n.id OR nl.source_id = n.id)
       WHERE (nl.source_id = ? OR nl.target_id = ?) AND n.id != ?`
    )
    .all(note.id, note.id, note.id);

  return { ...note, tags, links };
}

// Sync tags array onto a note — adds new tags, removes detached ones
async function syncTags(noteId, userId, tagNames = []) {
  await db.prepare("DELETE FROM note_tags WHERE note_id = ?").run(noteId);

  for (const name of tagNames) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;

    let tag = await db.prepare("SELECT id FROM tags WHERE user_id = ? AND name = ?")
      .get(userId, trimmed);

    if (!tag) {
      const res = await db.prepare("INSERT INTO tags (user_id, name) VALUES (?, ?)")
        .run(userId, trimmed);
      tag = { id: res.lastInsertRowid };
    }

    await db.prepare("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)")
      .run(noteId, tag.id);
  }
}

const NoteSchema = z.object({
  title:    z.string().min(1).max(255),
  content:  z.string().optional().default(""),
  category: z.string().optional().default("general"),
  pinned:   z.boolean().optional().default(false),
  favorite: z.boolean().optional().default(false),
  tags:     z.array(z.string()).optional().default([]),
});

// ─── List all notes ────────────────────────────────────────────────────────

router.get("/", asyncHandler(async (req, res) => {
  const { search, category, pinned, favorite } = req.query;

  let sql = `SELECT * FROM notes WHERE user_id = ?`;
  const params = [req.user.id];

  if (category) { sql += ` AND category = ?`;    params.push(category); }
  if (pinned)   { sql += ` AND pinned = 1`; }
  if (favorite) { sql += ` AND favorite = 1`; }
  if (search)   {
    sql += ` AND (title LIKE ? OR content LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY pinned DESC, updated_at DESC`;

  const notes = await db.prepare(sql).all(...params);
  res.json({ notes: await Promise.all(notes.map(enrichNote)) });
}));

// ─── Get single note ───────────────────────────────────────────────────────

router.get("/:id", asyncHandler(async (req, res) => {
  const note = await db.prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json({ note: await enrichNote(note) });
}));

// ─── Create note ───────────────────────────────────────────────────────────

router.post("/", asyncHandler(async (req, res, next) => {
  try {
    const data = NoteSchema.parse(req.body);

    const result = await db.prepare(`INSERT INTO notes (user_id, title, content, category, pinned, favorite)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(req.user.id, data.title, data.content, data.category, data.pinned ? 1 : 0, data.favorite ? 1 : 0);

    await syncTags(result.lastInsertRowid, req.user.id, data.tags);

    const note = await db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ note: await enrichNote(note) });
  } catch (err) {
    next(err);
  }
}));

// ─── Update note ───────────────────────────────────────────────────────────

router.patch("/:id", asyncHandler(async (req, res, next) => {
  try {
    const existing = await db.prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);

    if (!existing) return res.status(404).json({ error: "Note not found" });

    const data = NoteSchema.partial().parse(req.body);

    const fields = [];
    const params = [];

    if (data.title    !== undefined) { fields.push("title = ?");    params.push(data.title); }
    if (data.content  !== undefined) { fields.push("content = ?");  params.push(data.content); }
    if (data.category !== undefined) { fields.push("category = ?"); params.push(data.category); }
    if (data.pinned   !== undefined) { fields.push("pinned = ?");   params.push(data.pinned ? 1 : 0); }
    if (data.favorite !== undefined) { fields.push("favorite = ?"); params.push(data.favorite ? 1 : 0); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      params.push(req.params.id);
      await db.prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`).run(...params);
    }

    if (data.tags !== undefined) {
      await syncTags(req.params.id, req.user.id, data.tags);
    }

    const updated = await db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
    res.json({ note: await enrichNote(updated) });
  } catch (err) {
    next(err);
  }
}));

// ─── Delete note ───────────────────────────────────────────────────────────

router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await db.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);

  if (result.changes === 0) return res.status(404).json({ error: "Note not found" });
  res.json({ message: "Note deleted" });
}));

// ─── Link two notes (bidirectional) ────────────────────────────────────────

router.post("/:id/links", asyncHandler(async (req, res) => {
  const { targetId } = req.body;
  if (!targetId) return res.status(400).json({ error: "targetId required" });

  const source = await db.prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  const target = await db.prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?")
    .get(targetId, req.user.id);

  if (!source || !target) return res.status(404).json({ error: "Note not found" });

  await db.prepare("INSERT OR IGNORE INTO note_links (source_id, target_id) VALUES (?, ?)").run(
    req.params.id,
    targetId
  );

  res.json({ message: "Notes linked" });
}));

// ─── Unlink two notes ──────────────────────────────────────────────────────

router.delete("/:id/links/:targetId", asyncHandler(async (req, res) => {
  await db.prepare(
    `DELETE FROM note_links
     WHERE (source_id = ? AND target_id = ?) OR (source_id = ? AND target_id = ?)`
  ).run(req.params.id, req.params.targetId, req.params.targetId, req.params.id);

  res.json({ message: "Link removed" });
}));

module.exports = router;
