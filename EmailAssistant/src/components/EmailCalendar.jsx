// TaskAutomationBots/EmailAssistant/src/components/EmailCalendar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
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

  const renderDays = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${currentMonth}-${d}`;
      const events = eventsByDate[key] || [];

      cells.push(
        <Tooltip.Root key={d}>
          <Tooltip.Trigger asChild>
            <motion.div
              className="p-2 border rounded-lg hover:bg-blue-100 transition relative cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: d * 0.01 }}
              onClick={() => {
                if (events.length === 1) onEmailClick(events[0]);
              }}
            >
              <div className="text-sm font-medium">{d}</div>
              {events.length > 0 && (
                <div className="mt-1 text-xs text-blue-600 font-semibold">
                  {events.length === 1 ? events[0].company : `${events.length} events`}
                </div>
              )}
            </motion.div>
          </Tooltip.Trigger>

          {events.length > 0 && (
            <Tooltip.Content side="top">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="p-2 bg-gray-800 text-white rounded-lg text-sm max-w-xs"
              >
                {events.map((e, idx) => (
                  <div
                    key={idx}
                    className="mb-1 cursor-pointer hover:underline"
                    onClick={() => onEmailClick(e)}
                  >
                    <strong>{e.company}</strong> - {e.subject} <br />
                    Sender: {e.sender_name} ({e.sender_email})
                  </div>
                ))}
              </motion.div>
            </Tooltip.Content>
          )}
        </Tooltip.Root>
      );
    }

    return cells;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="px-2 py-1 bg-gray-200 rounded">←</button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button onClick={handleNextMonth} className="px-2 py-1 bg-gray-200 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-700 mb-2">
        <div>Sun</div><div>Mon</div><div>Tue</div>
        <div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </div>
  );
}
