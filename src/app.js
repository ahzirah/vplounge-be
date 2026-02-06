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
  app.use("/api", waitlistRoutes);

  return app;
}

module.exports = { createApp };