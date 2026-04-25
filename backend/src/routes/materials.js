// routes/materials.js
// Track books, courses, videos etc. with a progress bar.
// Progress % = (current_unit / total_units) * 100

const express = require("express");
const asyncHandler = require("express-async-handler");
const { z } = require("zod");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function withProgress(m) {
  const pct = m.total_units > 0
    ? Math.round((m.current_unit / m.total_units) * 100)
    : 0;
  return { ...m, progress: pct };
}

const MaterialSchema = z.object({
  title:        z.string().min(1).max(255),
  type:         z.enum(["book", "course", "video", "podcast", "article"]).default("book"),
  total_units:  z.number().int().min(1),
  current_unit: z.number().int().min(0).default(0),
  unit_label:   z.string().default("chapter"),
  url:          z.string().default(""),
  notes:        z.string().default(""),
});

router.get("/", asyncHandler(async (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM materials WHERE user_id = ?";
  const params = [req.user.id];
  if (type) { sql += " AND type = ?"; params.push(type); }
  sql += " ORDER BY updated_at DESC";
  const materials = await db.prepare(sql).all(...params);
  res.json({ materials: await Promise.all(materials.map(withProgress)) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const m = await db.prepare("SELECT * FROM materials WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!m) return res.status(404).json({ error: "Material not found" });
  res.json({ material: withProgress(m) });
}));

router.post("/", asyncHandler(async (req, res, next) => {
  try {
    const data = MaterialSchema.parse(req.body);
    const result = await db.prepare(`INSERT INTO materials (user_id, title, type, total_units, current_unit, unit_label, url, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(req.user.id, data.title, data.type, data.total_units, data.current_unit, data.unit_label, data.url, data.notes);
    const m = await db.prepare("SELECT * FROM materials WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ material: withProgress(m) });
  } catch (err) {
    next(err);
  }
}));

router.patch("/:id", asyncHandler(async (req, res, next) => {
  try {
    const existing = await db.prepare("SELECT * FROM materials WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: "Material not found" });

    const data = MaterialSchema.partial().parse(req.body);
    const fields = [];
    const params = [];

    if (data.title        !== undefined) { fields.push("title = ?");        params.push(data.title); }
    if (data.type         !== undefined) { fields.push("type = ?");         params.push(data.type); }
    if (data.total_units  !== undefined) { fields.push("total_units = ?");  params.push(data.total_units); }
    if (data.current_unit !== undefined) { fields.push("current_unit = ?"); params.push(data.current_unit); }
    if (data.unit_label   !== undefined) { fields.push("unit_label = ?");   params.push(data.unit_label); }
    if (data.url          !== undefined) { fields.push("url = ?");          params.push(data.url); }
    if (data.notes        !== undefined) { fields.push("notes = ?");        params.push(data.notes); }

    if (fields.length > 0) {
      fields.push("updated_at = CURRENT_TIMESTAMP");
      params.push(req.params.id);
      await db.prepare(`UPDATE materials SET ${fields.join(", ")} WHERE id = ?`).run(...params);
    }

    const updated = await db.prepare("SELECT * FROM materials WHERE id = ?").get(req.params.id);
    res.json({ material: withProgress(updated) });
  } catch (err) {
    next(err);
  }
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await db.prepare("DELETE FROM materials WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Material not found" });
  res.json({ message: "Material deleted" });
}));

module.exports = router;
