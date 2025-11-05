import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// GET /api/bookings/user/:userId - Get user's bookings
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const q = `
      SELECT b.booking_id, b.event_id, b.seat_id, b.price_paid, b.booked_at, b.status,
             e.title AS event_title, e.start_ts AS event_start,
             v.name AS venue_name, v.address AS venue_address,
             s.row_label, s.seat_number, sec.name AS section_name
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      JOIN venues v ON e.venue_id = v.venue_id
      JOIN seats s ON b.seat_id = s.seat_id
      JOIN sections sec ON s.section_id = sec.section_id
      WHERE b.user_id = $1
      ORDER BY b.booked_at DESC
    `;
    const { rows } = await pool.query(q, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/hold { eventId, seatId, userId, seconds? }
router.post("/hold", async (req, res) => {
  const { eventId, seatId, userId, seconds = 600 } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clean up expired holds for this seat first
    await client.query(
      `UPDATE holds SET status = 'EXPIRED' 
       WHERE event_id = $1 AND seat_id = $2 AND status = 'HELD' AND expires_at <= now()`,
      [eventId, seatId]
    );

    // Delete the expired hold to avoid unique constraint violation
    await client.query(
      `DELETE FROM holds 
       WHERE event_id = $1 AND seat_id = $2 AND status = 'EXPIRED'`,
      [eventId, seatId]
    );

    // Now try to insert the new hold
    const { rows } = await client.query(
      `INSERT INTO holds(event_id, seat_id, user_id, expires_at)
       VALUES ($1, $2, $3, now() + ($4 || ' seconds')::interval)
       RETURNING hold_id, expires_at`,
      [eventId, seatId, userId, seconds]
    );

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505")
      return res.status(409).json({ error: "Seat already held or booked" });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/bookings/hold-multiple { eventId, seatIds: [], userId, seconds? }
router.post("/hold-multiple", async (req, res) => {
  const { eventId, seatIds, userId, seconds = 600 } = req.body;

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: "seatIds must be a non-empty array" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const holdIds = [];

    for (const seatId of seatIds) {
      // Clean up expired holds for each seat
      await client.query(
        `UPDATE holds SET status = 'EXPIRED' 
         WHERE event_id = $1 AND seat_id = $2 AND status = 'HELD' AND expires_at <= now()`,
        [eventId, seatId]
      );

      await client.query(
        `DELETE FROM holds 
         WHERE event_id = $1 AND seat_id = $2 AND status = 'EXPIRED'`,
        [eventId, seatId]
      );

      // Insert new hold
      const { rows } = await client.query(
        `INSERT INTO holds(event_id, seat_id, user_id, expires_at)
         VALUES ($1, $2, $3, now() + ($4 || ' seconds')::interval)
         RETURNING hold_id, expires_at, seat_id`,
        [eventId, seatId, userId, seconds]
      );

      holdIds.push(rows[0]);
    }

    await client.query("COMMIT");
    res.json({ holds: holdIds });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "One or more seats are already held or booked" });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/bookings/confirm { holdId, userId, price }
router.post("/confirm", async (req, res) => {
  const { holdId, userId, price } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const holdRes = await client.query(
      "SELECT * FROM holds WHERE hold_id=$1 FOR UPDATE",
      [holdId]
    );
    if (holdRes.rowCount === 0) throw new Error("Hold not found");

    const h = holdRes.rows[0];
    if (h.status !== "HELD" || h.expires_at <= new Date())
      throw new Error("Hold expired or invalid");
    const booked = await client.query(
      "SELECT 1 FROM bookings WHERE event_id=$1 AND seat_id=$2 AND status=$3",
      [h.event_id, h.seat_id, "CONFIRMED"]
    );
    if (booked.rowCount > 0) throw new Error("Seat already booked");
    const ins = await client.query(
      "INSERT INTO bookings(event_id, seat_id, user_id, price_paid) VALUES($1,$2,$3,$4) RETURNING booking_id",
      [h.event_id, h.seat_id, userId, price]
    );
    await client.query("UPDATE holds SET status=$1 WHERE hold_id=$2", [
      "RELEASED",
      holdId,
    ]);
    await client.query("COMMIT");
    res.json({ bookingId: ins.rows[0].booking_id });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(409).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/bookings/confirm-multiple { holdIds: [], userId }
router.post("/confirm-multiple", async (req, res) => {
  const { holdIds, userId } = req.body;

  if (!Array.isArray(holdIds) || holdIds.length === 0) {
    return res.status(400).json({ error: "holdIds must be a non-empty array" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookingIds = [];

    for (const holdId of holdIds) {
      const holdRes = await client.query(
        "SELECT * FROM holds WHERE hold_id=$1 FOR UPDATE",
        [holdId]
      );
      if (holdRes.rowCount === 0) throw new Error(`Hold ${holdId} not found`);

      const h = holdRes.rows[0];
      if (h.status !== "HELD" || h.expires_at <= new Date())
        throw new Error(`Hold ${holdId} expired or invalid`);

      const booked = await client.query(
        "SELECT 1 FROM bookings WHERE event_id=$1 AND seat_id=$2 AND status=$3",
        [h.event_id, h.seat_id, "CONFIRMED"]
      );
      if (booked.rowCount > 0)
        throw new Error(`Seat ${h.seat_id} already booked`);

      // Get the seat price
      const priceRes = await client.query(
        `SELECT COALESCE(
          (SELECT sp2.price FROM seat_prices sp2 WHERE sp2.event_id = $1 AND sp2.seat_id = $2 LIMIT 1),
          (SELECT sp3.price FROM seat_prices sp3 
           JOIN seats s ON s.section_id = sp3.section_id 
           WHERE sp3.event_id = $1 AND s.seat_id = $2 LIMIT 1)
        ) AS price`,
        [h.event_id, h.seat_id]
      );

      const price = priceRes.rows[0]?.price || 0;

      const ins = await client.query(
        "INSERT INTO bookings(event_id, seat_id, user_id, price_paid) VALUES($1,$2,$3,$4) RETURNING booking_id",
        [h.event_id, h.seat_id, userId, price]
      );

      await client.query("UPDATE holds SET status=$1 WHERE hold_id=$2", [
        "RELEASED",
        holdId,
      ]);

      bookingIds.push({
        bookingId: ins.rows[0].booking_id,
        seatId: h.seat_id,
        price,
      });
    }

    await client.query("COMMIT");
    res.json({ bookings: bookingIds });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(409).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
