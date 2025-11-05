import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// Seats with availability & price for a given event + section
router.get("/:eventId/section/:sectionId", async (req, res) => {
  const { eventId, sectionId } = req.params;
  const q = `
SELECT s.seat_id, s.row_label, s.seat_number,
CASE
WHEN b.booking_id IS NOT NULL THEN 'BOOKED'
WHEN h.hold_id IS NOT NULL AND h.expires_at > now() THEN 'HELD'
ELSE 'AVAILABLE'
END AS status,
COALESCE(
(SELECT sp2.price FROM seat_prices sp2 WHERE sp2.event_id = $1 AND sp2.seat_id = s.seat_id LIMIT 1),
(SELECT sp3.price FROM seat_prices sp3 WHERE sp3.event_id = $1 AND sp3.section_id = s.section_id LIMIT 1)
) AS price
FROM seats s
LEFT JOIN bookings b ON b.seat_id = s.seat_id AND b.event_id = $1 AND b.status='CONFIRMED'
LEFT JOIN holds h ON h.seat_id = s.seat_id AND h.event_id = $1 AND h.status='HELD' AND h.expires_at > now()
WHERE s.section_id = $2
ORDER BY s.row_label, s.seat_number;
`;
  try {
    const { rows } = await pool.query(q, [eventId, sectionId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
