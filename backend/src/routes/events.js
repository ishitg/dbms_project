import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// GET /api/events - List all events with venue info
router.get("/", async (req, res) => {
  try {
    const q = `
      SELECT e.event_id, e.title, e.start_ts, e.end_ts, e.created_at,
             v.venue_id, v.name AS venue_name, v.address AS venue_address,
             COUNT(DISTINCT s.seat_id) AS total_seats,
             COUNT(DISTINCT b.booking_id) AS booked_seats
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      LEFT JOIN sections sec ON v.venue_id = sec.venue_id
      LEFT JOIN seats s ON sec.section_id = s.section_id
      LEFT JOIN bookings b ON b.event_id = e.event_id AND b.seat_id = s.seat_id AND b.status = 'CONFIRMED'
      GROUP BY e.event_id, v.venue_id
      ORDER BY e.start_ts ASC
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id - Get single event details
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const eventQuery = `
      SELECT e.*, v.name AS venue_name, v.address AS venue_address
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.event_id = $1
    `;
    const eventResult = await pool.query(eventQuery, [id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Get sections for this event's venue
    const sectionsQuery = `
      SELECT s.section_id, s.name, s.venue_id,
             COUNT(DISTINCT seats.seat_id) AS total_seats,
             COUNT(DISTINCT b.booking_id) AS booked_seats,
             MIN(sp.price) AS min_price,
             MAX(sp.price) AS max_price
      FROM sections s
      LEFT JOIN seats ON s.section_id = seats.section_id
      LEFT JOIN bookings b ON b.seat_id = seats.seat_id AND b.event_id = $1 AND b.status = 'CONFIRMED'
      LEFT JOIN seat_prices sp ON sp.section_id = s.section_id AND sp.event_id = $1
      WHERE s.venue_id = $2
      GROUP BY s.section_id
      ORDER BY s.section_id
    `;
    const sectionsResult = await pool.query(sectionsQuery, [
      id,
      eventResult.rows[0].venue_id,
    ]);

    res.json({
      event: eventResult.rows[0],
      sections: sectionsResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
