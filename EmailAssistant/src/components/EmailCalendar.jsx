// TaskAutomationBots/EmailAssistant/src/components/EmailCalendar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { getEventsByDate } from "../utils/calendarUtils";

export default function EmailCalendar({ emails, onEmailClick }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const eventsByDate = getEventsByDate(emails);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else setCurrentMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else setCurrentMonth(m => m + 1);
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline) return "bg-gray-100 text-gray-700";
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "bg-red-100 text-red-700";
    if (diffDays === 0) return "bg-orange-100 text-orange-700";
    if (diffDays === 1) return "bg-yellow-100 text-yellow-700";
    if (diffDays <= 7) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const renderDays = () => {
    const cells = [];

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${currentMonth}-${d}`;
      const events = eventsByDate[key] || [];

      cells.push(
        <motion.div
          key={key}
          className={`px-4 py-2 border rounded-lg cursor-pointer relative hover:shadow-lg transition
            ${events.length > 0 ? getDeadlineColor(events[0].deadline) : "bg-white text-gray-700"}
          `}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: d * 0.01 }}
          onClick={() => { if (events.length === 1) onEmailClick(events[0]); }}
        >
          <div className="text-sm font-medium">{d}</div>
          {events.length > 0 && (
            <div className="mt-1 text-xs font-semibold truncate">
              {events.length === 1 ? (
                <span className="underline cursor-pointer">{events[0].company}</span>
              ) : (
                <div className="flex flex-col gap-1">
                  {events.map((e, idx) => (
                    <span
                      key={idx}
                      className="underline cursor-pointer hover:text-blue-600"
                      onClick={() => onEmailClick(e)}
                      title={`${e.company} - ${e.subject}\nSender: ${e.sender_name} (${e.sender_email})`}
                    >
                      {e.company}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    return cells;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-full">
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">{monthNames[currentMonth]} {currentYear}</h2>
        <button
          onClick={handleNextMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          →
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-700 mb-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </div>
  );
}
