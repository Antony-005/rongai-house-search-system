import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AgentRegister.css";

const AgentRegister = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setMessage("Registration failed. Try again.");
    }
  };

  return (
    <div className="agent-register-container">
      <form className="agent-register-form" onSubmit={handleSubmit}>
        <h2>Agent Registration</h2>

        <input
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Register Agent</button>

        {message && <p className="message">{message}</p>}

        <div className="form-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#3b82f6" }}>
              Login
            </Link>
          </p>
          <p>
            <Link to="/" style={{ color: "#3b82f6" }}>
              Back to Landing
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AgentRegister;