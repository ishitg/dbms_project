import React, { useEffect, useState, useCallback } from "react";
import API from "../api";
import "./SeatMap.css";

export default function SeatMap({ eventId, sectionId, onHold }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdExpiry, setHoldExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const load = useCallback(async () => {
    const res = await API.get(`/seats/${eventId}/section/${sectionId}`);
    setSeats(res.data);
  }, [eventId, sectionId]);

  useEffect(() => {
    load();
    // Refresh seat status every 5 seconds to show expired holds
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  // Countdown timer for held seats
  useEffect(() => {
    if (!holdExpiry) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(holdExpiry);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        setHoldExpiry(null);
        load(); // Refresh to show seats are available again
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiry, load]);

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const holdSelected = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    try {
      const res = await API.post("/bookings/hold-multiple", {
        eventId,
        seatIds: selectedSeats,
        userId: 1,
        seconds: 600,
      });
      alert(
        `${res.data.holds.length} seat(s) held! Expires: ${res.data.holds[0].expires_at}`
      );
      setHoldExpiry(res.data.holds[0].expires_at);
      onHold && onHold(res.data.holds);
      setSelectedSeats([]);
      load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
      load();
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) {
      acc[seat.row_label] = [];
    }
    acc[seat.row_label].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(seatsByRow).sort();

  return (
    <div className="seat-map-container">
      <div className="seat-map-header">
        <h3>🎭 Select Your Seats</h3>
        {timeRemaining && (
          <div className="countdown-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">Time Remaining: </span>
            <span className="timer-value">{timeRemaining}</span>
          </div>
        )}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box held"></div>
          <span>Held</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Booked</span>
        </div>
      </div>

      <div className="selection-controls">
        <button
          onClick={holdSelected}
          disabled={selectedSeats.length === 0}
          className="hold-btn"
        >
          Hold {selectedSeats.length} Selected Seat(s)
        </button>
        {selectedSeats.length > 0 && (
          <button onClick={() => setSelectedSeats([])} className="clear-btn">
            Clear Selection
          </button>
        )}
      </div>

      <div className="stage">STAGE</div>

      <div className="seats-area">
        {rows.map((rowLabel) => (
          <div key={rowLabel} className="seat-row">
            <div className="row-label">{rowLabel}</div>
            <div className="row-seats">
              {seatsByRow[rowLabel].map((s) => {
                const isSelected = selectedSeats.includes(s.seat_id);
                const isAvailable = s.status === "AVAILABLE";

                return (
                  <button
                    key={s.seat_id}
                    onClick={() =>
                      isAvailable && toggleSeatSelection(s.seat_id)
                    }
                    disabled={!isAvailable}
                    className={`seat ${s.status.toLowerCase()} ${isSelected ? "selected" : ""}`}
                    title={`${rowLabel}${s.seat_number} - ${s.status} ${s.price ? `- ₹${s.price}` : ""}`}
                  >
                    <div className="seat-number">{s.seat_number}</div>
                    {s.price && <div className="seat-price">₹{s.price}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
