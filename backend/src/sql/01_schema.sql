-- 01_schema.sql
-- Enable UUID support (use one of the two extensions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- provides gen_random_uuid()
-- If pgcrypto isn't allowed on your server, uncomment the next line and use
-- uuid_generate_v4()
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== Core entities =====
CREATE TABLE venues (
venue_id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
address TEXT
);
CREATE TABLE sections (
section_id SERIAL PRIMARY KEY,
venue_id INT NOT NULL REFERENCES venues(venue_id) ON DELETE CASCADE,
name TEXT NOT NULL
);
CREATE TABLE seats (
seat_id SERIAL PRIMARY KEY,
section_id INT NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
row_label TEXT NOT NULL,
seat_number INT NOT NULL,
seat_type TEXT,
UNIQUE(section_id, row_label, seat_number)
);
CREATE TABLE events (
event_id SERIAL PRIMARY KEY,
venue_id INT NOT NULL REFERENCES venues(venue_id) ON DELETE CASCADE,
title TEXT NOT NULL,
start_ts TIMESTAMP NOT NULL,
end_ts TIMESTAMP,
created_at TIMESTAMP DEFAULT now()
);
-- Price can be set at section level and optionally overridden at seat level
CREATE TABLE seat_prices (
seat_price_id SERIAL PRIMARY KEY,
event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
section_id INT REFERENCES sections(section_id),
seat_id INT REFERENCES seats(seat_id),
price NUMERIC(10,2) NOT NULL,
CHECK (seat_id IS NOT NULL OR section_id IS NOT NULL)
);
-- Holds & Bookings
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hold_status') THEN
CREATE TYPE hold_status AS ENUM ('HELD','EXPIRED','RELEASED');
END IF;
END $$;

CREATE TABLE holds (
hold_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- or uuid_generate_v4()
event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
seat_id INT NOT NULL REFERENCES seats(seat_id) ON DELETE CASCADE,
user_id INT,
status hold_status NOT NULL DEFAULT 'HELD',
hold_ts TIMESTAMP DEFAULT now(),
expires_at TIMESTAMP NOT NULL,
-- Optimistic locking: at most one active hold per event-seat
CONSTRAINT unique_hold UNIQUE(event_id, seat_id)
);
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
CREATE TYPE booking_status AS ENUM ('CONFIRMED','CANCELLED','REFUNDED');
END IF;
END $$;
CREATE TABLE bookings (
booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
seat_id INT NOT NULL REFERENCES seats(seat_id) ON DELETE CASCADE,
user_id INT,
price_paid NUMERIC(10,2) NOT NULL,
booked_at TIMESTAMP DEFAULT now(),
status booking_status NOT NULL DEFAULT 'CONFIRMED',
CONSTRAINT unique_booking UNIQUE(event_id, seat_id)
);
-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_seats_section ON seats(section_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_holds_event_expires ON holds(event_id,
expires_at) WHERE status='HELD';
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_seat ON bookings(event_id,
seat_id) WHERE status='CONFIRMED';
CREATE INDEX IF NOT EXISTS idx_holds_event_seat ON holds(event_id, seat_id)
WHERE status='HELD';
