-- Enhanced sample data with multiple events and venues

-- Venues
INSERT INTO venues(name, address) VALUES 
  ('Grand Hall', 'Main Street, Downtown City'),
  ('Arena Stadium', '123 Sports Complex, Metro City'),
  ('Concert Pavilion', '456 Park Avenue, Westside')
ON CONFLICT DO NOTHING;

-- Sections for Grand Hall (venue_id = 1)
INSERT INTO sections(venue_id, name) VALUES 
  (1, 'Orchestra'),
  (1, 'Balcony'),
  (1, 'VIP Box')
ON CONFLICT DO NOTHING;

-- Sections for Arena Stadium (venue_id = 2)
INSERT INTO sections(venue_id, name) VALUES 
  (2, 'Lower Bowl'),
  (2, 'Upper Bowl'),
  (2, 'Premium Seats')
ON CONFLICT DO NOTHING;

-- Sections for Concert Pavilion (venue_id = 3)
INSERT INTO sections(venue_id, name) VALUES 
  (3, 'General Admission'),
  (3, 'Reserved Seating'),
  (3, 'VIP Lounge')
ON CONFLICT DO NOTHING;

-- Create seats for all sections
-- Orchestra (section_id = 1) - 3 rows, 10 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 1, row_letter, seat_num, 'Regular'
FROM (VALUES ('A'), ('B'), ('C')) AS rows(row_letter)
CROSS JOIN generate_series(1, 10) AS seat_num
ON CONFLICT DO NOTHING;

-- Balcony (section_id = 2) - 2 rows, 8 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 2, row_letter, seat_num, 'Regular'
FROM (VALUES ('A'), ('B')) AS rows(row_letter)
CROSS JOIN generate_series(1, 8) AS seat_num
ON CONFLICT DO NOTHING;

-- VIP Box (section_id = 3) - 1 row, 6 seats
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 3, 'A', generate_series(1, 6), 'VIP'
ON CONFLICT DO NOTHING;

-- Lower Bowl (section_id = 4) - 4 rows, 12 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 4, row_letter, seat_num, 'Regular'
FROM (VALUES ('A'), ('B'), ('C'), ('D')) AS rows(row_letter)
CROSS JOIN generate_series(1, 12) AS seat_num
ON CONFLICT DO NOTHING;

-- Upper Bowl (section_id = 5) - 3 rows, 10 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 5, row_letter, seat_num, 'Regular'
FROM (VALUES ('A'), ('B'), ('C')) AS rows(row_letter)
CROSS JOIN generate_series(1, 10) AS seat_num
ON CONFLICT DO NOTHING;

-- Premium Seats (section_id = 6) - 2 rows, 8 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 6, row_letter, seat_num, 'Premium'
FROM (VALUES ('A'), ('B')) AS rows(row_letter)
CROSS JOIN generate_series(1, 8) AS seat_num
ON CONFLICT DO NOTHING;

-- General Admission (section_id = 7) - 5 rows, 15 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 7, row_letter, seat_num, 'Regular'
FROM (VALUES ('A'), ('B'), ('C'), ('D'), ('E')) AS rows(row_letter)
CROSS JOIN generate_series(1, 15) AS seat_num
ON CONFLICT DO NOTHING;

-- Reserved Seating (section_id = 8) - 3 rows, 10 seats each
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 8, row_letter, seat_num, 'Regular'
FROM (VALUES ('A'), ('B'), ('C')) AS rows(row_letter)
CROSS JOIN generate_series(1, 10) AS seat_num
ON CONFLICT DO NOTHING;

-- VIP Lounge (section_id = 9) - 1 row, 8 seats
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 9, 'A', generate_series(1, 8), 'VIP'
ON CONFLICT DO NOTHING;

-- Events
INSERT INTO events(venue_id, title, start_ts, end_ts) VALUES
  (1, 'Rock Concert 2025', now() + interval '7 days', now() + interval '7 days' + interval '3 hours'),
  (1, 'Classical Symphony Night', now() + interval '14 days', now() + interval '14 days' + interval '2 hours'),
  (2, 'Basketball Championship', now() + interval '10 days', now() + interval '10 days' + interval '2.5 hours'),
  (2, 'International Football Match', now() + interval '21 days', now() + interval '21 days' + interval '2 hours'),
  (3, 'Jazz & Blues Festival', now() + interval '5 days', now() + interval '5 days' + interval '4 hours'),
  (3, 'EDM Music Festival', now() + interval '30 days', now() + interval '30 days' + interval '6 hours')
ON CONFLICT DO NOTHING;

-- Seat prices for events
-- Event 1: Rock Concert - Grand Hall
INSERT INTO seat_prices(event_id, section_id, price) VALUES
  (1, 1, 500.00),  -- Orchestra
  (1, 2, 350.00),  -- Balcony
  (1, 3, 1200.00)  -- VIP Box
ON CONFLICT DO NOTHING;

-- Event 2: Classical Symphony - Grand Hall
INSERT INTO seat_prices(event_id, section_id, price) VALUES
  (2, 1, 800.00),
  (2, 2, 600.00),
  (2, 3, 1500.00)
ON CONFLICT DO NOTHING;

-- Event 3: Basketball - Arena Stadium
INSERT INTO seat_prices(event_id, section_id, price) VALUES
  (3, 4, 750.00),  -- Lower Bowl
  (3, 5, 450.00),  -- Upper Bowl
  (3, 6, 1500.00)  -- Premium Seats
ON CONFLICT DO NOTHING;

-- Event 4: Football - Arena Stadium
INSERT INTO seat_prices(event_id, section_id, price) VALUES
  (4, 4, 900.00),
  (4, 5, 550.00),
  (4, 6, 1800.00)
ON CONFLICT DO NOTHING;

-- Event 5: Jazz Festival - Concert Pavilion
INSERT INTO seat_prices(event_id, section_id, price) VALUES
  (5, 7, 400.00),  -- General Admission
  (5, 8, 650.00),  -- Reserved Seating
  (5, 9, 1100.00)  -- VIP Lounge
ON CONFLICT DO NOTHING;

-- Event 6: EDM Festival - Concert Pavilion
INSERT INTO seat_prices(event_id, section_id, price) VALUES
  (6, 7, 600.00),
  (6, 8, 900.00),
  (6, 9, 1600.00)
ON CONFLICT DO NOTHING;
