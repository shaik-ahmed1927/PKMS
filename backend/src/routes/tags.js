// routes/tags.js
// Manage user tags. Tags are created automatically when attached to notes/bookmarks,
// but users can also manage them directly here.

const express = require("express");
const asyncHandler = require("express-async-handler");
const { z } = require("zod");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const tags = await db.prepare("SELECT * FROM tags WHERE user_id = ? ORDER BY name")
    .all(req.user.id);
  res.json({ tags });
}));

router.post("/", asyncHandler(async (req, res, next) => {
  try {
    const { name, color } = z.object({
      name:  z.string().min(1).max(50),
      color: z.string().optional().default("#888780"),
    }).parse(req.body);

    const trimmed = name.trim().toLowerCase();
    const existing = await db.prepare("SELECT id FROM tags WHERE user_id = ? AND name = ?")
      .get(req.user.id, trimmed);

    if (existing) return res.status(409).json({ error: "Tag already exists" });

    const result = await db.prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)")
      .run(req.user.id, trimmed, color);

    const tag = await db.prepare("SELECT * FROM tags WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ tag });
  } catch (err) {
    next(err);
  }
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await db.prepare("DELETE FROM tags WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Tag not found" });
  res.json({ message: "Tag deleted" });
}));

module.exports = router;
