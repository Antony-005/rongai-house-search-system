import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Shared UI ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderTop: `4px solid ${color}`,
      flex: 1, minWidth: 140
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
      {children}
    </h3>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      background: type === "success" ? "#22c55e" : "#ef4444",
      color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    }}>{message}</div>
  );
}

function Badge({ label, bg, color }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function TableWrap({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {children}
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, background: "#f8fafc", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children, bold, muted, green, nowrap }) {
  return (
    <td style={{
      padding: "12px 16px", fontSize: 13,
      fontWeight: bold ? 700 : 400,
      color: green ? "#16a34a" : muted ? "#94a3b8" : "#475569",
      whiteSpace: nowrap ? "nowrap" : "normal",
      borderTop: "1px solid #f1f5f9"
    }}>
      {children}
    </td>
  );
}

// ── Mini bar chart (CSS only, no library needed) ───────────────────────────────
function BarChart({ data, labelKey, valueKey, color = "#4361ee", formatValue }) {
  if (!data || data.length === 0) return <div style={{ color: "#94a3b8", fontSize: 13, padding: "12px 0" }}>No data available.</div>;
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 110, fontSize: 12, color: "#475569", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d[labelKey]}
          </div>
          <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 6, height: 20, position: "relative", overflow: "hidden" }}>
            <div style={{
              width: `${(Number(d[valueKey]) / max) * 100}%`,
              background: color, height: "100%", borderRadius: 6,
              transition: "width 0.5s ease", minWidth: 4
            }} />
          </div>
          <div style={{ width: 60, fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
            {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Donut stat row ─────────────────────────────────────────────────────────────
function StatRow({ items }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <div key={i} style={{
          flex: 1, minWidth: 110, background: item.bg || "#f8fafc",
          borderRadius: 10, padding: "14px 16px", textAlign: "center"
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Report section card ────────────────────────────────────────────────────────
function ReportCard({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

// ── REPORTS TAB ────────────────────────────────────────────────────────────────
function ReportsTab() {
  const [reportTab, setReportTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [housesReport, setHousesReport] = useState(null);
  const [bookingsReport, setBookingsReport] = useState(null);
  const [agentsReport, setAgentsReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reports/${type}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        if (type === "overview")  setOverview(data);
        if (type === "houses")    setHousesReport(data);
        if (type === "bookings")  setBookingsReport(data);
        if (type === "agents")    setAgentsReport(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReport(reportTab); }, [reportTab, fetchReport]);

  const reportTabs = [
    { key: "overview", label: "📋 Overview" },
    { key: "houses",   label: "🏠 Houses" },
    { key: "bookings", label: "📅 Bookings" },
    { key: "agents",   label: "👥 Agents" },
  ];

  const houseBadgeMap = (status, verified) => {
    if (status === "inactive") return { label: "Inactive", bg: "#fee2e2", color: "#dc2626" };
    if (!verified)             return { label: "Pending",  bg: "#fef9c3", color: "#ca8a04" };
    if (status === "booked")   return { label: "Booked",   bg: "#dbeafe", color: "#2563eb" };
    return { label: "Available", bg: "#dcfce7", color: "#16a34a" };
  };

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Report sub-tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {reportTabs.map(t => (
          <button key={t.key} onClick={() => setReportTab(t.key)} style={{
            padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            background: reportTab === t.key ? "#2563eb" : "#fff",
            color: reportTab === t.key ? "#fff" : "#475569",
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            transition: "all 0.2s"
          }}>{t.label}</button>
        ))}
        <button onClick={handlePrint} style={{
          marginLeft: "auto", padding: "9px 20px", borderRadius: 8,
          border: "1.5px solid #e2e8f0", cursor: "pointer",
          fontSize: 13, fontWeight: 600, background: "#fff", color: "#475569"
        }}>🖨 Print Report</button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>Loading report data...</div>
        </div>
      )}

      {/* ── OVERVIEW REPORT ── */}
      {!loading && reportTab === "overview" && overview && (
        <>
          <ReportCard title="System Summary">
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <StatCard icon="👥" label="Total Users"     value={overview.users.total}     color="#2563eb" />
              <StatCard icon="🏠" label="Total Listings"  value={overview.houses.total}    color="#7c3aed" />
              <StatCard icon="📅" label="Total Bookings"  value={overview.bookings.total}  color="#0891b2" />
              <StatCard icon="💰" label="Total Collected" value={`KES ${Number(overview.payments.total_collected).toLocaleString()}`} color="#16a34a" />
            </div>
          </ReportCard>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            <ReportCard title="User Breakdown">
              <StatRow items={[
                { label: "Residents", value: overview.users.residents, color: "#2563eb", bg: "#eff6ff" },
                { label: "Agents",    value: overview.users.agents,    color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Landlords", value: overview.users.landlords, color: "#0891b2", bg: "#ecfeff" },
              ]} />
            </ReportCard>

            <ReportCard title="House Status">
              <StatRow items={[
                { label: "Available",  value: overview.houses.available,            color: "#16a34a", bg: "#f0fdf4" },
                { label: "Booked",     value: overview.houses.booked,               color: "#2563eb", bg: "#eff6ff" },
                { label: "Pending",    value: overview.houses.pending_verification, color: "#d97706", bg: "#fffbeb" },
                { label: "Inactive",   value: overview.houses.inactive,             color: "#dc2626", bg: "#fef2f2" },
              ]} />
            </ReportCard>

            <ReportCard title="Booking Status">
              <StatRow items={[
                { label: "Pending",  value: overview.bookings.pending,  color: "#d97706", bg: "#fffbeb" },
                { label: "Approved", value: overview.bookings.approved, color: "#16a34a", bg: "#f0fdf4" },
                { label: "Rejected", value: overview.bookings.rejected, color: "#dc2626", bg: "#fef2f2" },
              ]} />
            </ReportCard>
          </div>

          <ReportCard title="Payment Summary">
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, color: "#64748b" }}>Total Records</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0891b2", marginTop: 4 }}>{overview.payments.total_records}</div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, color: "#64748b" }}>Total Amount Collected</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>
                  KES {Number(overview.payments.total_collected).toLocaleString()}
                </div>
              </div>
            </div>
          </ReportCard>
        </>
      )}

      {/* ── HOUSES REPORT ── */}
      {!loading && reportTab === "houses" && housesReport && (
        <>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <ReportCard title="Listings by Status">
                {(() => {
                  const statusData = [
                    { label: "Available (Verified)", value: housesReport.statusBreakdown.find(s => s.status === "available" && s.is_verified)?.count || 0, color: "#16a34a" },
                    { label: "Booked",               value: housesReport.statusBreakdown.find(s => s.status === "booked")?.count   || 0, color: "#2563eb" },
                    { label: "Pending Verification", value: housesReport.statusBreakdown.find(s => s.status === "available" && !s.is_verified)?.count || 0, color: "#d97706" },
                    { label: "Inactive",             value: housesReport.statusBreakdown.find(s => s.status === "inactive")?.count  || 0, color: "#dc2626" },
                  ];
                  return <BarChart data={statusData} labelKey="label" valueKey="value" color="#4361ee" />;
                })()}
              </ReportCard>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <ReportCard title="Price Range Distribution">
                <BarChart
                  data={housesReport.priceRanges}
                  labelKey="price_range"
                  valueKey="count"
                  color="#7c3aed"
                />
              </ReportCard>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <ReportCard title="Top Locations">
                <BarChart
                  data={housesReport.topLocations}
                  labelKey="location"
                  valueKey="count"
                  color="#0891b2"
                />
              </ReportCard>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <ReportCard title="Bedroom Distribution">
                <BarChart
                  data={housesReport.bedroomDist}
                  labelKey="bedrooms"
                  valueKey="count"
                  color="#16a34a"
                />
              </ReportCard>
            </div>
          </div>

          <ReportCard title="Listings Added Over Time (Last 6 Months)">
            {housesReport.listingsOverTime.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>No data for the last 6 months.</div>
            ) : (
              <BarChart
                data={housesReport.listingsOverTime}
                labelKey="month"
                valueKey="count"
                color="#4361ee"
              />
            )}
          </ReportCard>
        </>
      )}

      {/* ── BOOKINGS REPORT ── */}
      {!loading && reportTab === "bookings" && bookingsReport && (
        <>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <ReportCard title="Booking Status Distribution">
                <StatRow items={[
                  { label: "Pending",  value: bookingsReport.statusDist.find(s => s.status === "pending")?.count  || 0, color: "#d97706", bg: "#fffbeb" },
                  { label: "Approved", value: bookingsReport.statusDist.find(s => s.status === "approved")?.count || 0, color: "#16a34a", bg: "#f0fdf4" },
                  { label: "Rejected", value: bookingsReport.statusDist.find(s => s.status === "rejected")?.count || 0, color: "#dc2626", bg: "#fef2f2" },
                ]} />
              </ReportCard>
            </div>

            <div style={{ flex: 2, minWidth: 300 }}>
              <ReportCard title="Booking Activity (Last 6 Months)">
                {bookingsReport.bookingsOverTime.length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>No bookings in the last 6 months.</div>
                ) : (
                  <BarChart
                    data={bookingsReport.bookingsOverTime}
                    labelKey="month"
                    valueKey="total"
                    color="#2563eb"
                  />
                )}
              </ReportCard>
            </div>
          </div>

          <ReportCard title="Most Requested Houses">
            {bookingsReport.topHouses.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>No booking data yet.</div>
            ) : (
              <TableWrap>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["House", "Location", "Price (KES/mo)", "Total Requests", "Approved"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {bookingsReport.topHouses.map((h, i) => (
                      <tr key={i}>
                        <Td bold>{h.title}</Td>
                        <Td>{h.location}</Td>
                        <Td>{Number(h.price).toLocaleString()}</Td>
                        <Td bold>{h.total_bookings}</Td>
                        <Td green>{h.approved_bookings}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </ReportCard>

          <ReportCard title="Most Active Residents">
            {bookingsReport.topResidents.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>No resident activity yet.</div>
            ) : (
              <TableWrap>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Resident", "Email", "Phone", "Total Bookings"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {bookingsReport.topResidents.map((r, i) => (
                      <tr key={i}>
                        <Td bold>{r.full_name}</Td>
                        <Td muted>{r.email}</Td>
                        <Td muted>{r.phone || "—"}</Td>
                        <Td bold>{r.total_bookings}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </ReportCard>
        </>
      )}

      {/* ── AGENTS REPORT ── */}
      {!loading && reportTab === "agents" && agentsReport && (
        <>
          <ReportCard title="Landlord Recruitment (Last 6 Months)">
            {agentsReport.recruitmentOverTime.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>No recruitment data in the last 6 months.</div>
            ) : (
              <BarChart
                data={agentsReport.recruitmentOverTime}
                labelKey="month"
                valueKey="count"
                color="#7c3aed"
              />
            )}
          </ReportCard>

          <ReportCard title="Agent Performance Table">
            {agentsReport.agentPerformance.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>No agents registered yet.</div>
            ) : (
              <TableWrap>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Agent", "Area", "Landlords", "Listings", "Active", "Booked", "Payments", "Collected (KES)", "Joined"].map(h => <Th key={h}>{h}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {agentsReport.agentPerformance.map((a, i) => (
                      <tr key={i}>
                        <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{a.agent_name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.email}</div>
                        </td>
                        <Td muted>{a.assigned_area || "—"}</Td>
                        <Td bold>{a.total_landlords}</Td>
                        <Td>{a.total_listings}</Td>
                        <Td green>{a.active_listings}</Td>
                        <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ background: "#dbeafe", color: "#2563eb", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{a.booked_listings}</span>
                        </td>
                        <Td>{a.total_payments}</Td>
                        <Td bold green>
                          {Number(a.total_collected).toLocaleString()}
                        </Td>
                        <Td muted nowrap>{new Date(a.joined_date).toLocaleDateString()}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </ReportCard>
        </>
      )}
    </div>
  );
}

// ── MAIN ADMIN DASHBOARD ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [pendingHouses, setPendingHouses] = useState([]);
  const [allHouses, setAllHouses]         = useState([]);
  const [agents, setAgents]               = useState([]);
  const [bookings, setBookings]           = useState([]);
  const [payments, setPayments]           = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState([]);
  const [paymentsTotal, setPaymentsTotal]     = useState(0);
  const [toast, setToast]                     = useState(null);
  const [actionLoading, setActionLoading]     = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const fetchPending   = async () => { const r = await fetch(`${API}/admin/houses/pending`, { headers: authHeaders() }); const d = await r.json(); if (r.ok) setPendingHouses(d.houses); };
  const fetchAllHouses = async () => { const r = await fetch(`${API}/admin/houses`, { headers: authHeaders() }); const d = await r.json(); if (r.ok) setAllHouses(d.houses); };
  const fetchAgents    = async () => { const r = await fetch(`${API}/admin/agents`, { headers: authHeaders() }); const d = await r.json(); if (r.ok) setAgents(d.agents); };
  const fetchBookings  = async () => { const r = await fetch(`${API}/admin/bookings`, { headers: authHeaders() }); const d = await r.json(); if (r.ok) setBookings(d.bookings); };
  const fetchPayments  = async () => {
    const [rP, rS] = await Promise.all([
      fetch(`${API}/admin/payments`, { headers: authHeaders() }),
      fetch(`${API}/admin/payments/summary`, { headers: authHeaders() }),
    ]);
    const dP = await rP.json(); const dS = await rS.json();
    if (rP.ok) { setPayments(dP.payments); setPaymentsTotal(dP.total); }
    if (rS.ok) setPaymentsSummary(dS.summary);
  };

  useEffect(() => {
    fetchPending(); fetchAllHouses(); fetchAgents(); fetchBookings(); fetchPayments();
  }, []);

  const handleVerify = async (id) => {
    setActionLoading(id);
    const r = await fetch(`${API}/admin/houses/${id}/verify`, { method: "PATCH", headers: authHeaders() });
    const d = await r.json();
    if (r.ok) { notify("House verified!"); fetchPending(); fetchAllHouses(); }
    else notify(d.message || "Error.", "error");
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and deactivate this listing?")) return;
    setActionLoading(id);
    const r = await fetch(`${API}/admin/houses/${id}/reject`, { method: "PATCH", headers: authHeaders() });
    const d = await r.json();
    if (r.ok) { notify("Listing rejected."); fetchPending(); fetchAllHouses(); }
    else notify(d.message || "Error.", "error");
    setActionLoading(null);
  };

  const handleBookingStatus = async (id, status) => {
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} this booking?`)) return;
    setActionLoading(`b-${id}`);
    const r = await fetch(`${API}/admin/bookings/${id}/status`, {
      method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status })
    });
    const d = await r.json();
    if (r.ok) { notify(`Booking ${status}.`); fetchBookings(); fetchAllHouses(); }
    else notify(d.message || "Error.", "error");
    setActionLoading(null);
  };

  const verifiedCount   = allHouses.filter(h => h.is_verified).length;
  const pendingCount    = pendingHouses.length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const inactiveCount   = allHouses.filter(h => h.status === "inactive").length;

  const houseBadge = (h) => {
    if (h.status === "inactive") return { label: "Inactive",  bg: "#fee2e2", color: "#dc2626" };
    if (!h.is_verified)          return { label: "Pending",   bg: "#fef9c3", color: "#ca8a04" };
    if (h.status === "booked")   return { label: "Booked",    bg: "#dbeafe", color: "#2563eb" };
    return { label: "Verified", bg: "#dcfce7", color: "#16a34a" };
  };

  const tabs = [
    { key: "overview",      label: "📊 Overview" },
    { key: "verifications", label: "🔍 Verifications", badge: pendingCount },
    { key: "bookings",      label: "📅 Bookings",      badge: pendingBookings },
    { key: "payments",      label: "💰 Payments" },
    { key: "all-houses",    label: "🏠 All Houses" },
    { key: "agents",        label: "👥 Agents" },
    { key: "reports",       label: "📈 Reports" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@media print { aside { display: none !important; } main { padding: 16px !important; } }`}</style>
      <div style={{ display: "flex" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 234, minHeight: "100vh", background: "#0f172a",
          padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0
        }}>
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid #ffffff15" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>🏠 RongaiHomes</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Admin Control Panel</div>
          </div>
          <nav style={{ marginTop: 20 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 24px", background: tab === t.key ? "#2563eb" : "none",
                border: "none", color: tab === t.key ? "#fff" : "#94a3b8",
                fontSize: 14, cursor: "pointer", fontWeight: tab === t.key ? 600 : 400,
                transition: "all 0.2s", borderRadius: tab === t.key ? "0 8px 8px 0" : 0,
                position: "relative"
              }}>
                {t.label}
                {t.badge > 0 && (
                  <span style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "#ef4444", color: "#fff", borderRadius: 20,
                    padding: "2px 7px", fontSize: 11, fontWeight: 700
                  }}>{t.badge}</span>
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

        {/* ── Main Content ── */}
        <main style={{ flex: 1, padding: 32, overflowX: "auto", minWidth: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {{ overview: "Admin Overview", verifications: "Pending Verifications", bookings: "Booking Management", payments: "Payment Records", "all-houses": "All House Listings", agents: "Agent Management", reports: "System Reports" }[tab]}
            </h1>
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                <StatCard icon="🏠" label="Total Listings"   value={allHouses.length}  color="#2563eb" />
                <StatCard icon="✅" label="Verified"          value={verifiedCount}      color="#16a34a" />
                <StatCard icon="⏳" label="Pending Listings" value={pendingCount}       color="#d97706" />
                <StatCard icon="📅" label="Pending Bookings" value={pendingBookings}    color="#7c3aed" />
                <StatCard icon="💰" label="Total Collected"  value={`KES ${Number(paymentsTotal).toLocaleString()}`} color="#0891b2" />
                <StatCard icon="👥" label="Agents"           value={agents.length}      color="#db2777" />
              </div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {/* Pending verifications */}
                <div style={{ flex: 1, minWidth: 260, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <SectionTitle>Awaiting Verification</SectionTitle>
                    {pendingCount > 0 && <button onClick={() => setTab("verifications")} style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View All →</button>}
                  </div>
                  {pendingHouses.slice(0, 3).map(h => (
                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{h.title}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{h.location} · {h.agent_name}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleVerify(h.id)} disabled={actionLoading === h.id} style={{ background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✓</button>
                        <button onClick={() => handleReject(h.id)} disabled={actionLoading === h.id} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✗</button>
                      </div>
                    </div>
                  ))}
                  {pendingCount === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>All listings reviewed ✅</p>}
                </div>

                {/* Pending bookings */}
                <div style={{ flex: 1, minWidth: 260, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <SectionTitle>Pending Bookings</SectionTitle>
                    {pendingBookings > 0 && <button onClick={() => setTab("bookings")} style={{ background: "#f5f3ff", color: "#7c3aed", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View All →</button>}
                  </div>
                  {bookings.filter(b => b.status === "pending").slice(0, 3).map(b => (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{b.house_title}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{b.resident_name}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleBookingStatus(b.id, "approved")} disabled={actionLoading === `b-${b.id}`} style={{ background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✓</button>
                        <button onClick={() => handleBookingStatus(b.id, "rejected")} disabled={actionLoading === `b-${b.id}`} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✗</button>
                      </div>
                    </div>
                  ))}
                  {pendingBookings === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No pending bookings ✅</p>}
                </div>

                {/* Recent payments */}
                <div style={{ flex: 1, minWidth: 260, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <SectionTitle>Recent Payments</SectionTitle>
                    {payments.length > 0 && <button onClick={() => setTab("payments")} style={{ background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View All →</button>}
                  </div>
                  {payments.slice(0, 3).map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{p.landlord_name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.agent_name} · {new Date(p.payment_date).toLocaleDateString()}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 13 }}>KES {Number(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  {payments.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No payments yet.</p>}
                </div>
              </div>
            </>
          )}

          {/* ── VERIFICATIONS ── */}
          {tab === "verifications" && (
            <TableWrap>
              {pendingHouses.length === 0 ? <EmptyState icon="✅" title="No pending verifications" /> :
                pendingHouses.map(h => (
                  <div key={h.id} style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 5 }}>{h.title}</div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "#475569" }}>📍 {h.location}</span>
                        <span style={{ fontSize: 13, color: "#475569" }}>💰 KES {Number(h.price).toLocaleString()}/mo</span>
                        <span style={{ fontSize: 13, color: "#475569" }}>🛏 {h.bedrooms ?? "?"} · 🚿 {h.bathrooms ?? "?"}</span>
                        <span style={{ fontSize: 13, color: "#475569" }}>👤 {h.landlord_name}</span>
                        <span style={{ fontSize: 13, color: "#7c3aed" }}>🧑‍💼 {h.agent_name}</span>
                      </div>
                      {h.description && <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0 0" }}>{h.description}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleVerify(h.id)} disabled={actionLoading === h.id} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{actionLoading === h.id ? "..." : "✓ Verify"}</button>
                      <button onClick={() => handleReject(h.id)} disabled={actionLoading === h.id} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{actionLoading === h.id ? "..." : "✗ Reject"}</button>
                    </div>
                  </div>
                ))
              }
            </TableWrap>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "bookings" && (
            <TableWrap>
              {bookings.length === 0 ? <EmptyState icon="📅" title="No booking requests yet" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["House", "Location", "Resident", "Contact", "Notes", "Date", "Status", "Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <Td bold>{b.house_title}</Td>
                        <Td>{b.location}</Td>
                        <Td>{b.resident_name}</Td>
                        <Td muted>{b.resident_phone || b.resident_email}</Td>
                        <Td muted>{b.notes ? `"${b.notes}"` : "—"}</Td>
                        <Td muted nowrap>{new Date(b.booking_date).toLocaleDateString()}</Td>
                        <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                          <Badge
                            label={b.status}
                            bg={b.status === "approved" ? "#dcfce7" : b.status === "rejected" ? "#fee2e2" : "#fef9c3"}
                            color={b.status === "approved" ? "#16a34a" : b.status === "rejected" ? "#dc2626" : "#ca8a04"}
                          />
                        </td>
                        <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                          {b.status === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleBookingStatus(b.id, "approved")} disabled={actionLoading === `b-${b.id}`} style={{ background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Approve</button>
                              <button onClick={() => handleBookingStatus(b.id, "rejected")} disabled={actionLoading === `b-${b.id}`} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Reject</button>
                            </div>
                          ) : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableWrap>
          )}

          {/* ── PAYMENTS ── */}
          {tab === "payments" && (
            <>
              {paymentsSummary.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <SectionTitle>Collections by Agent</SectionTitle>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>Total: KES {Number(paymentsTotal).toLocaleString()}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {paymentsSummary.map((s, i) => (
                      <div key={i} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 3 }}>{s.agent_name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{s.agent_email}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>KES {Number(s.total_collected).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{s.total_payments} payments</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <TableWrap>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}><SectionTitle>All Payment Records</SectionTitle></div>
                {payments.length === 0 ? <EmptyState icon="💰" title="No payments recorded yet" /> : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Landlord", "Phone", "Agent", "Amount (KES)", "Description", "Date"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <Td bold>{p.landlord_name}</Td>
                          <Td muted>{p.landlord_phone}</Td>
                          <Td>{p.agent_name}</Td>
                          <Td bold green>{Number(p.amount).toLocaleString()}</Td>
                          <Td muted>{p.description || "—"}</Td>
                          <Td muted nowrap>{new Date(p.payment_date).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TableWrap>
            </>
          )}

          {/* ── ALL HOUSES ── */}
          {tab === "all-houses" && (
            <TableWrap>
              {allHouses.length === 0 ? <EmptyState icon="🏠" title="No listings found" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Title", "Location", "Price (KES)", "Agent", "Landlord", "Status"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {allHouses.map(h => {
                      const badge = houseBadge(h);
                      return (
                        <tr key={h.id}>
                          <Td bold>{h.title}</Td>
                          <Td>{h.location}</Td>
                          <Td>{Number(h.price).toLocaleString()}</Td>
                          <Td>{h.agent_name}</Td>
                          <Td>{h.landlord_name}</Td>
                          <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                            <Badge label={badge.label} bg={badge.bg} color={badge.color} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </TableWrap>
          )}

          {/* ── AGENTS ── */}
          {tab === "agents" && (
            <TableWrap>
              {agents.length === 0 ? <EmptyState icon="👥" title="No agents registered yet" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Agent Name", "Email", "Phone", "Area", "Landlords", "Houses", "Joined"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {agents.map(a => (
                      <tr key={a.id}>
                        <Td bold>{a.full_name}</Td>
                        <Td muted>{a.email}</Td>
                        <Td muted>{a.phone}</Td>
                        <Td muted>{a.assigned_area || "—"}</Td>
                        <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}><Badge label={a.total_landlords} bg="#eff6ff" color="#2563eb" /></td>
                        <td style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}><Badge label={a.total_houses} bg="#f0fdf4" color="#16a34a" /></td>
                        <Td muted nowrap>{new Date(a.created_at).toLocaleDateString()}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableWrap>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && <ReportsTab />}

        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}