//TaskAutomationBots\EmailAssistant\src\AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LogsPage from "../pages/LogsPage.jsx";
import EmailPage from "../pages/EmailPage";
// import Firewall from "./pages/Firewall";
// import Network from "./pages/Network";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LogsPage />} />
      <Route path="/emails" element={<EmailPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* <Route path="/firewall" element={<Firewall />} /> */}
      {/* <Route path="/network" element={<Network />} /> */}
    </Routes>
  );
}
