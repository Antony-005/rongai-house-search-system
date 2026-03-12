/**
 * ProtectedRoute.jsx
 *
 * Wraps dashboard routes to ensure:
 *  1. The user has a valid token in localStorage.
 *  2. (Optional) The user's role matches the required role.
 *
 * Usage in App.jsx:
 *   <Route path="/resident" element={
 *     <ProtectedRoute role="resident"><ResidentDashboard /></ProtectedRoute>
 *   } />
 */

import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token      = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  const location   = useLocation();

  // No token — redirect to login, preserve intended destination
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists but wrong role — redirect to their correct dashboard
  if (role && storedRole !== role) {
    const roleMap = { resident: "/resident", agent: "/agent", admin: "/admin" };
    const dest    = roleMap[storedRole] || "/login";
    return <Navigate to={dest} replace />;
  }

  return children;
};

export default ProtectedRoute;