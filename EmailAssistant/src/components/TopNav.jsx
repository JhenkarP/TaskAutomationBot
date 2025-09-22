// TaskAutomationBots/EmailAssistant/src/components/TopNav.jsx
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Emails", path: "/emails" },
    { name: "Logs", path: "/logs" },
  ];

  return (
    <div className="navbar bg-gray-900 text-white shadow-md px-4">
      {/* Left Section: Brand */}
      <div className="flex-1">
        <NavLink
          to="/dashboard"
          className="text-xl font-bold tracking-wide hover:text-blue-400 transition"
        >
          📧 Email Assistant
        </NavLink>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-blue-500 text-white shadow-md scale-105"
                  : "hover:bg-gray-800 hover:text-blue-400"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-md hover:bg-gray-800 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-gray-800 rounded-xl shadow-lg p-3 flex flex-col gap-3 w-40 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-700 hover:text-blue-400"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
