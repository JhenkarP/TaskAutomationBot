//TaskAutomationBots\EmailAssistant\src\AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LogsPage from "../pages/LogsPage.jsx";
import EmailPage from "../pages/EmailPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/logs" element={<LogsPage />} />
      <Route path="/emails" element={<EmailPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
