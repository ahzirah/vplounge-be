const express = require("express");
const router = express.Router();

const { pool } = require("../db/pool");
const { waitlistSchema } = require("../validators/waitlist.schema");

// POST /api/waitlist
router.post("/waitlist", async (req, res) => {
  const parsed = waitlistSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten(),
    });
  }

  // Honeypot anti-bot: pretend success but do nothing
  if (parsed.data.website) {
    return res.status(200).json({ message: "You're on the waitlist ✅" });
  }

  const {
    email,
    role,
    petType,
    location,
    refSource,
    refCampaign,
  } = parsed.data;

  try {
    const result = await pool.query(
        `INSERT INTO waitlist_signups (email, role, pet_type, location, ref_source, ref_campaign)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          email.toLowerCase(),
          role ?? null,
          petType ?? null,
          location ?? null,
          refSource ?? null,
          refCampaign ?? null,
        ]
      );
      
      if (result.rowCount === 0) {
        return res.status(409).json({ message: "You're already on the waitlist" });
      }
      
      return res.status(201).json({ message: "You're on the waitlist" });
  } catch (err) {
    console.error("Waitlist insert error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/waitlist/stats (admin-protected)
router.get("/waitlist/stats", async (req, res) => {
  const adminKey = req.header("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const totalRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM waitlist_signups`
    );

    const byRoleRes = await pool.query(`
      SELECT COALESCE(role, 'unknown') AS role, COUNT(*)::int AS count
      FROM waitlist_signups
      GROUP BY COALESCE(role, 'unknown')
      ORDER BY count DESC
    `);

    return res.json({
      total: totalRes.rows[0].total,
      byRole: byRoleRes.rows,
    });
} catch (err) {
    console.error("Waitlist insert error:", err); // <-- keep
    return res.status(500).json({
      message: "Server error",
      error: err.message,
      code: err.code,
    });
  }
});

module.exports = router;