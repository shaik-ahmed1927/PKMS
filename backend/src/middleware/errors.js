// middleware/errors.js
// Central error handler — catches anything passed to next(err).
// In production we hide internal details from the client.

function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation failed",
      issues: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
