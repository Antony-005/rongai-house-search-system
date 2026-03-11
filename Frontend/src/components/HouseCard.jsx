import "../styles/HouseCard.css";

// HouseCard.jsx
// Props:
//   house   - house object from API
//   onBook  - callback(house) when Book Now is clicked
//   booked  - bool, if resident already has booking for this house

export default function HouseCard({ house, onBook, booked = false }) {
  return (
    <div className="house-card">
      <div className="house-card__image-wrapper">
        🏠
      </div>

      <div className="house-card__body">
        <h3 className="house-card__title" title={house.title}>
          {house.title}
        </h3>

        <p className="house-card__location">
          📍 {house.location}
        </p>

        <div className="house-card__price">
          KES {Number(house.price).toLocaleString()}
          <span> / month</span>
        </div>

        <div className="house-card__meta">
          {house.bedrooms != null && (
            <span className="house-card__meta-item">🛏 {house.bedrooms} Bed{house.bedrooms !== 1 ? "s" : ""}</span>
          )}
          {house.bathrooms != null && (
            <span className="house-card__meta-item">🚿 {house.bathrooms} Bath{house.bathrooms !== 1 ? "s" : ""}</span>
          )}
        </div>

        {house.description && (
          <p className="house-card__description">{house.description}</p>
        )}

        <div className="house-card__footer">
          <span className="house-card__landlord">
            🧑‍💼 {house.landlord_name}
          </span>
          <button
            className="house-card__book-btn"
            onClick={() => onBook(house)}
            disabled={booked}
          >
            {booked ? "Requested" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}