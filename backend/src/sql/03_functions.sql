-- 03_functions.sql
-- Create a hold (optimistic insert). If seat already held/booking exists,
-- unique constraint/logic will fail.
CREATE OR REPLACE FUNCTION create_hold(p_event_id INT, p_seat_id INT, p_user_id
INT, p_seconds INT DEFAULT 600)
RETURNS UUID AS $$
DECLARE v_hold UUID;
BEGIN
-- Prevent hold if already booked
IF EXISTS (
SELECT 1 FROM bookings
WHERE event_id = p_event_id AND seat_id = p_seat_id AND status='CONFIRMED'
) THEN
RAISE EXCEPTION 'Seat already booked';
END IF;
BEGIN
INSERT INTO holds(event_id, seat_id, user_id, expires_at)
VALUES (p_event_id, p_seat_id, p_user_id, now() + (p_seconds || '
seconds')::interval)
RETURNING hold_id INTO v_hold;
RETURN v_hold;
EXCEPTION WHEN unique_violation THEN
RAISE EXCEPTION 'Seat already held';
END;
END;
$$ LANGUAGE plpgsql;
-- Confirm a booking atomically
CREATE OR REPLACE FUNCTION confirm_booking(p_hold_id UUID, p_user_id INT,
p_price NUMERIC)
RETURNS UUID AS $$
DECLARE v_hold RECORD; v_bid UUID;

BEGIN
SELECT * INTO v_hold FROM holds WHERE hold_id = p_hold_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Hold not found'; END IF;
IF v_hold.status <> 'HELD' OR v_hold.expires_at <= now() THEN
RAISE EXCEPTION 'Hold expired or invalid';
END IF;
IF EXISTS (
SELECT 1 FROM bookings WHERE event_id = v_hold.event_id AND seat_id =
v_hold.seat_id AND status='CONFIRMED'
) THEN
RAISE EXCEPTION 'Seat already booked';
END IF;
INSERT INTO bookings(event_id, seat_id, user_id, price_paid)
VALUES (v_hold.event_id, v_hold.seat_id, p_user_id, p_price)
RETURNING booking_id INTO v_bid;
UPDATE holds SET status = 'RELEASED' WHERE hold_id = p_hold_id;
RETURN v_bid;
END;
$$ LANGUAGE plpgsql;
-- Helper: expire all passed holds (run manually or via cron/pg_cron)
CREATE OR REPLACE FUNCTION expire_holds()
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
UPDATE holds SET status='EXPIRED'
WHERE status='HELD' AND expires_at <= now();
GET DIAGNOSTICS v_count = ROW_COUNT;
RETURN v_count;
END;
$$ LANGUAGE plpgsql;