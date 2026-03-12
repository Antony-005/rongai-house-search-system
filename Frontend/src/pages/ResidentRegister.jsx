import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/ResidentRegister.css";

/* ── Password strength helper ──────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { level: 0, label: "",       color: "" },
    { level: 1, label: "Weak",   color: "#dc2626" },
    { level: 2, label: "Fair",   color: "#d97706" },
    { level: 3, label: "Good",   color: "#2563eb" },
    { level: 4, label: "Strong", color: "#16a34a" },
  ];
  return map[score];
};

const ResidentRegister = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email:     "",
    phone:     "",
    password:  "",
    confirm:   "",
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage]         = useState({ text: "", type: "" });
  const [loading, setLoading]         = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(formData.password);

  /* ── Field change handler ──────────────────────────────────── */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ── Client-side validation ────────────────────────────────── */
  const validate = () => {
    if (!formData.full_name.trim())  return "Full name is required.";
    if (formData.full_name.trim().length < 3) return "Full name must be at least 3 characters.";
    if (!formData.email.trim())      return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Enter a valid email address.";
    if (formData.phone && !/^[0-9+\s\-]{7,15}$/.test(formData.phone)) return "Enter a valid phone number.";
    if (!formData.password)          return "Password is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    if (formData.password !== formData.confirm) return "Passwords do not match.";
    return null;
  };

  /* ── Submit handler ────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const error = validate();
    if (error) return setMessage({ text: error, type: "error" });

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          full_name: formData.full_name.trim(),
          email:     formData.email.trim(),
          phone:     formData.phone.trim() || undefined,
          password:  formData.password,
          role_id:   1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Account created! Redirecting to login…", type: "success" });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage({ text: data.message || "Registration failed.", type: "error" });
      }
    } catch {
      setMessage({ text: "Unable to connect. Check your internet and try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left panel ── */}
      <div className="auth-panel">
        <Link to="/" className="auth-panel__brand">
          🏠 <span>RongaiHomes</span>
        </Link>
        <div className="auth-panel__content">
          <h2>Your next home is one step away.</h2>
          <p>
            Create a free account to browse verified rental listings,
            filter by price, and submit booking requests instantly.
          </p>
          <ul className="auth-panel__bullets">
            <li>✓ Free to register, no hidden fees</li>
            <li>✓ Verified listings only</li>
            <li>✓ Instant booking requests</li>
          </ul>
        </div>
        <div className="auth-panel__img-wrap">
          <img
            src="/assets/images/register-panel.jpg"
            alt="Rongai homes"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      </div>

      {/* ── Right form side ── */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">

          <Link to="/" className="auth-back">← Back to Home</Link>

          <div className="auth-form-header">
            <h1>Create Account</h1>
            <p>Register as a resident to start searching for your home.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Full name */}
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">👤</span>
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  placeholder="e.g. Jane Mwangi"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Phone — optional */}
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
                <span className="form-optional"> (optional)</span>
              </label>
              <div className="form-input-wrap">
                <span className="form-input-icon">📞</span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 0712 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
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

              {/* Password strength bar */}
              {formData.password && (
                <div className="pw-strength">
                  <div className="pw-strength__bars">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="pw-strength__bar"
                        style={{
                          background: n <= strength.level ? strength.color : "#e2e8f0",
                        }}
                      />
                    ))}
                  </div>
                  <span className="pw-strength__label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  placeholder="Re-enter your password"
                  value={formData.confirm}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="form-pass-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
              {/* Match indicator */}
              {formData.confirm && (
                <span className={`pw-match ${formData.password === formData.confirm ? "pw-match--ok" : "pw-match--no"}`}>
                  {formData.password === formData.confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                </span>
              )}
            </div>

            {/* Feedback */}
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
                  <span className="spinner" /> Creating account…
                </span>
              ) : "Create My Account"}
            </button>

          </form>

          <div className="auth-footer-links">
            <p>
              Already have an account?{" "}
              <Link to="/login">Sign in here</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResidentRegister;