import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { motion } from "framer-motion";
import "../../styles/ResidentDashboard.css";

const ResidentDashboard = () => {
  const [houses, setHouses] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [stats, setStats] = useState({ totalHouses: 0, booked: 0, favorites: 0 });
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // Fetch all houses safely
  const fetchHouses = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`http://localhost:5000/api/houses/search?${query}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setHouses(data);
        setStats(prev => ({ ...prev, totalHouses: data.length }));
      } else {
        setHouses([]);
        setStats(prev => ({ ...prev, totalHouses: 0 }));
        setError(data.message || "Unexpected response from server");
        console.error("Unexpected response from API:", data);
      }
    } catch (err) {
      console.error("Fetch houses failed:", err);
      setHouses([]);
      setStats(prev => ({ ...prev, totalHouses: 0 }));
      setError("Unable to fetch houses. Please try again later.");
    }
  };

  // Fetch booked dates safely
  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/residents/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        const dates = data.map(b => new Date(b.date));
        setBookedDates(dates);
        setStats(prev => ({ ...prev, booked: data.length }));
      } else {
        setBookedDates([]);
        setStats(prev => ({ ...prev, booked: 0 }));
        console.error("Unexpected booking data:", data);
      }
    } catch (err) {
      console.error("Fetch bookings failed:", err);
      setBookedDates([]);
      setStats(prev => ({ ...prev, booked: 0 }));
    }
  };

  useEffect(() => {
    fetchHouses();
    fetchBookings();
  }, []);

  const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = e => {
    e.preventDefault();
    fetchHouses();
  };

  const handleBooking = async houseId => {
    try {
      const res = await fetch(`http://localhost:5000/api/residents/book/${houseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ date: new Date() }), // For demo
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Booking successful!");
        fetchBookings();
      } else {
        setMessage(data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setMessage("Booking failed due to server error");
    }
  };

  return (
    <div className="resident-dashboard">
      <h2>Resident Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats-cards">
        <motion.div whileHover={{ scale: 1.05 }} className="card">
          <h3>Total Houses</h3>
          <p>{stats.totalHouses}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="card">
          <h3>Booked Houses</h3>
          <p>{stats.booked}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="card">
          <h3>Favorites</h3>
          <p>{stats.favorites}</p>
        </motion.div>
      </div>

      {/* House Search */}
      <div className="house-search">
        <form onSubmit={handleSearch} className="search-form">
          <input
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={handleChange}
          />
          <input
            name="minPrice"
            placeholder="Min Price"
            type="number"
            value={filters.minPrice}
            onChange={handleChange}
          />
          <input
            name="maxPrice"
            placeholder="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={handleChange}
          />
          <input
            name="bedrooms"
            placeholder="Bedrooms"
            type="number"
            value={filters.bedrooms}
            onChange={handleChange}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* House Cards */}
      <div className="house-list">
        {!Array.isArray(houses) || houses.length === 0 ? (
          <p>No houses found</p>
        ) : (
          houses.map(house => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="house-card"
              key={house.id}
            >
              <h4>{house.title}</h4>
              <p>Location: {house.location}</p>
              <p>Price: KES {house.price}</p>
              <p>{house.bedrooms} Bedrooms</p>
              <button onClick={() => handleBooking(house.id)}>Book House</button>
            </motion.div>
          ))
        )}
      </div>

      {message && <p className="message">{message}</p>}

      {/* Calendar */}
      <div className="calendar-container">
        <h3>Booked Dates</h3>
        <Calendar
          tileDisabled={({ date }) =>
            bookedDates.some(d => d.toDateString() === date.toDateString())
          }
        />
      </div>
    </div>
  );
};

export default ResidentDashboard;