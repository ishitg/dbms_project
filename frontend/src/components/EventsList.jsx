import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./EventsList.css";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error loading events:", err);
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

  const getAvailabilityPercent = (event) => {
    const total = parseInt(event.total_seats) || 0;
    const booked = parseInt(event.booked_seats) || 0;
    const available = total - booked;
    return total > 0 ? Math.round((available / total) * 100) : 0;
  };

  const getAvailabilityColor = (percent) => {
    if (percent > 50) return "#10b981";
    if (percent > 20) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      <header className="events-header">
        <h1>🎭 Upcoming Events</h1>
        <p className="subtitle">
          Book your tickets now for the best entertainment!
        </p>
      </header>

      <div className="events-grid">
        {events.map((event) => {
          const availPercent = getAvailabilityPercent(event);
          const availColor = getAvailabilityColor(availPercent);

          return (
            <div
              key={event.event_id}
              className="event-card"
              onClick={() => navigate(`/event/${event.event_id}`)}
            >
              <div className="event-card-header">
                <div className="event-date">
                  <div className="date-day">
                    {new Date(event.start_ts).getDate()}
                  </div>
                  <div className="date-month">
                    {new Date(event.start_ts).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="event-info">
                  <h2 className="event-title">{event.title}</h2>
                  <p className="event-venue">📍 {event.venue_name}</p>
                  <p className="event-address">{event.venue_address}</p>
                </div>
              </div>

              <div className="event-card-body">
                <div className="event-time">
                  <span className="time-icon">🕐</span>
                  {formatDate(event.start_ts)}
                </div>

                <div className="event-stats">
                  <div className="stat">
                    <span className="stat-label">Total Seats</span>
                    <span className="stat-value">{event.total_seats}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Available</span>
                    <span className="stat-value" style={{ color: availColor }}>
                      {parseInt(event.total_seats) -
                        parseInt(event.booked_seats)}
                    </span>
                  </div>
                </div>

                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{
                      width: `${availPercent}%`,
                      backgroundColor: availColor,
                    }}
                  ></div>
                </div>
                <p className="availability-text">{availPercent}% Available</p>
              </div>

              <button className="book-now-btn">Book Tickets →</button>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="no-events">
          <p>No events available at the moment.</p>
          <p>Check back later!</p>
        </div>
      )}
    </div>
  );
}
