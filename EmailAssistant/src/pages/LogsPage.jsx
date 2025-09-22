//TaskAutomationBots\EmailAssistant\src/pages\LogsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedList } from "@/components/animated-list";
import TopNav from "../components/TopNav";
import BottomBar from "../components/BottomBar";
import { api } from "../services/api";
import { cn } from "@/lib/utils";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    success: 0
  });
  const logsContainerRef = useRef(null);
  const intervalRef = useRef(null);

  const getLogLevel = (log) => {
    const logStr = log.toLowerCase();
    if (logStr.includes('error') || logStr.includes('failed') || logStr.includes('exception')) return 'error';
    if (logStr.includes('warning') || logStr.includes('warn')) return 'warning';
    if (logStr.includes('success') || logStr.includes('completed') || logStr.includes('done')) return 'success';
    return 'info';
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error': return {
        bg: 'from-red-50 to-red-100',
        border: 'border-red-200',
        text: 'text-red-800',
        accent: 'bg-red-500'
      };
      case 'warning': return {
        bg: 'from-amber-50 to-yellow-100',
        border: 'border-amber-200',
        text: 'text-amber-800',
        accent: 'bg-amber-500'
      };
      case 'success': return {
        bg: 'from-emerald-50 to-green-100',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        accent: 'bg-emerald-500'
      };
      default: return {
        bg: 'from-blue-50 to-indigo-100',
        border: 'border-blue-200',
        text: 'text-blue-800',
        accent: 'bg-blue-500'
      };
    }
  };

  const formatTimestamp = (logEntry, index) => {
    // Simple timestamp generation for demo - in real app this would come from the log
    const now = new Date();
    const timestamp = new Date(now.getTime() - (logs.length - index) * 1000);
    return timestamp.toLocaleTimeString();
  };

  const calculateStats = (logsList) => {
    const stats = {
      total: logsList.length,
      errors: 0,
      warnings: 0,
      info: 0,
      success: 0
    };

    logsList.forEach(log => {
      const level = getLogLevel(log);
      stats[level]++;
    });

    return stats;
  };

  const filterLogs = (logsList, search, level) => {
    let filtered = logsList;

    if (search) {
      filtered = filtered.filter(log => 
        log.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (level !== 'all') {
      filtered = filtered.filter(log => getLogLevel(log) === level);
    }

    return filtered;
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLogs();
      const newLogs = data.logs || [];
      setLogs(newLogs);
      setStats(calculateStats(newLogs));
      setFilteredLogs(filterLogs(newLogs, searchTerm, logLevel));
      
      // Auto-scroll to bottom if live mode is enabled
      if (isLive && logsContainerRef.current) {
        setTimeout(() => {
          logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }, 100);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
    if (!isLive) {
      // Resume live updates
      intervalRef.current = setInterval(fetchLogs, 5000);
    } else {
      // Pause live updates
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const clearLogs = async () => {
    try {
      // In a real app, you'd have an API endpoint to clear logs
      setLogs([]);
      setFilteredLogs([]);
      setStats({ total: 0, errors: 0, warnings: 0, info: 0, success: 0 });
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  const exportLogs = () => {
    const logText = filteredLogs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-assistant-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
    if (isLive) {
      intervalRef.current = setInterval(fetchLogs, 5000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFilteredLogs(filterLogs(logs, searchTerm, logLevel));
  }, [logs, searchTerm, logLevel]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <TopNav />
      
      <motion.div
        className="flex-1 p-6 max-w-7xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Header with Stats */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📝</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">System Logs</h1>
                  <p className="text-slate-600">Monitor your email assistant's activity in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                  {isLive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-emerald-500"
                    ></motion.div>
                  )}
                  <span className={`text-sm font-medium ${isLive ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isLive ? 'Live' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <motion.div 
                  className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total</div>
                      <div className="text-slate-800 text-2xl font-bold">{stats.total}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-red-500 text-xs font-medium uppercase tracking-wide">Errors</div>
                      <div className="text-red-600 text-2xl font-bold">{stats.errors}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <span className="text-lg">🚨</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-amber-500 text-xs font-medium uppercase tracking-wide">Warnings</div>
                      <div className="text-amber-600 text-2xl font-bold">{stats.warnings}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <span className="text-lg">⚠️</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-emerald-500 text-xs font-medium uppercase tracking-wide">Success</div>
                      <div className="text-emerald-600 text-2xl font-bold">{stats.success}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-lg">✅</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-500 text-xs font-medium uppercase tracking-wide">Info</div>
                      <div className="text-blue-600 text-2xl font-bold">{stats.info}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-lg">ℹ️</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                    className="h-12 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-700 cursor-pointer appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem 1rem'
                    }}
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Errors Only</option>
                    <option value="warning">Warnings Only</option>
                    <option value="success">Success Only</option>
                    <option value="info">Info Only</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLiveMode}
                  className={`h-12 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    isLive 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{isLive ? '⏸️' : '▶️'}</span>
                    <span className="hidden sm:inline">{isLive ? 'Pause' : 'Resume'}</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportLogs}
                  disabled={filteredLogs.length === 0}
                  className="h-12 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <span>💾</span>
                    <span className="hidden sm:inline">Export</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearLogs}
                  className="h-12 px-4 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <span>🗑️</span>
                    <span className="hidden sm:inline">Clear</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Logs Container */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -2 }}
        >
          {/* Container Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <span className="text-lg text-white">💻</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Live Log Stream</h2>
                  <p className="text-sm text-slate-600">
                    Showing {filteredLogs.length} of {logs.length} log entries
                  </p>
                </div>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm font-medium">Updating...</span>
                </div>
              )}
            </div>
          </div>

          {/* Logs Display */}
          <div className="relative">
            <div
              ref={logsContainerRef}
              className="h-[600px] overflow-y-auto p-4 space-y-2 bg-slate-50/50"
            >
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <span className="text-3xl opacity-50">📝</span>
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-2">No logs available</h3>
                  <p className="text-sm text-slate-500 max-w-md">
                    {searchTerm || logLevel !== 'all' 
                      ? "No logs match your current filters. Try adjusting your search or filter settings."
                      : "System logs will appear here as your email assistant processes activities."
                    }
                  </p>
                </div>
              ) : (
                <AnimatedList className="space-y-2">
                  {filteredLogs.map((log, idx) => {
                    const level = getLogLevel(log);
                    const colors = getLogColor(level);
                    const icon = getLogIcon(level);
                    const timestamp = formatTimestamp(log, idx);

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "relative group bg-gradient-to-r rounded-xl p-4 border transition-all duration-300 hover:shadow-md",
                          colors.bg,
                          colors.border,
                          "hover:scale-[1.01] cursor-pointer"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Indicator */}
                          <div className="flex-shrink-0 flex flex-col items-center gap-1">
                            <div className={cn("w-3 h-3 rounded-full", colors.accent)}></div>
                            <div className="w-px h-8 bg-slate-200 group-last:hidden"></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{icon}</span>
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {level}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500 font-mono">
                                {timestamp}
                              </span>
                            </div>
                            <p className={cn("text-sm font-mono leading-relaxed break-words", colors.text)}>
                              {log}
                            </p>
                          </div>

                          {/* Copy Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigator.clipboard.writeText(log)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/50 hover:bg-white/80 text-slate-500 hover:text-slate-700"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatedList>
              )}
            </div>

            {/* Fade Gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50/80 to-transparent" />
          </div>
        </motion.div>
      </motion.div>

      <BottomBar currentPage="Logs" />
    </div>
  );
};

export default LogsPage;