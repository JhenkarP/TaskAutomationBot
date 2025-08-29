//TaskAutomationBots\EmailAssistant\src/pages\LogsPage.jsx
import React, { useEffect, useState } from "react";
import { AnimatedList } from "@/components/animated-list";
import TopNav from "../components/TopNav";
import BottomBar from "../components/BottomBar";
import { api } from "../services/api";
import { cn } from "@/lib/utils";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const data = await api.getLogs();
    setLogs(data.logs || []);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex-1 p-4 flex flex-col items-center">
        <div
          className={cn(
            "relative border rounded-xl p-2 bg-gray-50 dark:bg-gray-900 overflow-hidden",
            "w-full min-w-md h-[520px]" // fixed size
          )}
        >
          <AnimatedList className="w-full overflow-y-auto">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-3 mb-1 transition-all duration-200 ease-in-out",
                  "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                  "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
                )}
              >
                <p className="text-xs font-mono dark:text-white/70">{log}</p>
              </div>
            ))}
          </AnimatedList>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background" />
        </div>
      </div>
      <BottomBar currentPage="Logs" />
    </div>
  );
};

export default LogsPage;
