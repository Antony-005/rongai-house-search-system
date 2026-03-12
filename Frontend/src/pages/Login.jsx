import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  /* ── Client-side validation ────────────────────────────────── */
  const validate = () => {
    if (!email.trim())    return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
    if (!password)        return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  /* ── Submit handler ────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const error = validate();
    if (error) return setMessage({ text: error, type: "error" });

    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Persist auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("role",  data.role);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        setMessage({ text: "Login successful! Redirecting…", type: "success" });

        // Redirect based on role
        setTimeout(() => {
          if (data.role === "resident") navigate("/resident", { replace: true });
          if (data.role === "agent")    navigate("/agent",    { replace: true });
          if (data.role === "admin")    navigate("/admin",    { replace: true });
        }, 700);
      } else {
        setMessage({ text: data.message || "Invalid credentials.", type: "error" });
      }
    } catch {
      setMessage({ text: "Unable to connect. Check your internet and try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left decorative panel */}
      <div className="auth-panel">
        <Link to="/" className="auth-panel__brand">
          🏠 <span>RongaiHomes</span>
        </Link>
        <div className="auth-panel__content">
          <h2>Welcome back.</h2>
          <p>
            Log in to search verified listings, track your bookings,
            and manage your Rongai rental journey.
          </p>
          <ul className="auth-panel__bullets">
            <li>✓ Verified houses only</li>
            <li>✓ Real-time booking status</li>
            <li>✓ Rongai-focused platform</li>
          </ul>
        </div>
        {/* Decorative image placeholder */}
        <div className="auth-panel__img-wrap">
          <img
            src="/assets/images/login-panel.jpg"
            alt="Rongai housing"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">

          {/* Back link */}
          <Link to="/" className="auth-back">
            ← Back to Home
          </Link>

          <div className="auth-form-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin} noValidate>

            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="form-pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Feedback message */}
            {message.text && (
              <div className={`auth-message auth-message--${message.type}`}>
                {message.type === "error" ? "⚠ " : "✓ "}
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-submit__loading">
                  <span className="spinner" /> Signing in…
                </span>
              ) : "Sign In"}
            </button>

          </form>

          <div className="auth-footer-links">
            <p>
              Don't have an account?{" "}
              <Link to="/register/resident">Create one here</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;