// routes/auth.js
// Handles all authentication: register, login, logout, /me, token refresh.
// Passwords are hashed with bcryptjs. Tokens are signed JWTs stored in httpOnly cookies.

const express = require("express");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ─── Helpers ───────────────────────────────────────────────────────────────

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

function setCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh",
  });
}

function clearCookies(res) {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
}

// ─── Register ──────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

router.post("/register", asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = RegisterSchema.parse(req.body);

    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = bcrypt.hashSync(password, 12);
    const result = await db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
      .run(name, email, hash);

    const user = { id: result.lastInsertRowid, email };
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await db.prepare("INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)").run(
      user.id,
      refreshToken
    );

    setCookies(res, accessToken, refreshToken);
    res.status(201).json({ user: { id: user.id, name, email } });
  } catch (err) {
    next(err);
  }
}));

// ─── Login ─────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await db.prepare("INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)").run(
      user.id,
      refreshToken
    );

    setCookies(res, accessToken, refreshToken);
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}));

// ─── Logout ────────────────────────────────────────────────────────────────

router.post("/logout", requireAuth, asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(token);
  }
  clearCookies(res);
  res.json({ message: "Logged out" });
}));

// ─── Me ────────────────────────────────────────────────────────────────────

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
}));

// ─── Refresh ───────────────────────────────────────────────────────────────

router.post("/refresh", asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const stored = await db.prepare("SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?")
      .get(token, payload.sub);

    if (!stored) return res.status(401).json({ error: "Refresh token revoked" });

    const user = await db.prepare("SELECT id, email FROM users WHERE id = ?").get(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Rotate refresh token
    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);

    await db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(token);
    await db.prepare("INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)").run(
      user.id,
      newRefresh
    );

    setCookies(res, newAccess, newRefresh);
    res.json({ message: "Token refreshed" });
  } catch (err) {
    next(err);
  }
}));

module.exports = router;
