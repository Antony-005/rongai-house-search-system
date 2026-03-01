import { Routes, Route } from "react-router-dom";
import ResidentRegister from "./pages/ResidentRegister";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ResidentRegister />} />
    </Routes>
  );
}

export default App;