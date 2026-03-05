import { useEffect, useState } from "react";
import "../styles/HouseSearch.css";

const HouseSearch = () => {
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: ""
  });

  const [houses, setHouses] = useState([]);

  const fetchHouses = async () => {
    const query = new URLSearchParams(filters).toString();

    const res = await fetch(
      `http://localhost:5000/api/houses/search?${query}`
    );
    const data = await res.json();
    setHouses(data);
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="search-container">
      <h2>Find a House in Rongai</h2>

      <div className="filters">
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="minPrice" placeholder="Min Price" type="number" onChange={handleChange} />
        <input name="maxPrice" placeholder="Max Price" type="number" onChange={handleChange} />
        <input name="bedrooms" placeholder="Bedrooms" type="number" onChange={handleChange} />
        <button onClick={fetchHouses}>Search</button>
      </div>

      <div className="house-list">
        {houses.length === 0 && <p>No houses found</p>}

        {houses.map((house) => (
          <div className="house-card" key={house.id}>
            <h4>{house.title}</h4>
            <p>Location: {house.location}</p>
            <p>Price: KES {house.price}</p>
            <p>{house.bedrooms} Bedrooms</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseSearch;