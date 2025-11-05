import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// GET /api/venues - List all venues
router.get("/", async (req, res) => {
  try {
    const q = `SELECT * FROM venues ORDER BY venue_id`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/venues/:id/sections - Get sections in a venue
router.get("/:id/sections", async (req, res) => {
  const { id } = req.params;
  try {
    const q = `
      SELECT s.section_id, s.name, s.venue_id,
             COUNT(DISTINCT seats.seat_id) AS total_seats
      FROM sections s
      LEFT JOIN seats ON s.section_id = seats.section_id
      WHERE s.venue_id = $1
      GROUP BY s.section_id
      ORDER BY s.section_id
    `;
    const { rows } = await pool.query(q, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
