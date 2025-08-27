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
    <div className="w-full bg-gray-800 text-white flex justify-between items-center px-6 py-2 text-sm fixed bottom-0 left-0">
      {/* Left Side - Username & Page */}
      <div>
        <span className="font-semibold">Jhenkar P</span> | {currentPage}
      </div>

      {/* Right Side - Date & Time */}
      <div>{formattedDateTime}</div>
    </div>
  );
}
