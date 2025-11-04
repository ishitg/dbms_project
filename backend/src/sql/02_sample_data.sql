-- 02_sample_data.sql
INSERT INTO venues(name, address) VALUES ('Grand Hall','Main Street, City');
INSERT INTO sections(venue_id, name) VALUES (1, 'Orchestra');

-- Create row A seats 1..10
INSERT INTO seats(section_id, row_label, seat_number, seat_type)
SELECT 1, 'A', generate_series(1,10), 'Regular';
INSERT INTO events(venue_id, title, start_ts, end_ts)
VALUES (1, 'Rock Concert', now() + interval '7 days', now() + interval '7 days'
+ interval '2 hours');
-- Default section price
INSERT INTO seat_prices(event_id, section_id, price) VALUES (1, 1, 500.00);