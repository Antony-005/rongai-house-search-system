import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

// ── Utility ──────────────────────────────────────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 28px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}`,
      minWidth: 160
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, width: "100%",
        maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none",
          border: "none", fontSize: 22, cursor: "pointer", color: "#999"
        }}>×</button>
        <h3 style={{ margin: "0 0 20px", fontSize: 18, color: "#1a1a2e" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, required, min }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#e53e3e" }}> *</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} min={min}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 8,
          border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
          boxSizing: "border-box", transition: "border 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "#4361ee"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
    </div>
  );
}

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

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const [tab, setTab] = useState("overview");
  const [landlords, setLandlords] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal state
  const [showAddLandlord, setShowAddLandlord] = useState(false);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [editHouse, setEditHouse] = useState(null);

  // Form state
  const [landlordForm, setLandlordForm] = useState({ full_name: "", phone: "", email: "" });
  const [houseForm, setHouseForm] = useState({
    landlord_id: "", title: "", location: "", price: "",
    bedrooms: "", bathrooms: "", description: ""
  });

  const notify = (message, type = "success") => setToast({ message, type });

  const fetchLandlords = async () => {
    const res = await fetch(`${API}/agent/landlords`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setLandlords(data.landlords);
  };

  const fetchHouses = async () => {
    const res = await fetch(`${API}/agent/houses`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setHouses(data.houses);
  };

  useEffect(() => {
    fetchLandlords();
    fetchHouses();
  }, []);

  // ── Landlord submit ────────────────────────────────────────────────────────
  const handleAddLandlord = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/agent/landlords`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(landlordForm)
      });
      const data = await res.json();
      if (res.ok) {
        notify("Landlord registered successfully!");
        setShowAddLandlord(false);
        setLandlordForm({ full_name: "", phone: "", email: "" });
        fetchLandlords();
      } else {
        notify(data.message || "Error adding landlord.", "error");
      }
    } catch {
      notify("Network error.", "error");
    }
    setLoading(false);
  };

  // ── House submit ───────────────────────────────────────────────────────────
  const handleAddHouse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/agent/houses`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(houseForm)
      });
      const data = await res.json();
      if (res.ok) {
        notify("House listing added! Awaiting admin verification.");
        setShowAddHouse(false);
        setHouseForm({ landlord_id: "", title: "", location: "", price: "", bedrooms: "", bathrooms: "", description: "" });
        fetchHouses();
      } else {
        notify(data.message || "Error adding house.", "error");
      }
    } catch {
      notify("Network error.", "error");
    }
    setLoading(false);
  };

  // ── House update ───────────────────────────────────────────────────────────
  const handleUpdateHouse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/agent/houses/${editHouse.id}`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify(editHouse)
      });
      const data = await res.json();
      if (res.ok) {
        notify("House updated. Re-verification required.");
        setEditHouse(null);
        fetchHouses();
      } else {
        notify(data.message || "Update failed.", "error");
      }
    } catch {
      notify("Network error.", "error");
    }
    setLoading(false);
  };

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this listing?")) return;
    const res = await fetch(`${API}/agent/houses/${id}/deactivate`, {
      method: "PATCH", headers: authHeaders()
    });
    const data = await res.json();
    if (res.ok) { notify("Listing deactivated."); fetchHouses(); }
    else notify(data.message || "Error.", "error");
  };

  const verifiedCount = houses.filter(h => h.is_verified).length;
  const pendingCount = houses.filter(h => !h.is_verified && h.status !== "inactive").length;
  const activeCount = houses.filter(h => h.status === "available").length;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const tabs = ["overview", "landlords", "listings"];

  const statusBadge = (house) => {
    if (house.status === "inactive") return { label: "Inactive", bg: "#fee2e2", color: "#dc2626" };
    if (!house.is_verified) return { label: "Pending", bg: "#fef9c3", color: "#ca8a04" };
    if (house.status === "booked") return { label: "Booked", bg: "#dbeafe", color: "#2563eb" };
    return { label: "Available", bg: "#dcfce7", color: "#16a34a" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>

      {/* Sidebar */}
      <div style={{ display: "flex" }}>
        <aside style={{
          width: 220, minHeight: "100vh", background: "#1a1a2e",
          padding: "28px 0", display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>🏠 RongaiHomes</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Agent Portal</div>
          </div>
          <nav style={{ marginTop: 20 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 24px", background: tab === t ? "#4361ee" : "none",
                border: "none", color: tab === t ? "#fff" : "#94a3b8",
                fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400,
                textTransform: "capitalize", transition: "all 0.2s",
                borderRadius: tab === t ? "0 8px 8px 0" : 0,
              }}>
                {t === "overview" ? "📊 Overview" : t === "landlords" ? "👤 Landlords" : "🏡 My Listings"}
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

        {/* Main */}
        <main style={{ flex: 1, padding: 32 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>
              {tab === "overview" ? "Dashboard Overview" : tab === "landlords" ? "Landlord Management" : "My House Listings"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {tab === "overview" ? "Your activity at a glance" : tab === "landlords" ? "Manage your recruited landlords" : "Add and manage property listings"}
            </p>
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
                <StatCard label="Total Landlords" value={landlords.length} color="#4361ee" />
                <StatCard label="Total Listings" value={houses.length} color="#7209b7" />
                <StatCard label="Verified & Active" value={activeCount} color="#22c55e" />
                <StatCard label="Pending Verification" value={pendingCount} color="#f59e0b" />
              </div>

              <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1a1a2e" }}>Recent Listings</h3>
                {houses.slice(0, 5).map(h => {
                  const badge = statusBadge(h);
                  return (
                    <div key={h.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 0", borderBottom: "1px solid #f1f5f9"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{h.title}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{h.location} · KES {Number(h.price).toLocaleString()}</div>
                      </div>
                      <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
                {houses.length === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>No listings yet.</p>}
              </div>
            </>
          )}

          {/* ── LANDLORDS TAB ── */}
          {tab === "landlords" && (
            <>
              <button onClick={() => setShowAddLandlord(true)} style={{
                background: "#4361ee", color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20
              }}>+ Add Landlord</button>

              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Name", "Phone", "Email", "Registered"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {landlords.map(l => (
                      <tr key={l.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{l.full_name}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{l.phone}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{l.email || "—"}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(l.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {landlords.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No landlords yet. Add your first one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── LISTINGS TAB ── */}
          {tab === "listings" && (
            <>
              <button onClick={() => setShowAddHouse(true)} style={{
                background: "#4361ee", color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20
              }}>+ Add House Listing</button>

              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Title", "Location", "Price (KES)", "Beds/Baths", "Landlord", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {houses.map(h => {
                      const badge = statusBadge(h);
                      return (
                        <tr key={h.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{h.title}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{h.location}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{Number(h.price).toLocaleString()}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{h.bedrooms ?? "—"} / {h.bathrooms ?? "—"}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{h.landlord_name}</td>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <button onClick={() => setEditHouse({ ...h })} style={{
                              background: "#e0e7ff", color: "#4361ee", border: "none",
                              borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", marginRight: 6, fontWeight: 600
                            }}>Edit</button>
                            {h.status !== "inactive" && (
                              <button onClick={() => handleDeactivate(h.id)} style={{
                                background: "#fee2e2", color: "#dc2626", border: "none",
                                borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600
                              }}>Deactivate</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {houses.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No listings yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── ADD LANDLORD MODAL ── */}
      {showAddLandlord && (
        <Modal title="Register New Landlord" onClose={() => setShowAddLandlord(false)}>
          <form onSubmit={handleAddLandlord}>
            <FormField label="Full Name" name="full_name" value={landlordForm.full_name} required
              onChange={e => setLandlordForm({ ...landlordForm, full_name: e.target.value })} />
            <FormField label="Phone Number" name="phone" value={landlordForm.phone} required
              onChange={e => setLandlordForm({ ...landlordForm, phone: e.target.value })} />
            <FormField label="Email (optional)" name="email" type="email" value={landlordForm.email}
              onChange={e => setLandlordForm({ ...landlordForm, email: e.target.value })} />
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", background: "#4361ee", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 6
            }}>{loading ? "Saving..." : "Register Landlord"}</button>
          </form>
        </Modal>
      )}

      {/* ── ADD HOUSE MODAL ── */}
      {showAddHouse && (
        <Modal title="Add House Listing" onClose={() => setShowAddHouse(false)}>
          <form onSubmit={handleAddHouse}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>
                Landlord <span style={{ color: "#e53e3e" }}>*</span>
              </label>
              <select value={houseForm.landlord_id} required
                onChange={e => setHouseForm({ ...houseForm, landlord_id: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }}>
                <option value="">-- Select Landlord --</option>
                {landlords.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select>
            </div>
            <FormField label="Title" name="title" value={houseForm.title} required
              onChange={e => setHouseForm({ ...houseForm, title: e.target.value })} />
            <FormField label="Location" name="location" value={houseForm.location} required
              onChange={e => setHouseForm({ ...houseForm, location: e.target.value })} />
            <FormField label="Monthly Rent (KES)" name="price" type="number" min="0" value={houseForm.price} required
              onChange={e => setHouseForm({ ...houseForm, price: e.target.value })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Bedrooms" name="bedrooms" type="number" min="0" value={houseForm.bedrooms}
                onChange={e => setHouseForm({ ...houseForm, bedrooms: e.target.value })} />
              <FormField label="Bathrooms" name="bathrooms" type="number" min="0" value={houseForm.bathrooms}
                onChange={e => setHouseForm({ ...houseForm, bathrooms: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>Description</label>
              <textarea value={houseForm.description} rows={3}
                onChange={e => setHouseForm({ ...houseForm, description: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", background: "#4361ee", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>{loading ? "Saving..." : "Add Listing"}</button>
          </form>
        </Modal>
      )}

      {/* ── EDIT HOUSE MODAL ── */}
      {editHouse && (
        <Modal title="Edit House Listing" onClose={() => setEditHouse(null)}>
          <form onSubmit={handleUpdateHouse}>
            <FormField label="Title" name="title" value={editHouse.title} required
              onChange={e => setEditHouse({ ...editHouse, title: e.target.value })} />
            <FormField label="Location" name="location" value={editHouse.location} required
              onChange={e => setEditHouse({ ...editHouse, location: e.target.value })} />
            <FormField label="Monthly Rent (KES)" name="price" type="number" min="0" value={editHouse.price} required
              onChange={e => setEditHouse({ ...editHouse, price: e.target.value })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Bedrooms" name="bedrooms" type="number" min="0" value={editHouse.bedrooms || ""}
                onChange={e => setEditHouse({ ...editHouse, bedrooms: e.target.value })} />
              <FormField label="Bathrooms" name="bathrooms" type="number" min="0" value={editHouse.bathrooms || ""}
                onChange={e => setEditHouse({ ...editHouse, bathrooms: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>Description</label>
              <textarea value={editHouse.description || ""} rows={3}
                onChange={e => setEditHouse({ ...editHouse, description: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", background: "#7209b7", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>{loading ? "Updating..." : "Save Changes"}</button>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}