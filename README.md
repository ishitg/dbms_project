# 🎭 TicketHub - Advanced Event Ticketing System

A full-stack event ticketing system with advanced DBMS concepts, built with React, Node.js, Express, and PostgreSQL.

## 🌟 Features

### Frontend Features

- ✨ **Beautiful Modern UI** with gradients, animations, and responsive design
- 🎪 **Event Browsing** - View all available events with real-time availability
- 🎯 **Interactive Seat Selection** - Visual seat map with multi-seat selection
- ⏱️ **Real-time Countdown Timer** - Shows time remaining for held seats
- 💺 **Section-based Pricing** - Different prices for different sections
- 🎫 **Booking Management** - View all your confirmed bookings
- 🔄 **Auto-refresh** - Seat status updates every 5 seconds
- 📱 **Mobile Responsive** - Works seamlessly on all devices

### Backend Features (Advanced DBMS Concepts)

- 🔒 **Optimistic Locking** - Prevent double bookings using unique constraints
- ⚡ **Transaction Management** - ACID-compliant booking confirmations
- ⏰ **Automatic Hold Expiration** - Time-based seat holds with cleanup
- 🎯 **Complex Queries** - Aggregations, joins, and subqueries
- 📊 **Efficient Indexing** - Optimized queries for seat availability
- 🔄 **Bulk Operations** - Hold and confirm multiple seats atomically
- 🎪 **Flexible Pricing** - Section-level and seat-level pricing support
- 📈 **Real-time Availability** - Dynamic seat status calculation

## 🏗️ Technology Stack

### Frontend

- **React 19** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Modern styling with gradients and animations

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **UUID** - Unique identifier generation

## 📁 Project Structure

```
dbms_project/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── db.js               # Database connection
│   │   ├── routes/
│   │   │   ├── events.js       # Event routes
│   │   │   ├── venues.js       # Venue routes
│   │   │   ├── seats.js        # Seat routes
│   │   │   └── bookings.js     # Booking routes
│   │   └── sql/
│   │       ├── 01_schema.sql        # Database schema
│   │       ├── 02_sample_data.sql   # Basic sample data
│   │       ├── 03_functions.sql     # PL/pgSQL functions
│   │       └── 04_enhanced_data.sql # Enhanced sample data
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EventsList.jsx      # Events listing page
    │   │   ├── EventDetails.jsx    # Event details & booking
    │   │   ├── SeatMap.jsx         # Interactive seat map
    │   │   ├── Checkout.jsx        # Booking confirmation
    │   │   ├── UserBookings.jsx    # User's bookings
    │   │   └── Navigation.jsx      # Navigation bar
    │   ├── App.jsx                 # Main app with routing
    │   ├── api.js                  # API client
    │   └── main.jsx                # App entry point
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:

```bash
createdb ticketing_db
```

2. Run the SQL scripts in order:

```bash
psql -d ticketing_db -f backend/src/sql/01_schema.sql
psql -d ticketing_db -f backend/src/sql/02_sample_data.sql
psql -d ticketing_db -f backend/src/sql/03_functions.sql
psql -d ticketing_db -f backend/src/sql/04_enhanced_data.sql
```

3. Update database connection in `backend/src/db.js`:

```javascript
const pool = new Pool({
  user: "your_username",
  host: "localhost",
  database: "ticketing_db",
  password: "your_password",
  port: 5432,
});
```

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

Backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎯 Usage Guide

### Browsing Events

1. Open the application in your browser
2. Browse through available events on the home page
3. See real-time availability and pricing for each event

### Booking Tickets

1. Click on an event to view details
2. Select a section (Orchestra, Balcony, VIP, etc.)
3. Click on available seats to select them (multiple selection supported)
4. Click "Hold X Selected Seat(s)" to reserve them
5. A countdown timer will show time remaining (10 minutes)
6. Click "Confirm Bookings" to complete the purchase

### Viewing Bookings

1. Click "My Bookings" in the navigation
2. View all your confirmed tickets with details
3. See event info, seat details, and booking dates

## 🔧 Advanced DBMS Concepts Implemented

### 1. Optimistic Locking

- Unique constraints on `(event_id, seat_id)` in holds and bookings tables
- Prevents concurrent double-booking attempts

### 2. Transaction Management

- BEGIN/COMMIT/ROLLBACK for atomic operations
- Multi-step booking process with rollback on failure

### 3. Time-based Hold System

- Automatic expiration using `expires_at` timestamps
- Cleanup of expired holds before new insertions

### 4. Complex Joins & Aggregations

```sql
SELECT e.*, COUNT(DISTINCT b.booking_id) AS booked_seats
FROM events e
LEFT JOIN bookings b ON b.event_id = e.event_id
GROUP BY e.event_id
```

### 5. Efficient Indexing

- Composite indexes on `(event_id, seat_id)`
- Partial indexes with WHERE clauses for active holds
- Index on `(event_id, expires_at)` for hold queries

### 6. PL/pgSQL Functions

- `create_hold()` - Atomically create a seat hold
- `confirm_booking()` - Convert hold to confirmed booking
- `expire_holds()` - Batch expire old holds

### 7. Cascading Deletes

- ON DELETE CASCADE for referential integrity
- Automatic cleanup when events/venues are deleted

### 8. Check Constraints

- Price validation in seat_prices
- Status enums for holds and bookings

## 📊 Database Schema Highlights

### Key Tables

- **venues** - Venue information
- **sections** - Sections within venues
- **seats** - Individual seats with row and number
- **events** - Event details and timing
- **seat_prices** - Flexible pricing (section or seat level)
- **holds** - Temporary seat reservations with expiration
- **bookings** - Confirmed ticket purchases

### Key Constraints

- Unique hold per event-seat combination
- Unique booking per event-seat combination
- Foreign key relationships with cascading
- Check constraints on prices and status values

## 🎨 UI/UX Features

- **Gradient Backgrounds** - Modern purple/blue gradient theme
- **Hover Effects** - Interactive cards with smooth transitions
- **Animations** - Fade-in effects and smooth transitions
- **Countdown Timer** - Pulsing animation for urgency
- **Color-coded Status** - Green (available), Blue (selected), Orange (held), Gray (booked)
- **Responsive Design** - Mobile-first approach with breakpoints
- **Stage Visualization** - Clear stage indicator in seat map
- **Legend** - Visual guide for seat statuses

## 🔒 Security Considerations

- Input validation on all API endpoints
- Transaction isolation for concurrent bookings
- Error handling with appropriate status codes
- Prevention of SQL injection through parameterized queries

## 🚀 Future Enhancements

- User authentication and authorization
- Payment gateway integration
- Email notifications for bookings
- QR code generation for tickets
- Admin dashboard for event management
- Analytics and reporting
- Seat type recommendations
- Price filtering and sorting

## 📝 API Endpoints

### Events

- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details

### Venues

- `GET /api/venues` - List all venues
- `GET /api/venues/:id/sections` - Get venue sections

### Seats

- `GET /api/seats/:eventId/section/:sectionId` - Get seats with availability

### Bookings

- `GET /api/bookings/user/:userId` - Get user's bookings
- `POST /api/bookings/hold` - Hold a single seat
- `POST /api/bookings/hold-multiple` - Hold multiple seats
- `POST /api/bookings/confirm` - Confirm a single booking
- `POST /api/bookings/confirm-multiple` - Confirm multiple bookings

## 👨‍💻 Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies and advanced database concepts.

---

**Happy Booking! 🎭🎫**
