//TaskAutomationBots\EmailAssistant\src\pages\Dashboard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import TopNav from "../components/TopNav";
import BottomBar from "../components/BottomBar";
import EmailCalendar from "../components/EmailCalendar";
import EmailModal from "../components/EmailModal";
import { calculateScore } from "../utils/scoreUtils";

export default function Dashboard() {
  const [totalEmails, setTotalEmails] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [emails, setEmails] = useState([]);
  const [pinnedEmails, setPinnedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const emailsData = await api.getEmails();
      const updatedEmails = (emailsData || []).map((email) => ({
        ...email,
        score: (email.score || 0) + calculateScore(email),
      }));

      setEmails(updatedEmails);
      setTotalEmails(updatedEmails.length);

      const blocked = await api.getAllBlocked();
      setBlockedCount(blocked.length);

      setPinnedEmails(updatedEmails.filter((e) => e.pinned));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinToggle = async (emailId) => {
    try {
      const email = emails.find((e) => e.id === emailId);
      if (!email) return;

      const newPinnedState = !email.pinned;
      await api.updateEmailPin(emailId, newPinnedState);

      const updatedEmails = emails.map((e) =>
        e.id === emailId ? { ...e, pinned: newPinnedState } : e
      );

      setEmails(updatedEmails);
      setPinnedEmails(updatedEmails.filter((e) => e.pinned));
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const handleDeadlineUpdate = async (emailId, newDeadline) => {
    try {
      await api.updateEmailDeadline(emailId, newDeadline);
      setEmails((prev) =>
        prev.map((e) =>
          e.id === emailId
            ? {
                ...e,
                deadline: newDeadline,
                score: (e.score || 0) + calculateScore({ ...e, deadline: newDeadline }),
              }
            : e
        )
      );
      setPinnedEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, deadline: newDeadline } : e))
      );
    } catch (error) {
      console.error("Error updating deadline:", error);
    }
  };

  const handleFetchEmails = async () => {
    setIsFetching(true);
    try {
      await api.fetchEmailsNow();
      await loadDashboardData();
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleEmailClick = (email) => setSelectedEmail(email);
  const closeEmailModal = () => setSelectedEmail(null);

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: "bg-red-500", text: "text-red-50", border: "border-red-200" };
    if (score >= 60) return { bg: "bg-orange-500", text: "text-orange-50", border: "border-orange-200" };
    if (score >= 40) return { bg: "bg-blue-500", text: "text-blue-50", border: "border-blue-200" };
    return { bg: "bg-green-500", text: "text-green-50", border: "border-green-200" };
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Overdue", color: "text-red-600 bg-red-50", pulse: true };
    if (diffDays === 0) return { text: "Due today", color: "text-orange-600 bg-orange-50", pulse: true };
    if (diffDays === 1) return { text: "Due tomorrow", color: "text-yellow-600 bg-yellow-50", pulse: false };
    if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-blue-600 bg-blue-50", pulse: false };
    return { text: `${diffDays} days left`, color: "text-gray-600 bg-gray-50", pulse: false };
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <TopNav />
      
      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            <span className="text-sm text-slate-600 font-medium">Loading dashboard...</span>
          </div>
        </div>
      )}

      <motion.div
        className="flex-1 p-6 flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Sidebar - Enhanced */}
        <motion.div
          className="xl:w-96 flex flex-col gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Premium Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            {/* Total Emails Stat */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-indigo-200 text-sm font-medium mb-1">Total Emails</div>
                  <div className="text-white text-3xl font-bold">{(totalEmails || 0).toLocaleString()}</div>
                  <div className="text-indigo-100 text-xs mt-1">Synced & organized</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                  <span className="text-2xl">📧</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-white/5"></div>
            </motion.div>

            {/* Blocked Emails Stat */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-red-200 text-sm font-medium mb-1">Blocked</div>
                  <div className="text-white text-3xl font-bold">{(blockedCount || 0).toLocaleString()}</div>
                  <div className="text-red-100 text-xs mt-1">Filtered out</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-white/5"></div>
            </motion.div>
          </div>

          {/* Enhanced Action Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-lg">🔄</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Email Sync</h3>
                  <p className="text-sm text-slate-500">Keep your emails updated</p>
                </div>
              </div>
              
              <button 
                onClick={handleFetchEmails} 
                className={`w-full h-12 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isFetching 
                    ? 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
                disabled={isFetching}
              >
                <div className="flex items-center justify-center gap-2">
                  {isFetching ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Refresh & Sync Emails</span>
                    </>
                  )}
                </div>
              </button>
              
              <div className="text-center mt-3">
                <span className="text-xs text-slate-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Premium Pinned Emails Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 flex-1 min-h-0 overflow-hidden hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-lg">📌</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg">Pinned Emails</h2>
                      <p className="text-sm text-slate-500">Quick access to important messages</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {pinnedEmails?.length || 0}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {pinnedEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <span className="text-3xl opacity-50">📌</span>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-2">No pinned emails</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      Pin important emails to keep them easily accessible from your dashboard
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pinnedEmails.map((email, index) => (
                      <motion.div
                        key={email.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-blue-50 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                        onClick={() => handleEmailClick(email)}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Subject */}
                            <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-indigo-800 transition-colors">
                              {email.subject}
                            </h3>
                            
                            {/* Sender */}
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              From: {email.sender || email.from}
                            </p>
                            
                            {/* Badges and Info */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {email.score && (
                                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getScoreColor(email.score).bg} ${getScoreColor(email.score).text}`}>
                                  Score: {email.score}
                                </div>
                              )}
                              
                              {email.deadline && (
                                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${formatDeadline(email.deadline).color} ${formatDeadline(email.deadline).pulse ? 'animate-pulse' : ''}`}>
                                  📅 {formatDeadline(email.deadline).text}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Menu */}
                          <div className="dropdown dropdown-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <label 
                              tabIndex={0} 
                              className="btn btn-ghost btn-sm btn-circle hover:bg-indigo-100 hover:text-indigo-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-white rounded-xl w-44 border border-slate-200">
                              <li>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEmailClick(email);
                                  }}
                                  className="text-sm hover:bg-indigo-50 hover:text-indigo-700 rounded-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Email
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePinToggle(email.id);
                                  }}
                                  className="text-sm hover:bg-red-50 hover:text-red-700 rounded-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Unpin Email
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Premium Calendar */}
        <motion.div
          className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 min-h-0 overflow-hidden hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex flex-col h-full">
            {/* Enhanced Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📆</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Email Calendar</h2>
                    <p className="text-sm text-slate-600">Visualize your email timeline and deadlines</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                  <span className="text-sm font-medium text-slate-600 mr-2">Priority:</span>
                  <div className="flex items-center gap-3">
                    <div className="tooltip" data-tip="High Priority (80+)">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-help">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                        <span className="text-xs font-medium text-red-700">High</span>
                      </div>
                    </div>
                    <div className="tooltip" data-tip="Medium Priority (60-79)">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-help">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                        <span className="text-xs font-medium text-orange-700">Med</span>
                      </div>
                    </div>
                    <div className="tooltip" data-tip="Low Priority (40-59)">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-help">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                        <span className="text-xs font-medium text-blue-700">Low</span>
                      </div>
                    </div>
                    <div className="tooltip" data-tip="Normal Priority (<40)">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-help">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                        <span className="text-xs font-medium text-green-700">Normal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm">📊</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{emails?.length || 0} Total Emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="text-sm">📌</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{pinnedEmails?.length || 0} Pinned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <span className="text-sm">⏰</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {emails?.filter(e => e.deadline && formatDeadline(e.deadline).pulse).length || 0} Urgent
                  </span>
                </div>
              </div>
            </div>
            
            {/* Calendar Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <EmailCalendar 
                emails={emails} 
                onEmailClick={handleEmailClick}
                className="h-full"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <BottomBar currentPage="Dashboard" />

      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          onClose={closeEmailModal}
          onSave={loadDashboardData}
          onPinToggle={handlePinToggle}
          onDeadlineUpdate={handleDeadlineUpdate}
        />
      )}
    </div>
  );
}