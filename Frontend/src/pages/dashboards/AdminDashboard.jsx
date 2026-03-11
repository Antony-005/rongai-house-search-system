import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "22px 28px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderTop: `4px solid ${color}`,
      flex: 1, minWidth: 160
    }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
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

// ── Main Dashboard ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [pendingHouses, setPendingHouses] = useState([]);
  const [allHouses, setAllHouses] = useState([]);
  const [agents, setAgents] = useState([]);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // house id being processed

  const notify = (message, type = "success") => setToast({ message, type });

  const fetchPending = async () => {
    const res = await fetch(`${API}/admin/houses/pending`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setPendingHouses(data.houses);
  };

  const fetchAllHouses = async () => {
    const res = await fetch(`${API}/admin/houses`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setAllHouses(data.houses);
  };

  const fetchAgents = async () => {
    const res = await fetch(`${API}/admin/agents`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setAgents(data.agents);
  };

  useEffect(() => {
    fetchPending();
    fetchAllHouses();
    fetchAgents();
  }, []);

  const handleVerify = async (id) => {
    setActionLoading(id);
    const res = await fetch(`${API}/admin/houses/${id}/verify`, {
      method: "PATCH", headers: authHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      notify("House verified and listed publicly!");
      fetchPending();
      fetchAllHouses();
    } else {
      notify(data.message || "Error.", "error");
    }
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and deactivate this listing?")) return;
    setActionLoading(id);
    const res = await fetch(`${API}/admin/houses/${id}/reject`, {
      method: "PATCH", headers: authHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      notify("Listing rejected.");
      fetchPending();
      fetchAllHouses();
    } else {
      notify(data.message || "Error.", "error");
    }
    setActionLoading(null);
  };

  // Stats
  const verifiedCount = allHouses.filter(h => h.is_verified).length;
  const pendingCount = pendingHouses.length;
  const inactiveCount = allHouses.filter(h => h.status === "inactive").length;

  const tabs = ["overview", "verifications", "all-houses", "agents"];

  const statusBadge = (h) => {
    if (h.status === "inactive") return { label: "Inactive", bg: "#fee2e2", color: "#dc2626" };
    if (!h.is_verified) return { label: "Pending", bg: "#fef9c3", color: "#ca8a04" };
    if (h.status === "booked") return { label: "Booked", bg: "#dbeafe", color: "#2563eb" };
    return { label: "Verified", bg: "#dcfce7", color: "#16a34a" };
  };

  const tabLabel = {
    overview: "📊 Overview",
    verifications: "🔍 Verifications",
    "all-houses": "🏠 All Houses",
    agents: "👥 Agents",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <aside style={{
          width: 230, minHeight: "100vh", background: "#0f172a",
          padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0
        }}>
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>🏠 RongaiHomes</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Admin Control Panel</div>
          </div>
          <nav style={{ marginTop: 20 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 24px", background: tab === t ? "#2563eb" : "none",
                border: "none", color: tab === t ? "#fff" : "#94a3b8",
                fontSize: 14, cursor: "pointer", fontWeight: tab === t ? 600 : 400,
                transition: "all 0.2s", borderRadius: tab === t ? "0 8px 8px 0" : 0,
                position: "relative"
              }}>
                {tabLabel[t]}
                {t === "verifications" && pendingCount > 0 && (
                  <span style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    background: "#ef4444", color: "#fff", borderRadius: 20, padding: "2px 8px",
                    fontSize: 11, fontWeight: 700
                  }}>{pendingCount}</span>
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

        {/* Main Content */}
        <main style={{ flex: 1, padding: 32, overflowX: "auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {tab === "overview" ? "Admin Overview"
                : tab === "verifications" ? "Pending Verifications"
                : tab === "all-houses" ? "All House Listings"
                : "Agent Management"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {tab === "overview" ? "System-wide statistics"
                : tab === "verifications" ? "Review and approve or reject new house listings"
                : tab === "all-houses" ? "View all listings across the system"
                : "View and monitor all registered agents"}
            </p>
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
                <StatCard icon="🏠" label="Total Listings" value={allHouses.length} color="#2563eb" />
                <StatCard icon="✅" label="Verified Houses" value={verifiedCount} color="#16a34a" />
                <StatCard icon="⏳" label="Pending Review" value={pendingCount} color="#d97706" />
                <StatCard icon="🚫" label="Inactive" value={inactiveCount} color="#dc2626" />
                <StatCard icon="👥" label="Total Agents" value={agents.length} color="#7c3aed" />
              </div>

              {/* Recent pending */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Awaiting Verification</h3>
                  {pendingCount > 0 && (
                    <button onClick={() => setTab("verifications")} style={{
                      background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8,
                      padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600
                    }}>View All →</button>
                  )}
                </div>
                {pendingHouses.slice(0, 4).map(h => (
                  <div key={h.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0", borderBottom: "1px solid #f1f5f9"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{h.title}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{h.location} · Agent: {h.agent_name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleVerify(h.id)} disabled={actionLoading === h.id} style={{
                        background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6,
                        padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600
                      }}>Verify</button>
                      <button onClick={() => handleReject(h.id)} disabled={actionLoading === h.id} style={{
                        background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6,
                        padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600
                      }}>Reject</button>
                    </div>
                  </div>
                ))}
                {pendingCount === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>No pending listings. All caught up! ✅</p>}
              </div>
            </>
          )}

          {/* ── VERIFICATIONS TAB ── */}
          {tab === "verifications" && (
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              {pendingHouses.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>No pending verifications</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>All listings have been reviewed.</div>
                </div>
              ) : (
                pendingHouses.map(h => (
                  <div key={h.id} style={{
                    padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 6 }}>{h.title}</div>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "#475569" }}>📍 {h.location}</span>
                        <span style={{ fontSize: 13, color: "#475569" }}>💰 KES {Number(h.price).toLocaleString()}/mo</span>
                        <span style={{ fontSize: 13, color: "#475569" }}>🛏 {h.bedrooms ?? "?"} bed · 🚿 {h.bathrooms ?? "?"} bath</span>
                        <span style={{ fontSize: 13, color: "#475569" }}>👤 Landlord: {h.landlord_name}</span>
                        <span style={{ fontSize: 13, color: "#7c3aed" }}>🧑‍💼 Agent: {h.agent_name}</span>
                      </div>
                      {h.description && (
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.5 }}>{h.description}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleVerify(h.id)} disabled={actionLoading === h.id} style={{
                        background: "#16a34a", color: "#fff", border: "none", borderRadius: 8,
                        padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600
                      }}>{actionLoading === h.id ? "..." : "✓ Verify"}</button>
                      <button onClick={() => handleReject(h.id)} disabled={actionLoading === h.id} style={{
                        background: "#dc2626", color: "#fff", border: "none", borderRadius: 8,
                        padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600
                      }}>{actionLoading === h.id ? "..." : "✗ Reject"}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── ALL HOUSES TAB ── */}
          {tab === "all-houses" && (
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Title", "Location", "Price (KES)", "Agent", "Landlord", "Status"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allHouses.map(h => {
                    const badge = statusBadge(h);
                    return (
                      <tr key={h.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{h.title}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{h.location}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{Number(h.price).toLocaleString()}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{h.agent_name}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#475569" }}>{h.landlord_name}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {allHouses.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No house listings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── AGENTS TAB ── */}
          {tab === "agents" && (
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Agent Name", "Email", "Phone", "Area", "Landlords", "Houses", "Joined"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{a.full_name}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569" }}>{a.email}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569" }}>{a.phone}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569" }}>{a.assigned_area || "—"}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{a.total_landlords}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{a.total_houses}</span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {agents.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No agents registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}