/**
 * App.jsx
 *
 * Central routing configuration.
 * All routes flow through here:
 *   / → LandingPage
 *   /login → Login
 *   /register/resident → ResidentRegister
 *   /register/agent → AgentRegister  (create when needed)
 *   /resident → ResidentDashboard  (protected, role=resident)
 *   /agent → AgentDashboard        (protected, role=agent)
 *   /admin → AdminDashboard        (protected, role=admin)
 */

/**
 * App.jsx
 * NOTE: BrowserRouter lives in main.jsx — do NOT add another one here.
 * This component only provides Routes.
 */

import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage       from "./pages/Landing";
import Login             from "./pages/Login";
import ResidentRegister  from "./pages/ResidentRegister";

// Dashboards
import ResidentDashboard from "./pages/dashboards/ResidentDashboard";
import AgentDashboard    from "./pages/dashboards/AgentDashboard";
import AdminDashboard    from "./pages/dashboards/AdminDashboard";

// Auth guard
import ProtectedRoute    from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ── Public routes ──────────────────────────────── */}
      <Route path="/"                  element={<LandingPage />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/register/resident" element={<ResidentRegister />} />

      {/* ── Protected dashboard routes ─────────────────── */}
      <Route
        path="/resident"
        element={
          <ProtectedRoute role="resident">
            <ResidentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent"
        element={
          <ProtectedRoute role="agent">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all → Landing ────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;