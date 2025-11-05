import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import SeatMap from "./SeatMap";
import Checkout from "./Checkout";
import "./EventDetails.css";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEventDetails = async () => {
    try {
      const res = await API.get(`/events/${eventId}`);
      setEventData(res.data);
      if (res.data.sections.length > 0) {
        setSelectedSection(res.data.sections[0].section_id);
      }
    } catch (err) {
      console.error("Error loading event:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleConfirmBooking = () => {
    setHolds([]);
    loadEventDetails(); // Refresh to show updated availability
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="error-container">
        <h2>Event not found</h2>
        <button onClick={() => navigate("/")}>Back to Events</button>
      </div>
    );
  }

  const { event, sections } = eventData;

  return (
    <div className="event-details-container">
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Events
      </button>

      <div className="event-hero">
        <div className="event-hero-content">
          <h1 className="event-hero-title">{event.title}</h1>
          <div className="event-hero-info">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <strong>{event.venue_name}</strong>
                <p>{event.venue_address}</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🕐</span>
              <div>
                <strong>Event Date & Time</strong>
                <p>{formatDate(event.start_ts)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sections-selector">
        <h2>Select Section</h2>
        <div className="sections-grid">
          {sections.map((section) => {
            const available =
              parseInt(section.total_seats) - parseInt(section.booked_seats);
            const availPercent =
              section.total_seats > 0
                ? Math.round((available / section.total_seats) * 100)
                : 0;

            return (
              <div
                key={section.section_id}
                className={`section-card ${selectedSection === section.section_id ? "selected" : ""}`}
                onClick={() => setSelectedSection(section.section_id)}
              >
                <h3>{section.name}</h3>
                <div className="section-stats">
                  <div className="section-stat">
                    <span className="stat-label">Available</span>
                    <span className="stat-value">
                      {available}/{section.total_seats}
                    </span>
                  </div>
                  {section.min_price && (
                    <div className="section-stat">
                      <span className="stat-label">Price</span>
                      <span className="stat-value price">
                        ₹{section.min_price}
                        {section.max_price !== section.min_price &&
                          ` - ₹${section.max_price}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mini-availability-bar">
                  <div
                    className="mini-availability-fill"
                    style={{
                      width: `${availPercent}%`,
                      backgroundColor:
                        availPercent > 50
                          ? "#10b981"
                          : availPercent > 20
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSection && (
        <div className="seat-selection-area">
          <SeatMap
            eventId={parseInt(eventId)}
            sectionId={selectedSection}
            onHold={setHolds}
          />
        </div>
      )}

      <div className="checkout-area">
        <Checkout holds={holds} onConfirm={handleConfirmBooking} />
      </div>
    </div>
  );
}
