import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/houses", {
      headers: {
        Authorization: "Bearer YOUR_ADMIN_TOKEN"
      }
    })
      .then(res => res.json())
      .then(data => setHouses(data));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {houses.map(house => (
        <div key={house.id}>
          <h4>{house.title}</h4>
          <p>Landlord: {house.landlord_name}</p>
          <p>Status: {house.status}</p>
          <p>Verified: {house.is_verified ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;