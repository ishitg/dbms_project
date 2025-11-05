import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./UserBookings.css";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = 1; // Hardcoded for now

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await API.get(`/bookings/user/${userId}`);
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Events
      </button>

      <header className="bookings-header">
        <h1>🎫 My Bookings</h1>
        <p className="subtitle">View all your confirmed tickets</p>
      </header>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">🎭</div>
          <h2>No bookings yet</h2>
          <p>Start booking tickets for exciting events!</p>
          <button onClick={() => navigate("/")} className="browse-btn">
            Browse Events
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <div className="booking-status">
                <span
                  className={`status-badge ${booking.status.toLowerCase()}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-header">
                <h2>{booking.event_title}</h2>
                <div className="booking-price">₹{booking.price_paid}</div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div>
                    <strong>{booking.venue_name}</strong>
                    <p>{booking.venue_address}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <div>
                    <strong>Event Date</strong>
                    <p>{formatDate(booking.event_start)}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💺</span>
                  <div>
                    <strong>Seat Details</strong>
                    <p>
                      Section: {booking.section_name} | Row: {booking.row_label}{" "}
                      | Seat: {booking.seat_number}
                    </p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div>
                    <strong>Booked On</strong>
                    <p>{formatDate(booking.booked_at)}</p>
                  </div>
                </div>
              </div>

              <div className="booking-id">Booking ID: {booking.booking_id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
