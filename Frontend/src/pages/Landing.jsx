import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import "../styles/LandingPage.css";

/* ─── Animation variants ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ─── Animated section wrapper ────────────────────────────────── */
function RevealSection({ children, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature card data ───────────────────────────────────────── */
const features = [
  {
    icon: "🔍",
    title: "Advanced Search",
    desc: "Filter houses by price, location, bedrooms, and availability in seconds.",
  },
  {
    icon: "✅",
    title: "Verified Listings",
    desc: "Every property is reviewed and approved by our admin team before going live.",
  },
  {
    icon: "📅",
    title: "Easy Booking",
    desc: "Submit a booking request directly through the platform — no middlemen.",
  },
  {
    icon: "🧑‍💼",
    title: "Agent-Managed",
    desc: "Dedicated agents recruit landlords and keep listings accurate and updated.",
  },
];

/* ─── How it works steps ──────────────────────────────────────── */
const steps = [
  { num: "01", label: "Create Account", desc: "Register as a resident in under a minute." },
  { num: "02", label: "Browse Listings", desc: "Search verified houses in your price range." },
  { num: "03", label: "Book a Viewing", desc: "Submit a booking request directly online." },
  { num: "04", label: "Move In", desc: "Confirm and move into your new Rongai home." },
];

/* ─── Main component ──────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  // If already logged in, redirect to the correct dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (token && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="lp-root">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header className="lp-nav">
        <Link to="/" className="lp-nav__brand">
          <span className="lp-nav__logo-icon">🏠</span>
          <span className="lp-nav__logo-text">RongaiHomes</span>
        </Link>

        <nav className="lp-nav__links">
          <a href="#features" className="lp-nav__link">Features</a>
          <a href="#how-it-works" className="lp-nav__link">How It Works</a>
        </nav>

        <div className="lp-nav__actions">
          <Link to="/login" className="lp-nav__login">Login</Link>
          <Link to="/register/resident" className="lp-nav__cta">Get Started</Link>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="lp-hero">
        {/* Decorative background blobs */}
        <div className="lp-hero__blob lp-hero__blob--1" />
        <div className="lp-hero__blob lp-hero__blob--2" />

        <div className="lp-hero__content">
          <motion.div
            className="lp-hero__badge"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            🚀 Kenya's Smartest Rental Platform
          </motion.div>

          <motion.h1
            className="lp-hero__headline"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Find Your Perfect <br />
            <span className="lp-hero__highlight">Home in Rongai</span>
          </motion.h1>

          <motion.p
            className="lp-hero__sub"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Search verified houses, compare prices, and book your next home
            directly — no agents required, no hidden fees.
          </motion.p>

          <motion.div
            className="lp-hero__buttons"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link to="/register/resident" className="btn btn--primary btn--lg">
              Get Started — It's Free
            </Link>
            <Link to="/login" className="btn btn--outline btn--lg">
              Login to Account
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="lp-hero__trust"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <span>✓ Admin-verified listings</span>
            <span>✓ Instant booking</span>
            <span>✓ Rongai focused</span>
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          className="lp-hero__image-wrap"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="lp-hero__image-frame">
            <img
              src="/assets/images/hero-image.jpg"
              alt="Modern house in Rongai"
              className="lp-hero__img"
              /* Fallback gradient shown until real image is placed */
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {/* Placeholder shown when image is missing */}
            <div className="lp-hero__img-placeholder">
              <span>🏡</span>
              <p>hero-image.jpg</p>
              <small>Replace with stock photo</small>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="lp-hero__stat lp-hero__stat--listings">
            <strong>200+</strong>
            <span>Verified Listings</span>
          </div>
          <div className="lp-hero__stat lp-hero__stat--bookings">
            <strong>98%</strong>
            <span>Satisfaction Rate</span>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="lp-features" id="features">
        <RevealSection>
          <motion.div className="lp-section-label" variants={fadeUp}>
            Why Choose Us
          </motion.div>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            Everything you need to find a home
          </motion.h2>
          <motion.p className="lp-section-sub" variants={fadeUp}>
            We've simplified every step of the Rongai rental journey.
          </motion.p>
        </RevealSection>

        <RevealSection className="lp-features__grid">
          {features.map((f, i) => (
            <motion.div key={i} className="lp-feature-card" variants={fadeUp}>
              <div className="lp-feature-card__icon">{f.icon}</div>
              <h3 className="lp-feature-card__title">{f.title}</h3>
              <p className="lp-feature-card__desc">{f.desc}</p>
            </motion.div>
          ))}
        </RevealSection>
      </section>

      {/* ── PREVIEW IMAGE ───────────────────────────────────────── */}
      <section className="lp-preview">
        <RevealSection className="lp-preview__inner">
          <motion.div className="lp-preview__text" variants={fadeUp}>
            <div className="lp-section-label">Platform Preview</div>
            <h2 className="lp-section-title lp-section-title--left">
              A dashboard built for clarity
            </h2>
            <p className="lp-section-sub lp-section-sub--left">
              Once registered, your dashboard gives you instant access to search,
              bookings, and your personal rental history — all in one place.
            </p>
            <Link to="/register/resident" className="btn btn--primary">
              Create Free Account
            </Link>
          </motion.div>

          <motion.div className="lp-preview__image-wrap" variants={fadeUp}>
            <div className="lp-preview__image-frame">
              <img
                src="/assets/images/dashboard-preview.jpg"
                alt="Dashboard preview"
                className="lp-preview__img"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="lp-preview__img-placeholder">
                <span>🖥</span>
                <p>dashboard-preview.jpg</p>
                <small>Replace with screenshot</small>
              </div>
            </div>
          </motion.div>
        </RevealSection>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="lp-how" id="how-it-works">
        <RevealSection>
          <motion.div className="lp-section-label" variants={fadeUp}>How It Works</motion.div>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            From sign-up to move-in, in four steps
          </motion.h2>
        </RevealSection>

        <RevealSection className="lp-how__steps">
          {steps.map((s, i) => (
            <motion.div key={i} className="lp-step" variants={fadeUp}>
              <div className="lp-step__num">{s.num}</div>
              <h3 className="lp-step__label">{s.label}</h3>
              <p className="lp-step__desc">{s.desc}</p>
              {i < steps.length - 1 && <div className="lp-step__arrow">→</div>}
            </motion.div>
          ))}
        </RevealSection>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────── */}
      <section className="lp-cta">
        <RevealSection className="lp-cta__inner">
          <motion.h2 className="lp-cta__title" variants={fadeUp}>
            Ready to find your next home?
          </motion.h2>
          <motion.p className="lp-cta__sub" variants={fadeUp}>
            Join hundreds of residents who found their home through RongaiHomes.
          </motion.p>
          <motion.div className="lp-cta__buttons" variants={fadeUp}>
            <Link to="/register/resident" className="btn btn--white btn--lg">
              Get Started Today
            </Link>
            <Link to="/login" className="btn btn--outline-white btn--lg">
              I Already Have an Account
            </Link>
          </motion.div>
        </RevealSection>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <span>🏠 RongaiHomes</span>
            <p>Connecting Rongai residents with verified rental homes.</p>
          </div>
          <div className="lp-footer__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/login">Login</Link>
            <Link to="/register/resident">Register</Link>
          </div>
        </div>
        <div className="lp-footer__bottom">
          <p>© 2026 Rongai New-House Search System. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;