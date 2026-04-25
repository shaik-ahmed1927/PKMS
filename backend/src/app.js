// app.js
// Express server entry point.
// Registers all middleware and routes, then starts listening.

require("dotenv").config();

const express     = require("express");
const cookieParser = require("cookie-parser");
const rateLimit   = require("express-rate-limit");
const cors        = require("cors");

const authRoutes      = require("./routes/auth");
const notesRoutes     = require("./routes/notes");
const bookmarkRoutes  = require("./routes/bookmarks");
const materialRoutes  = require("./routes/materials");
const tagsRoutes      = require("./routes/tags");
const searchRoutes    = require("./routes/search");
const statsRoutes     = require("./routes/stats");
const aiRoutes        = require("./routes/ai");
const { errorHandler } = require("./middleware/errors");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Core middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ─── Rate limiting ──────────────────────────────────────────────────────────
// Stricter limit on auth endpoints to slow down brute force attempts

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // significantly increased for development
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api",      generalLimiter);

// ─── Routes ─────────────────────────────────────────────────────────────────

app.use("/api/auth",      authRoutes);
app.use("/api/notes",     notesRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/tags",      tagsRoutes);
app.use("/api/search",    searchRoutes);
app.use("/api/stats",     statsRoutes);
app.use("/api/ai",        aiRoutes);

// ─── Health check ───────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 ────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ──────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ──────────────────────────────────────────────────────────────────
// Wait for sql.js database to finish initialising before accepting requests

const { ready } = require("./db");
ready.then(() => {
  app.listen(PORT, () => {
    console.log(`\n  PKMS backend running on http://localhost:${PORT}\n`);
  });
});

module.exports = app;

