import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🎭 TicketHub
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <span className="nav-icon">🎪</span>
            Events
          </Link>
          <Link
            to="/my-bookings"
            className={`nav-link ${location.pathname === "/my-bookings" ? "active" : ""}`}
          >
            <span className="nav-icon">🎫</span>
            My Bookings
          </Link>
        </div>
      </div>
    </nav>
  );
}
