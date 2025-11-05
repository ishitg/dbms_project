# 🎭 TicketHub - Complete Feature Overview

## ✨ What Has Been Implemented

### 🎨 Frontend (Beautiful & Intuitive UI)

#### 1. **Home Page - Events List** (`EventsList.jsx`)

- **Modern Card Design**: Each event displayed in a beautiful gradient card
- **Real-time Availability**: Shows total seats, booked seats, and available percentage
- **Color-coded Status**: Green (>50% available), Orange (20-50%), Red (<20%)
- **Progress Bars**: Visual representation of seat availability
- **Event Information**: Date, time, venue, and address prominently displayed
- **Hover Effects**: Cards lift and glow on hover for better interaction
- **Responsive Grid**: Adapts to all screen sizes

#### 2. **Event Details Page** (`EventDetails.jsx`)

- **Hero Section**: Large gradient header with event title and details
- **Section Selector**: Visual cards for each venue section with:
  - Availability count
  - Price range display
  - Mini progress bars
  - Interactive selection
- **Dynamic Loading**: Sections load based on the selected event
- **Breadcrumb Navigation**: Easy back navigation to events list

#### 3. **Interactive Seat Map** (`SeatMap.jsx`)

- **Visual Seat Layout**:
  - Organized by rows (A, B, C, etc.)
  - Row labels on the left
  - Stage indicator at the top
  - Color-coded seats (Available=Green, Selected=Blue, Held=Orange, Booked=Gray)
- **Multi-seat Selection**: Click to select/deselect multiple seats
- **Interactive Legend**: Shows what each color means
- **Seat Details**: Hover to see seat number, status, and price
- **Countdown Timer**:
  - Appears when seats are held
  - Shows MM:SS remaining
  - Pulsing animation for urgency
  - Auto-refreshes when expired
- **Bulk Operations**: Hold multiple seats at once
- **Auto-refresh**: Seat status updates every 5 seconds
- **Selection Controls**: Clear selection button for convenience

#### 4. **Checkout Component** (`Checkout.jsx`)

- **Summary Display**: Shows number of seats held
- **Held Seats Badges**: Visual representation of each selected seat
- **Dynamic Pricing**: Calculates total price from backend
- **Confirm Button**: Large, prominent button with icon
- **Empty State**: Helpful message when no seats selected
- **Success Feedback**: Alert showing booking confirmation and total price

#### 5. **My Bookings Page** (`UserBookings.jsx`)

- **Booking History**: All user's confirmed tickets
- **Detailed Cards**: Each booking shows:
  - Event title and price
  - Venue and address
  - Event date and time
  - Seat details (section, row, seat number)
  - Booking date
  - Booking ID (for reference)
- **Status Badges**: Visual confirmation status
- **Empty State**: Friendly message with call-to-action
- **Responsive Design**: Works perfectly on mobile

#### 6. **Navigation Bar** (`Navigation.jsx`)

- **Sticky Header**: Stays visible while scrolling
- **Logo**: TicketHub branding with emoji
- **Active State**: Highlights current page
- **Smooth Transitions**: Animated hover effects
- **Mobile Friendly**: Collapses nicely on small screens

### 🎨 Design System

#### Color Scheme

- **Primary Gradient**: Purple to blue (`#667eea` to `#764ba2`)
- **Success Green**: `#10b981` (available seats, confirm buttons)
- **Warning Orange**: `#f59e0b` (held seats)
- **Error Red**: `#ef4444` (countdown timer, unavailable)
- **Neutral Grays**: Various shades for text and backgrounds

#### Typography

- **Modern Sans-serif**: System fonts for native feel
- **Clear Hierarchy**: Different sizes and weights
- **Readable**: Good contrast and spacing

#### Animations

- **Fade In/Out**: Smooth element appearances
- **Slide Animations**: Cards and modals
- **Hover Effects**: Scale, shadow, and color transitions
- **Pulse Effect**: For countdown timer
- **Smooth Scrolling**: Better user experience

#### Responsive Breakpoints

- **Desktop**: >1024px (multi-column layouts)
- **Tablet**: 768-1024px (adjusted grids)
- **Mobile**: <768px (single column, stacked)

---

### 🔧 Backend (Advanced DBMS Features)

#### 1. **Database Schema** (`01_schema.sql`)

**Tables:**

- `venues` - Venue information
- `sections` - Sections within venues
- `seats` - Individual seats with unique row+number
- `events` - Event details with timestamps
- `seat_prices` - Flexible pricing (section or seat level)
- `holds` - Temporary seat reservations with expiration
- `bookings` - Confirmed ticket purchases

**Advanced Features:**

- ✅ UUID primary keys for holds and bookings
- ✅ Composite unique constraints
- ✅ Cascading deletes for referential integrity
- ✅ Check constraints for data validation
- ✅ ENUM types for status fields
- ✅ Timestamp fields with defaults

**Indexes:**

```sql
-- Composite indexes
idx_holds_event_expires ON holds(event_id, expires_at)
idx_bookings_event_seat ON bookings(event_id, seat_id)

-- Partial indexes (with WHERE clause)
WHERE status='HELD'
WHERE status='CONFIRMED'
```

#### 2. **PL/pgSQL Functions** (`03_functions.sql`)

**`create_hold()`**

- Atomically creates a seat hold
- Prevents holds on already booked seats
- Handles unique constraint violations
- Returns hold UUID

**`confirm_booking()`**

- Converts hold to confirmed booking
- Validates hold expiration
- Checks for concurrent bookings
- Atomic transaction (all or nothing)

**`expire_holds()`**

- Batch expires old holds
- Returns count of expired holds
- Can be run via cron job

#### 3. **API Endpoints**

**Events API** (`routes/events.js`)

```javascript
GET /api/events
// Returns all events with:
// - Venue information
// - Total seats count
// - Booked seats count
// - Availability calculation

GET /api/events/:id
// Returns single event with:
// - Event details
// - All sections with availability
// - Price ranges per section
```

**Venues API** (`routes/venues.js`)

```javascript
GET /api/venues
// List all venues

GET /api/venues/:id/sections
// Get all sections for a venue
```

**Seats API** (`routes/seats.js`)

```javascript
GET /api/seats/:eventId/section/:sectionId
// Returns seats with:
// - Real-time status (AVAILABLE, HELD, BOOKED)
// - Price information
// - Row and seat number
// - Joins with bookings and holds tables
```

**Bookings API** (`routes/bookings.js`)

```javascript
GET /api/bookings/user/:userId
// User's booking history with all details

POST /api/bookings/hold
// Hold a single seat

POST /api/bookings/hold-multiple
// Hold multiple seats atomically
// Transaction ensures all succeed or all fail

POST /api/bookings/confirm
// Confirm a single booking

POST /api/bookings/confirm-multiple
// Confirm multiple bookings atomically
// Calculates prices from database
// Returns total price
```

#### 4. **Advanced DBMS Concepts Used**

**1. Optimistic Locking**

```sql
CONSTRAINT unique_hold UNIQUE(event_id, seat_id)
CONSTRAINT unique_booking UNIQUE(event_id, seat_id)
```

- Prevents double bookings at database level
- No seat can have multiple active holds
- No seat can have multiple confirmed bookings

**2. Transaction Management**

```javascript
await client.query("BEGIN");
// ... multiple operations ...
await client.query("COMMIT");
// OR
await client.query("ROLLBACK");
```

- ACID compliance
- Atomic multi-seat booking
- Rollback on any failure

**3. Time-based Expiration**

```sql
expires_at TIMESTAMP NOT NULL
WHERE status='HELD' AND expires_at > now()
```

- Automatic cleanup based on time
- No manual intervention needed
- Clean expired holds before new ones

**4. Complex Joins**

```sql
LEFT JOIN bookings b ON b.seat_id = s.seat_id
  AND b.event_id = $1
  AND b.status='CONFIRMED'
LEFT JOIN holds h ON h.seat_id = s.seat_id
  AND h.event_id = $1
  AND h.status='HELD'
  AND h.expires_at > now()
```

**5. Aggregations**

```sql
COUNT(DISTINCT s.seat_id) AS total_seats
COUNT(DISTINCT b.booking_id) AS booked_seats
MIN(sp.price) AS min_price
MAX(sp.price) AS max_price
GROUP BY e.event_id, v.venue_id
```

**6. Subqueries**

```sql
COALESCE(
  (SELECT sp2.price FROM seat_prices sp2
   WHERE sp2.event_id = $1 AND sp2.seat_id = s.seat_id LIMIT 1),
  (SELECT sp3.price FROM seat_prices sp3
   WHERE sp3.event_id = $1 AND sp3.section_id = s.section_id LIMIT 1)
) AS price
```

**7. CASE Expressions**

```sql
CASE
  WHEN b.booking_id IS NOT NULL THEN 'BOOKED'
  WHEN h.hold_id IS NOT NULL AND h.expires_at > now() THEN 'HELD'
  ELSE 'AVAILABLE'
END AS status
```

**8. FOR UPDATE (Row Locking)**

```sql
SELECT * FROM holds WHERE hold_id = $1 FOR UPDATE
```

- Prevents concurrent modifications
- Pessimistic locking during confirmation

---

## 🎯 User Flow

### Booking Flow

1. **Browse Events** → See all available events
2. **Select Event** → View event details and sections
3. **Choose Section** → See section pricing and availability
4. **Select Seats** → Visual seat selection from interactive map
5. **Hold Seats** → Seats held for 10 minutes with countdown
6. **Confirm Booking** → Complete purchase and get confirmation
7. **View Tickets** → Access booking details anytime

### Features Demonstrated

- ✅ Multi-seat selection and booking
- ✅ Real-time availability updates
- ✅ Countdown timer for held seats
- ✅ Automatic hold expiration
- ✅ Price calculation and display
- ✅ Booking history
- ✅ Responsive design
- ✅ Error handling
- ✅ Success feedback

---

## 📊 Sample Data Included

### Venues (3)

1. **Grand Hall** - Downtown City
2. **Arena Stadium** - Metro City
3. **Concert Pavilion** - Westside

### Events (6)

1. Rock Concert 2025 (Grand Hall)
2. Classical Symphony Night (Grand Hall)
3. Basketball Championship (Arena Stadium)
4. International Football Match (Arena Stadium)
5. Jazz & Blues Festival (Concert Pavilion)
6. EDM Music Festival (Concert Pavilion)

### Sections (9)

- Orchestra, Balcony, VIP Box (Grand Hall)
- Lower Bowl, Upper Bowl, Premium Seats (Arena)
- General Admission, Reserved Seating, VIP Lounge (Pavilion)

### Total Seats: 500+

- Various row configurations
- Different seat types (Regular, Premium, VIP)
- Realistic pricing ($350 - $1800)

---

## 🚀 Quick Start

### 1. Database Setup

```bash
cd backend
# Windows:
setup_db.bat
# Linux/Mac:
./setup_db.sh
```

### 2. Start Backend

```bash
cd backend
npm install
npm start
# Runs on http://localhost:4000
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Open Browser

Navigate to `http://localhost:5173` and start booking!

---

## 🎓 Learning Outcomes

This project demonstrates:

- ✅ Full-stack development
- ✅ Advanced SQL and database design
- ✅ Transaction management
- ✅ RESTful API design
- ✅ Modern React patterns
- ✅ Responsive UI/UX
- ✅ Real-time updates
- ✅ Error handling
- ✅ State management
- ✅ Component architecture

---

## 🎉 Conclusion

This is a **production-ready** event ticketing system with:

- Beautiful, intuitive interface
- Advanced database concepts
- Robust error handling
- Real-time updates
- Mobile responsiveness
- Comprehensive documentation

Perfect for demonstrating DBMS skills and full-stack development capabilities!
