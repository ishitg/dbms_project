import React from "react";
import API from "../api";
import "./Checkout.css";

export default function Checkout({ holds, onConfirm }) {
  const confirm = async () => {
    try {
      if (!holds || holds.length === 0) {
        alert("No seats held");
        return;
      }

      const holdIds = holds.map((h) => h.hold_id);
      const res = await API.post("/bookings/confirm-multiple", {
        holdIds,
        userId: 1,
      });

      const totalPrice = res.data.bookings.reduce(
        (sum, b) => sum + parseFloat(b.price),
        0
      );
      alert(
        `${res.data.bookings.length} Booking(s) Confirmed!\nTotal Price: ₹${totalPrice.toFixed(2)}`
      );

      // Clear the holds after successful confirmation
      if (onConfirm) {
        onConfirm();
      }
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  const totalSeats = holds?.length || 0;

  return (
    <div className="checkout-container">
      <h3>🎫 Checkout Summary</h3>

      {totalSeats > 0 ? (
        <div className="checkout-details">
          <div className="checkout-info">
            <div className="info-row">
              <span className="info-label">Seats Held:</span>
              <span className="info-value">{totalSeats}</span>
            </div>
            <div className="held-seats-list">
              {holds.map((hold, idx) => (
                <div key={hold.hold_id} className="held-seat-badge">
                  Seat {idx + 1}
                </div>
              ))}
            </div>
          </div>

          <button onClick={confirm} className="confirm-btn">
            <span className="btn-icon">✓</span>
            Confirm {totalSeats} Booking{totalSeats !== 1 ? "s" : ""}
          </button>
        </div>
      ) : (
        <div className="no-selection">
          <p>No seats selected yet</p>
          <p className="hint">Select seats from the map above to continue</p>
        </div>
      )}
    </div>
  );
}
