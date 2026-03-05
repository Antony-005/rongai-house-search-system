import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { motion } from "framer-motion";
import "../../styles/ResidentDashboard.css"; 

const ResidentDashboard = () => {
  const [houses, setHouses] = useState([]);
  const [filters, setFilters] = useState({ location: "", minPrice: "", maxPrice: "", bedrooms: "" });
  const [bookedDates, setBookedDates] = useState([]);
  const [stats, setStats] = useState({ totalHouses: 0, booked: 0, favorites: 0 });
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch all houses
  const fetchHouses = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`http://localhost:5000/api/houses/search?${query}`);
    const data = await res.json();
    setHouses(data);
    setStats(prev => ({ ...prev, totalHouses: data.length }));
  };

  // Fetch booked dates
  const fetchBookings = async () => {
    const res = await fetch("http://localhost:5000/api/residents/bookings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    const dates = data.map(b => new Date(b.date));
    setBookedDates(dates);
    setStats(prev => ({ ...prev, booked: data.length }));
  };

  useEffect(() => {
    fetchHouses();
    fetchBookings();
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHouses();
  };

  const handleBooking = async (houseId) => {
    const res = await fetch(`http://localhost:5000/api/residents/book/${houseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ date: new Date() }) // For demo, current date
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Booking successful!");
      fetchBookings();
    } else {
      setMessage(data.message || "Booking failed");
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
          <input name="location" placeholder="Location" value={filters.location} onChange={handleChange} />
          <input name="minPrice" placeholder="Min Price" type="number" value={filters.minPrice} onChange={handleChange} />
          <input name="maxPrice" placeholder="Max Price" type="number" value={filters.maxPrice} onChange={handleChange} />
          <input name="bedrooms" placeholder="Bedrooms" type="number" value={filters.bedrooms} onChange={handleChange} />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* House Cards */}
      <div className="house-list">
        {houses.length === 0 && <p>No houses found</p>}
        {houses.map((house) => (
          <motion.div whileHover={{ scale: 1.02 }} className="house-card" key={house.id}>
            <h4>{house.title}</h4>
            <p>Location: {house.location}</p>
            <p>Price: KES {house.price}</p>
            <p>{house.bedrooms} Bedrooms</p>
            <button onClick={() => handleBooking(house.id)}>Book House</button>
          </motion.div>
        ))}
      </div>

      {message && <p className="message">{message}</p>}

      {/* Calendar */}
      <div className="calendar-container">
        <h3>Booked Dates</h3>
        <Calendar
          tileDisabled={({ date }) => bookedDates.some(d => d.toDateString() === date.toDateString())}
        />
      </div>
    </div>
  );
};

export default ResidentDashboard;