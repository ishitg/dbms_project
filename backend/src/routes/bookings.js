import express from 'express';
import { pool } from '../db.js';
const router = express.Router();
// POST /api/bookings/hold { eventId, seatId, userId, seconds? }
router.post('/hold', async (req, res) => {
const { eventId, seatId, userId, seconds = 600 } = req.body;
try {
const q = `INSERT INTO holds(event_id, seat_id, user_id, expires_at)
 VALUES ($1,$2,$3, now() + ($4 || ' seconds')::interval)
 RETURNING hold_id, expires_at`;
const { rows } = await pool.query(q, [eventId, seatId, userId, seconds]);
res.json(rows[0]);
} catch (err) {
if (err.code === '23505') return res.status(409).json({ error:
'Seat already held or booked' });
res.status(500).json({ error: err.message });
}
});
// POST /api/bookings/confirm { holdId, userId, price }
router.post('/confirm', async (req, res) => {
const { holdId, userId, price } = req.body;
const client = await pool.connect();
try {
await client.query('BEGIN');
const holdRes = await
client.query('SELECT * FROM holds WHERE hold_id=$1 FOR UPDATE', [holdId]);
if (holdRes.rowCount === 0) throw new Error('Hold not found');

const h = holdRes.rows[0];
if (h.status !== 'HELD' || h.expires_at <= new Date()) throw new
Error('Hold expired or invalid');
const booked = await client.query(
'SELECT 1 FROM bookings WHERE event_id=$1 AND seat_id=$2 AND status=$3',
[h.event_id, h.seat_id, 'CONFIRMED']
);
if (booked.rowCount > 0) throw new Error('Seat already booked');
const ins = await client.query(
'INSERT INTO bookings(event_id, seat_id, user_id, price_paid) VALUES($1,$2,$3,$4) RETURNING booking_id',
[h.event_id, h.seat_id, userId, price]
);
await client.query('UPDATE holds SET status=$1 WHERE hold_id=$2',
['RELEASED', holdId]);
await client.query('COMMIT');
res.json({ bookingId: ins.rows[0].booking_id });
} catch (err) {
await client.query('ROLLBACK');
res.status(409).json({ error: err.message });
} finally {
client.release();
}
});
export default router;