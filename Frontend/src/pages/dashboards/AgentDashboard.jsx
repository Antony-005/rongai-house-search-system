import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Shared UI ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 28px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}`,
      minWidth: 160, flex: 1
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

function FormField({ label, name, type = "text", value, onChange, required, min, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#e53e3e" }}> *</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} min={min} placeholder={placeholder}
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
      fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    }}>{message}</div>
  );
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: action ? 16 : 0 }}>{subtitle}</div>
      {action}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const [tab, setTab] = useState("overview");
  const [landlords, setLandlords] = useState([]);
  const [houses, setHouses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals
  const [showAddLandlord, setShowAddLandlord] = useState(false);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editHouse, setEditHouse] = useState(null);

  // Forms
  const [landlordForm, setLandlordForm] = useState({ full_name: "", phone: "", email: "" });
  const [houseForm, setHouseForm] = useState({
    landlord_id: "", title: "", location: "", price: "",
    bedrooms: "", bathrooms: "", description: ""
  });
  const [paymentForm, setPaymentForm] = useState({
    landlord_id: "", amount: "", description: ""
  });

  const notify = (message, type = "success") => setToast({ message, type });

  // ── Fetchers ──────────────────────────────────────────────────────────────────
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

  const fetchPayments = async () => {
    const [resP, resS] = await Promise.all([
      fetch(`${API}/agent/payments`, { headers: authHeaders() }),
      fetch(`${API}/agent/payments/summary`, { headers: authHeaders() }),
    ]);
    const dataP = await resP.json();
    const dataS = await resS.json();
    if (resP.ok) { setPayments(dataP.payments); setPaymentsTotal(dataP.total); }
    if (resS.ok) setPaymentSummary(dataS.summary);
  };

  useEffect(() => {
    fetchLandlords();
    fetchHouses();
    fetchPayments();
  }, []);

  // ── Landlord submit ───────────────────────────────────────────────────────────
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
      } else notify(data.message || "Error.", "error");
    } catch { notify("Network error.", "error"); }
    setLoading(false);
  };

  // ── House submit ──────────────────────────────────────────────────────────────
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
      } else notify(data.message || "Error.", "error");
    } catch { notify("Network error.", "error"); }
    setLoading(false);
  };

  // ── House update ──────────────────────────────────────────────────────────────
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
      } else notify(data.message || "Update failed.", "error");
    } catch { notify("Network error.", "error"); }
    setLoading(false);
  };

  // ── Deactivate ────────────────────────────────────────────────────────────────
  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this listing?")) return;
    const res = await fetch(`${API}/agent/houses/${id}/deactivate`, {
      method: "PATCH", headers: authHeaders()
    });
    const data = await res.json();
    if (res.ok) { notify("Listing deactivated."); fetchHouses(); }
    else notify(data.message || "Error.", "error");
  };

  // ── Payment submit ────────────────────────────────────────────────────────────
  const handleAddPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/agent/payments`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(paymentForm)
      });
      const data = await res.json();
      if (res.ok) {
        notify("Payment recorded successfully!");
        setShowAddPayment(false);
        setPaymentForm({ landlord_id: "", amount: "", description: "" });
        fetchPayments();
      } else notify(data.message || "Error.", "error");
    } catch { notify("Network error.", "error"); }
    setLoading(false);
  };

  // ── Computed stats ────────────────────────────────────────────────────────────
  const verifiedCount = houses.filter(h => h.is_verified).length;
  const pendingCount = houses.filter(h => !h.is_verified && h.status !== "inactive").length;

  const statusBadge = (house) => {
    if (house.status === "inactive") return { label: "Inactive", bg: "#fee2e2", color: "#dc2626" };
    if (!house.is_verified) return { label: "Pending", bg: "#fef9c3", color: "#ca8a04" };
    if (house.status === "booked") return { label: "Booked", bg: "#dbeafe", color: "#2563eb" };
    return { label: "Available", bg: "#dcfce7", color: "#16a34a" };
  };

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "landlords", label: "👤 Landlords" },
    { key: "listings", label: "🏡 My Listings" },
    { key: "payments", label: "💰 Payments" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>

      <div style={{ display: "flex" }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 224, minHeight: "100vh", background: "#1a1a2e",
          padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0
        }}>
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>🏠 RongaiHomes</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Agent Portal</div>
          </div>

          <nav style={{ marginTop: 20 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 24px", background: tab === t.key ? "#4361ee" : "none",
                border: "none", color: tab === t.key ? "#fff" : "#94a3b8",
                fontSize: 14, cursor: "pointer", fontWeight: tab === t.key ? 600 : 400,
                transition: "all 0.2s", borderRadius: tab === t.key ? "0 8px 8px 0" : 0,
              }}>
                {t.label}
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

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>
              {{ overview: "Dashboard Overview", landlords: "Landlord Management", listings: "My House Listings", payments: "Payment Records" }[tab]}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {{ overview: "Your activity at a glance", landlords: "Manage your recruited landlords", listings: "Add and manage property listings", payments: "Track landlord payments you have collected" }[tab]}
            </p>
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
                <StatCard label="Total Landlords" value={landlords.length} color="#4361ee" />
                <StatCard label="Total Listings" value={houses.length} color="#7209b7" />
                <StatCard label="Verified Active" value={verifiedCount} color="#22c55e" />
                <StatCard label="Pending Verification" value={pendingCount} color="#f59e0b" />
                <StatCard label="Total Collected (KES)" value={Number(paymentsTotal).toLocaleString()} color="#0891b2" />
              </div>

              {/* Recent listings */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 280, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#1a1a2e" }}>Recent Listings</h3>
                  {houses.slice(0, 5).map(h => {
                    const badge = statusBadge(h);
                    return (
                      <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{h.title}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{h.location} · KES {Number(h.price).toLocaleString()}</div>
                        </div>
                        <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                      </div>
                    );
                  })}
                  {houses.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No listings yet.</p>}
                </div>

                {/* Recent payments */}
                <div style={{ flex: 1, minWidth: 280, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#1a1a2e" }}>Recent Payments</h3>
                  {payments.slice(0, 5).map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{p.landlord_name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          {new Date(p.payment_date).toLocaleDateString()}
                          {p.description && ` · ${p.description}`}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 14 }}>
                        KES {Number(p.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {payments.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No payments recorded yet.</p>}
                </div>
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
                {landlords.length === 0 ? (
                  <EmptyState icon="👤" title="No landlords yet" subtitle="Add your first landlord to get started." />
                ) : (
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
                    </tbody>
                  </table>
                )}
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
                {houses.length === 0 ? (
                  <EmptyState icon="🏡" title="No listings yet" subtitle="Add your first house listing." />
                ) : (
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
                              <button onClick={() => setEditHouse({ ...h })} style={{ background: "#e0e7ff", color: "#4361ee", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", marginRight: 6, fontWeight: 600 }}>Edit</button>
                              {h.status !== "inactive" && (
                                <button onClick={() => handleDeactivate(h.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Deactivate</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── PAYMENTS TAB ── */}
          {tab === "payments" && (
            <>
              {/* Header row with total + button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{
                  background: "#fff", borderRadius: 12, padding: "16px 24px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: "4px solid #16a34a"
                }}>
                  <div style={{ fontSize: 13, color: "#64748b" }}>Total Collected</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#16a34a" }}>
                    KES {Number(paymentsTotal).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => setShowAddPayment(true)} style={{
                  background: "#4361ee", color: "#fff", border: "none", borderRadius: 10,
                  padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}>+ Record Payment</button>
              </div>

              {/* Per-landlord summary */}
              {paymentSummary.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#1a1a2e" }}>Payment Summary by Landlord</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                    {paymentSummary.map(s => (
                      <div key={s.landlord_id} style={{
                        border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "14px 18px"
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 4 }}>{s.landlord_name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>📞 {s.phone}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>
                          KES {Number(s.total_paid).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                          {s.total_payments} payment{s.total_payments !== 1 ? "s" : ""}
                          {s.last_payment_date && ` · Last: ${new Date(s.last_payment_date).toLocaleDateString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full payment history table */}
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: "#1a1a2e" }}>Payment History</h3>
                </div>
                {payments.length === 0 ? (
                  <EmptyState icon="💰" title="No payments recorded" subtitle="Record your first landlord payment." />
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Landlord", "Phone", "Amount (KES)", "Description", "Date"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{p.landlord_name}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{p.landlord_phone}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
                            {Number(p.amount).toLocaleString()}
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 13, color: "#94a3b8" }}>{p.description || "—"}</td>
                          <td style={{ padding: "13px 16px", fontSize: 13, color: "#94a3b8" }}>
                            {new Date(p.payment_date).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: "#fff" }}>
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

      {/* ── ADD PAYMENT MODAL ── */}
      {showAddPayment && (
        <Modal title="Record Payment" onClose={() => setShowAddPayment(false)}>
          <form onSubmit={handleAddPayment}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>
                Landlord <span style={{ color: "#e53e3e" }}>*</span>
              </label>
              <select value={paymentForm.landlord_id} required
                onChange={e => setPaymentForm({ ...paymentForm, landlord_id: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: "#fff" }}>
                <option value="">-- Select Landlord --</option>
                {landlords.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select>
            </div>
            <FormField label="Amount (KES)" name="amount" type="number" min="1"
              placeholder="e.g. 5000" value={paymentForm.amount} required
              onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 5 }}>
                Description / Reason (optional)
              </label>
              <textarea value={paymentForm.description} rows={3}
                placeholder="e.g. January commission, registration fee..."
                onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", background: "#16a34a", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>{loading ? "Saving..." : "Record Payment"}</button>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}