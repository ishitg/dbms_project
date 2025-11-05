import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import EventsList from "./components/EventsList";
import EventDetails from "./components/EventDetails";
import UserBookings from "./components/UserBookings";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/my-bookings" element={<UserBookings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
