const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const waitlistRoutes = require("./routes/waitlist.routes");

function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // Logs
  app.use(morgan("tiny"));

  // JSON body
  app.use(express.json({ limit: "50kb" }));

  // CORS (allow your frontend only)
  const origins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: origins.length ? origins : true,
      methods: ["GET", "POST"],
    })
  );

  // Basic rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Health check
  app.get("/health", (req, res) => res.json({ ok: true }));

  // Routes

  const { pool } = require("./db/pool");

  app.get("/db-test", async (req, res) => {
    try {
      const r = await pool.query("SELECT NOW() as now");
      res.json({ ok: true, now: r.rows[0].now });
    } catch (err) {
      console.error("DB TEST ERROR:", err);
      res.status(500).json({ ok: false, error: err.message, code: err.code });
    }
  });

  app.get("/", (req, res) => {
    res.json({ message: "VPLounge API is running", health: "/health" });
  });
  app.use("/api", waitlistRoutes);

  return app;
}

module.exports = { createApp };