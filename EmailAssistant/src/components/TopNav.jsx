// TaskAutomationBots/EmailAssistant/src/components/TopNav.jsx
import { NavLink } from "react-router-dom";

export default function TopNav() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Emails", path: "/emails" },
    { name: "Firewall", path: "/firewall" },
    { name: "Network", path: "/network" },
    { name: "Logs", path: "/" },
  ];

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="text-lg font-bold">Email Assistant</div>
      <div className="flex space-x-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `hover:text-blue-400 transition ${
                isActive ? "text-blue-400 font-semibold" : "text-gray-300"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
