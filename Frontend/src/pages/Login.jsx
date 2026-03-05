// Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // Redirect based on role
        if (data.role === "resident") navigate("/resident");
        if (data.role === "agent") navigate("/agent");
        if (data.role === "admin") navigate("/admin");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Login failed. Try again.");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {message && <p className="message">{message}</p>}

        <div className="form-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register/resident" style={{ color: "#3b82f6" }}>
              Register
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

export default Login;