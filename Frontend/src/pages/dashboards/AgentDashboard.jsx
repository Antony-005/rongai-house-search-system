import { useEffect, useState } from "react";

const AgentDashboard = () => {
  const [houses, setHouses] = useState([]);
  const [bookings, setBookings] = useState([]);

  const fetchHouses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/agent/houses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setHouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/agent/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHouses();
    fetchBookings();
  }, []);

  return (
    <div className="agent-dashboard">
      <h2>Agent Dashboard</h2>

      <h3>Your Houses</h3>
      <div>
        {houses.length === 0 ? (
          <p>No houses assigned</p>
        ) : (
          houses.map(h => (
            <div key={h.id}>
              <h4>{h.title}</h4>
              <p>Location: {h.location}</p>
              <p>Price: KES {h.price}</p>
            </div>
          ))
        )}
      </div>

      <h3>Bookings</h3>
      <div>
        {bookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          bookings.map(b => (
            <div key={b.id}>
              <p>House: {b.house_title}</p>
              <p>Resident: {b.resident_name}</p>
              <p>Date: {new Date(b.booking_date).toLocaleString()}</p>
              <p>Status: {b.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;