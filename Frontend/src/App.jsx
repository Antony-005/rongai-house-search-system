import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResidentRegister from "./pages/ResidentRegister";
import AgentRegister from "./pages/AgentRegister";
import ResidentDashboard from "./pages/dashboards/ResidentDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/resident" element={<ResidentRegister />} />
      <Route path="/register/agent" element={<AgentRegister />} />

      <Route path="/resident" element={<ResidentDashboard />} />
      <Route path="/agent" element={<AgentDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;