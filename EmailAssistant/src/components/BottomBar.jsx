// TaskAutomationBots/EmailAssistant/src/components/BottomBar.jsx
import React, { useEffect, useState } from "react";

export default function BottomBar({ currentPage }) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = dateTime.toLocaleString();

  return (
    <div className="w-full bg-gray-900 text-white flex justify-between items-center px-6 py-2 text-sm fixed bottom-0 left-0 shadow-lg">
      {/* Left Side - Username & Page */}
      <div className="flex items-center gap-2">
        <span className="font-semibold hover:text-blue-400 transition-colors cursor-default">
          Jhenkar P
        </span>
        <span>|</span>
        <span className="text-gray-300">{currentPage}</span>
      </div>

      {/* Right Side - Date & Time */}
      <div className="text-gray-300">{formattedDateTime}</div>
    </div>
  );
}
