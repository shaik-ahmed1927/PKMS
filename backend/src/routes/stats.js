// routes/stats.js
// Returns counts for the dashboard — notes, bookmarks, materials, tags.

const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const uid = req.user.id;

  const notes     = parseInt((await db.prepare("SELECT COUNT(*) as c FROM notes     WHERE user_id = ?").get(uid)).c) || 0;
  const pinned    = parseInt((await db.prepare("SELECT COUNT(*) as c FROM notes     WHERE user_id = ? AND pinned = 1").get(uid)).c) || 0;
  const bookmarks = parseInt((await db.prepare("SELECT COUNT(*) as c FROM bookmarks WHERE user_id = ?").get(uid)).c) || 0;
  const materials = parseInt((await db.prepare("SELECT COUNT(*) as c FROM materials WHERE user_id = ?").get(uid)).c) || 0;
  const tags      = parseInt((await db.prepare("SELECT COUNT(*) as c FROM tags      WHERE user_id = ?").get(uid)).c) || 0;

  const recentActivity = await db.prepare(`
    SELECT id, title, updated_at as date, 'note' as type FROM notes WHERE user_id = ?
    UNION ALL
    SELECT id, title, created_at as date, 'bookmark' as type FROM bookmarks WHERE user_id = ?
    ORDER BY date DESC LIMIT 10
  `).all(uid, uid);

  res.json({ notes, pinned, bookmarks, materials, tags, recentActivity });
}));

module.exports = router;
