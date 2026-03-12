import "../styles/HouseCard.css";

// HouseCard.jsx
// Props:
//   house   - house object from API
//   onBook  - callback(house) when Book Now is clicked
//   booked  - bool, if resident already has booking for this house

export default function HouseCard({ house, onBook, booked = false }) {
  const priceFormatted = Number(house.price).toLocaleString("en-KE");

  return (
    <div className={`house-card ${booked ? "house-card--booked" : ""}`}>

      {/* ── Image / Placeholder ── */}
      <div className="house-card__image-wrapper">
        {house.image_url ? (
          <img
            src={house.image_url}
            alt={house.title}
            className="house-card__image"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="house-card__image-placeholder">
            <span className="house-card__image-icon">🏠</span>
          </div>
        )}

        {/* Verified badge */}
        <div className="house-card__verified-badge">
          ✓ Verified
        </div>

        {/* Status pill */}
        <div className={`house-card__status house-card__status--${house.status}`}>
          {house.status === "available" ? "Available" : house.status}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="house-card__body">

        <h3 className="house-card__title" title={house.title}>
          {house.title}
        </h3>

        <p className="house-card__location">
          <span className="house-card__location-icon">📍</span>
          {house.location}
        </p>

        <div className="house-card__price">
          <span className="house-card__price-amount">KES {priceFormatted}</span>
          <span className="house-card__price-period"> / month</span>
        </div>

        {/* Bedrooms / Bathrooms */}
        <div className="house-card__meta">
          {house.bedrooms != null && (
            <span className="house-card__meta-item">
              🛏 {house.bedrooms} Bed{house.bedrooms !== 1 ? "s" : ""}
            </span>
          )}
          {house.bathrooms != null && (
            <span className="house-card__meta-item">
              🚿 {house.bathrooms} Bath{house.bathrooms !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Description */}
        {house.description && (
          <p className="house-card__description">{house.description}</p>
        )}

        {/* Footer */}
        <div className="house-card__footer">
          <span className="house-card__landlord">
            🧑‍💼 {house.landlord_name}
          </span>

          <button
            className={`house-card__book-btn ${booked ? "house-card__book-btn--booked" : ""}`}
            onClick={() => !booked && onBook(house)}
            disabled={booked}
            aria-label={booked ? "Booking already requested" : `Book ${house.title}`}
          >
            {booked ? "✓ Requested" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}