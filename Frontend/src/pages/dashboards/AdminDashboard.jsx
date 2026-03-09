import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AdminDashboard = () => {

  const [houses, setHouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const [agent, setAgent] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    assigned_area: ""
  });


  /* ===========================
     FETCH HOUSES
  =========================== */

  const fetchHouses = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/admin/houses",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();

      setHouses(Array.isArray(data) ? data : []);

    } catch (error) {

      console.error(error);

    }

  };


  /* ===========================
     FETCH USERS
  =========================== */

  const fetchUsers = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);

    } catch (error) {

      console.error(error);

    }

  };


  /* ===========================
     VERIFY HOUSE
  =========================== */

  const verifyHouse = async (houseId) => {

    try {

      const res = await fetch(
        `http://localhost:5000/api/admin/verify-house/${houseId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();

      setMessage(data.message);

      fetchHouses();

    } catch (error) {

      console.error(error);

    }

  };


  /* ===========================
     HANDLE FORM CHANGE
  =========================== */

  const handleChange = (e) => {

    setAgent({
      ...agent,
      [e.target.name]: e.target.value
    });

  };


  /* ===========================
     REGISTER AGENT
  =========================== */

  const handleRegisterAgent = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(
        "http://localhost:5000/api/agents/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(agent)
        }
      );

      const data = await res.json();

      if (res.ok) {

        setMessage("Agent registered successfully!");

        setAgent({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          assigned_area: ""
        });

        fetchUsers();

      } else {

        setMessage(data.message);

      }

    } catch (error) {

      setMessage("Server error");

    }

  };


  /* ===========================
     INITIAL LOAD
  =========================== */

  useEffect(() => {

    fetchHouses();
    fetchUsers();

  }, []);



  return (

    <div className="admin-dashboard">

      <h2>Admin Dashboard</h2>

      {message && <p>{message}</p>}



      {/* =====================
          REGISTER AGENT
      ===================== */}

      <section>

        <h3>Register New Agent</h3>

        <form onSubmit={handleRegisterAgent}>

          <input
            name="full_name"
            placeholder="Full Name"
            value={agent.full_name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={agent.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            value={agent.phone}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={agent.password}
            onChange={handleChange}
            required
          />

          <input
            name="assigned_area"
            placeholder="Assigned Area"
            value={agent.assigned_area}
            onChange={handleChange}
          />

          <button type="submit">
            Register Agent
          </button>

        </form>

      </section>



      {/* =====================
          HOUSES
      ===================== */}

      <h3>Houses</h3>

      <div>

        {houses.length === 0 ? (

          <p>No houses found</p>

        ) : (

          houses.map((h) => (

            <motion.div
              key={h.id}
              whileHover={{ scale: 1.02 }}
              className="house-card"
            >

              <h4>{h.title}</h4>

              <p>Location: {h.location}</p>

              <p>Price: KES {h.price}</p>

              <p>Status: {h.status}</p>

              <p>Verified: {h.verified ? "Yes" : "No"}</p>

              {!h.verified && (

                <button
                  onClick={() => verifyHouse(h.id)}
                >
                  Verify
                </button>

              )}

            </motion.div>

          ))

        )}

      </div>



      {/* =====================
          USERS
      ===================== */}

      <h3>Users</h3>

      <ul>

        {users.map((u) => (

          <li key={u.id}>
            {u.full_name} - {u.email} ({u.role})
          </li>

        ))}

      </ul>

    </div>

  );

};

export default AdminDashboard;