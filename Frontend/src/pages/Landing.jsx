import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/LandingPage.css";
import house from "../assets/house.jpg";
import { Link } from "react-router-dom";

const LandingPage = () => {

  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "landing dark" : "landing light"}>

      {/* NAVBAR */}

      <nav className="navbar">
        <h2>Rongai Housing</h2>

        <div className="nav-buttons">

          <button onClick={toggleTheme}>
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>

          <a href="/login">
            <button className="login-btn">Login</button>
          </a>

        </div>
      </nav>


      {/* HERO SECTION */}

      <section className="hero">

        <motion.div
          initial={{opacity:0, y:40}}
          animate={{opacity:1, y:0}}
          transition={{duration:1}}
        >

          <h1>Find Your Perfect Home in Rongai</h1>

          <p>
            Search verified houses, compare prices, and book your next
            home easily through our system.
          </p>

          <div className="hero-buttons">

            <Link to="/register/resident">
                <button className="primary-btn">Register as Resident</button>
            </Link>

            <a href="/agent-register">
              <button className="secondary-btn">
                Register as Agent
              </button>
            </a>

          </div>

        </motion.div>

        <img src={house} alt="house" />

      </section>


      {/* FEATURES */}

      <section className="features">

        <h2>Why Use Our System?</h2>

        <div className="feature-grid">

          <div className="feature-card">
            🔍 Advanced Search
            <p>Filter houses by price, location and availability.</p>
          </div>

          <div className="feature-card">
            🏠 Verified Listings
            <p>All houses are verified by the admin.</p>
          </div>

          <div className="feature-card">
            📅 Easy Booking
            <p>Book houses directly through the system.</p>
          </div>

          <div className="feature-card">
            👨‍💼 Agent Listings
            <p>Agents can upload and manage house listings.</p>
          </div>

        </div>

      </section>


      {/* WORKFLOW */}

      <section className="workflow">

        <h2>How It Works</h2>

        <div className="steps">

          <div className="step">1️⃣ Register</div>
          <div className="step">2️⃣ Login</div>
          <div className="step">3️⃣ Search Houses</div>
          <div className="step">4️⃣ Book Your Home</div>

        </div>

      </section>


      {/* CTA */}

      <section className="cta">

        <h2>Start Your Housing Search Today</h2>

        <a href="/resident-register">
          <button className="primary-btn">
            Get Started
          </button>
        </a>

      </section>


      {/* FOOTER */}

      <footer>

        <p>
          Rongai New-House Search System © 2026
        </p>

      </footer>

    </div>
  );
};

export default LandingPage;