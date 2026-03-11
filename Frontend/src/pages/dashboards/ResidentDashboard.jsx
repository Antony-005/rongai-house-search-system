import { useState, useEffect, useCallback } from "react";
import HouseCard from "../../components/HouseCard";

const API = "http://localhost:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      background: type === "success" ? "#22c55e" : "#ef4444",
      color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      animation: "slideUp 0.3s ease"
    }}>
      {message}
    </div>
  );
}

// ── Booking Modal ──────────────────────────────────────────────────────────────
function BookingModal({ house, onClose, onConfirm, loading }) {
  const [notes, setNotes] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, width: "100%",
        maxWidth: 440, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 16, background: "none",
          border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8"
        }}>×</button>

        <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "#1a1a2e" }}>Confirm Booking</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
          You are requesting to book:
        </p>

        {/* House summary */}
        <div style={{
          background: "#f8fafc", borderRadius: 10, padding: "14px 16px",
          marginBottom: 20, borderLeft: "4px solid #4361ee"
        }}>
          <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 15 }}>{house.title}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>📍 {house.location}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#4361ee", marginTop: 6 }}>
            KES {Number(house.price).toLocaleString()} / month
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Message to admin (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. I'd like to move in on the 1st of next month..."
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", fontSize: 13,
              boxSizing: "border-box", resize: "vertical", outline: "none",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", background: "#f1f5f9", color: "#475569",
            border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 600
          }}>Cancel</button>
          <button onClick={() => onConfirm(house.id, notes)} disabled={loading} style={{
            flex: 2, padding: "10px", background: "#4361ee", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 600
          }}>
            {loading ? "Submitting..." : "Submit Booking Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking Status Badge ───────────────────────────────────────────────────────
function BookingBadge({ status }) {
  const map = {
    pending:  { bg: "#fef9c3", color: "#ca8a04", label: "Pending" },
    approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved ✓" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: "3px 12px",
      fontSize: 12, fontWeight: 600
    }}>{s.label}</span>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function ResidentDashboard() {
  const [tab, setTab] = useState("browse");

  // Houses
  const [houses, setHouses] = useState([]);
  const [housesLoading, setHousesLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterBedrooms, setFilterBedrooms] = useState("");

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Modal
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  // Set of house IDs the resident has already booked (pending or approved)
  const bookedHouseIds = new Set(
    bookings.filter(b => ["pending", "approved"].includes(b.status)).map(b => b.house_id)
  );

  // ── Fetch houses with filters ────────────────────────────────────────────────
  const fetchHouses = useCallback(async () => {
    setHousesLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterLocation) params.append("location", filterLocation);
      if (filterMinPrice) params.append("minPrice", filterMinPrice);
      if (filterMaxPrice) params.append("maxPrice", filterMaxPrice);
      if (filterBedrooms) params.append("bedrooms", filterBedrooms);

      const res = await fetch(`${API}/houses?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setHouses(data.houses);
    } catch {
      notify("Could not load houses.", "error");
    }
    setHousesLoading(false);
  }, [search, filterLocation, filterMinPrice, filterMaxPrice, filterBedrooms]);

  // ── Fetch bookings ───────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API}/resident/bookings`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings);
    } catch {
      notify("Could not load bookings.", "error");
    }
    setBookingsLoading(false);
  };

  useEffect(() => { fetchHouses(); }, [fetchHouses]);
  useEffect(() => { fetchBookings(); }, []);

  // Debounced search — re-fetch when search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => fetchHouses(), 400);
    return () => clearTimeout(timer);
  }, [search, filterLocation, filterMinPrice, filterMaxPrice, filterBedrooms]);

  // ── Submit booking ───────────────────────────────────────────────────────────
  const handleConfirmBooking = async (houseId, notes) => {
    setBookingLoading(true);
    try {
      const res = await fetch(`${API}/resident/bookings`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ house_id: houseId, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("Booking request submitted! Awaiting admin approval.");
        setSelectedHouse(null);
        fetchBookings();
        fetchHouses();
      } else {
        notify(data.message || "Booking failed.", "error");
      }
    } catch {
      notify("Network error.", "error");
    }
    setBookingLoading(false);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterLocation("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterBedrooms("");
  };

  const hasFilters = search || filterLocation || filterMinPrice || filterMaxPrice || filterBedrooms;

  const tabs = ["browse", "my-bookings"];
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{ display: "flex" }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 220, minHeight: "100vh", background: "#1a1a2e",
          padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0
        }}>
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>🏠 RongaiHomes</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Resident Portal</div>
          </div>

          <div style={{ padding: "16px 24px", borderBottom: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{user.full_name || "Resident"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.email || ""}</div>
          </div>

          <nav style={{ marginTop: 16 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 24px", background: tab === t ? "#4361ee" : "none",
                border: "none", color: tab === t ? "#fff" : "#94a3b8",
                fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400,
                transition: "all 0.2s", borderRadius: tab === t ? "0 8px 8px 0" : 0,
                position: "relative"
              }}>
                {t === "browse" ? "🔍 Browse Houses" : "📋 My Bookings"}
                {t === "my-bookings" && bookings.filter(b => b.status === "pending").length > 0 && (
                  <span style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "#f59e0b", color: "#fff", borderRadius: 20,
                    padding: "2px 7px", fontSize: 11, fontWeight: 700
                  }}>{bookings.filter(b => b.status === "pending").length}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", padding: "16px 24px" }}>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} style={{
              background: "none", border: "1px solid #ffffff30", color: "#94a3b8",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, width: "100%"
            }}>Logout</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, padding: 32, minWidth: 0 }}>

          {/* ── BROWSE TAB ── */}
          {tab === "browse" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>
                  Find Your Home in Rongai
                </h1>
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                  Browse verified and available rental houses
                </p>
              </div>

              {/* ── Search Bar ── */}
              <div style={{
                background: "#fff", borderRadius: 12, padding: "18px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search by title, location, or description..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 12px 10px 38px",
                        borderRadius: 8, border: "1.5px solid #e2e8f0",
                        fontSize: 14, boxSizing: "border-box", outline: "none"
                      }}
                    />
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} style={{
                      background: "#fee2e2", color: "#dc2626", border: "none",
                      borderRadius: 8, padding: "10px 16px", fontSize: 13,
                      cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap"
                    }}>Clear Filters</button>
                  )}
                </div>

                {/* ── Filter Row ── */}
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <input
                    type="text" placeholder="📍 Filter by location"
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                    style={{
                      flex: "1 1 160px", padding: "8px 12px", borderRadius: 8,
                      border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none"
                    }}
                  />
                  <input
                    type="number" placeholder="Min Price (KES)"
                    value={filterMinPrice}
                    onChange={e => setFilterMinPrice(e.target.value)}
                    style={{
                      flex: "1 1 130px", padding: "8px 12px", borderRadius: 8,
                      border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none"
                    }}
                  />
                  <input
                    type="number" placeholder="Max Price (KES)"
                    value={filterMaxPrice}
                    onChange={e => setFilterMaxPrice(e.target.value)}
                    style={{
                      flex: "1 1 130px", padding: "8px 12px", borderRadius: 8,
                      border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none"
                    }}
                  />
                  <select
                    value={filterBedrooms}
                    onChange={e => setFilterBedrooms(e.target.value)}
                    style={{
                      flex: "1 1 130px", padding: "8px 12px", borderRadius: 8,
                      border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none",
                      background: "#fff"
                    }}
                  >
                    <option value="">🛏 Any Bedrooms</option>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Bedroom{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Results summary ── */}
              <div style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>
                {housesLoading ? "Loading houses..." : `${houses.length} house${houses.length !== 1 ? "s" : ""} found`}
                {hasFilters && !housesLoading && " (filtered)"}
              </div>

              {/* ── House Grid ── */}
              {housesLoading ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <div style={{
                    width: 36, height: 36, border: "3px solid #e2e8f0",
                    borderTopColor: "#4361ee", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
                  }} />
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading available houses...</div>
                </div>
              ) : houses.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: 60,
                  background: "#fff", borderRadius: 12,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏘</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>No houses found</div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                    {hasFilters ? "Try adjusting your filters." : "No verified houses are currently available."}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20
                }}>
                  {houses.map(house => (
                    <HouseCard
                      key={house.id}
                      house={house}
                      onBook={h => setSelectedHouse(h)}
                      booked={bookedHouseIds.has(house.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── MY BOOKINGS TAB ── */}
          {tab === "my-bookings" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>
                  My Booking Requests
                </h1>
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                  Track the status of your house booking requests
                </p>
              </div>

              {bookingsLoading ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <div style={{
                    width: 36, height: 36, border: "3px solid #e2e8f0",
                    borderTopColor: "#4361ee", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite", margin: "0 auto"
                  }} />
                </div>
              ) : bookings.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: 60,
                  background: "#fff", borderRadius: 12,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>No bookings yet</div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                    Browse available houses and submit a booking request.
                  </div>
                  <button onClick={() => setTab("browse")} style={{
                    marginTop: 16, background: "#4361ee", color: "#fff",
                    border: "none", borderRadius: 8, padding: "10px 22px",
                    fontSize: 14, cursor: "pointer", fontWeight: 600
                  }}>Browse Houses</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{
                      background: "#fff", borderRadius: 12, padding: "20px 24px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: 16, flexWrap: "wrap"
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginBottom: 4 }}>
                          {b.house_title}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                          📍 {b.location}
                          {b.bedrooms && ` · 🛏 ${b.bedrooms} Bed`}
                          {b.bathrooms && ` · 🚿 ${b.bathrooms} Bath`}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#4361ee", marginBottom: 6 }}>
                          KES {Number(b.price).toLocaleString()} / month
                        </div>
                        {b.notes && (
                          <div style={{
                            fontSize: 13, color: "#94a3b8", fontStyle: "italic",
                            background: "#f8fafc", padding: "6px 10px", borderRadius: 6, marginTop: 4
                          }}>
                            "{b.notes}"
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 8 }}>
                          Submitted: {new Date(b.booking_date).toLocaleDateString("en-KE", {
                            year: "numeric", month: "short", day: "numeric"
                          })}
                        </div>
                      </div>
                      <BookingBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Booking Confirmation Modal ── */}
      {selectedHouse && (
        <BookingModal
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
          onConfirm={handleConfirmBooking}
          loading={bookingLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}