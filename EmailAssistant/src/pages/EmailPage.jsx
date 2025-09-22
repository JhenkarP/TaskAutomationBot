// TaskAutomationBots/EmailAssistant/src/pages/EmailPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { EmailMarquee } from "../components/EmailMarquee.jsx";
import TopNav from "../components/TopNav";
import BottomBar from "../components/BottomBar";
import { AnimatedList } from "../components/animated-list";

export default function EmailPage() {
  const [emails, setEmails] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [blockInput, setBlockInput] = useState("");
  const [vipList, setVipList] = useState([]);
  const [vipInput, setVipInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, vips: 0, blocked: 0, keywords: 0 });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchEmails(),
        fetchFirewall(),
        fetchVIPs(),
        fetchKeywords()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const data = await api.getEmails();
      const emailData = data || [];
      setEmails(emailData);
      setStats(prev => ({ ...prev, total: emailData.length }));
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    }
  };

  const fetchFirewall = async () => {
    try {
      const data = await api.getAllBlocked();
      const blockedData = Array.isArray(data.blocked) ? data.blocked : [];
      setBlocked(blockedData);
      setStats(prev => ({ ...prev, blocked: blockedData.length }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVIPs = async () => {
    try {
      const data = await api.listVIPs();
      const vipData = Array.isArray(data.vips) ? data.vips : [];
      setVipList(vipData);
      setStats(prev => ({ ...prev, vips: vipData.length }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKeywords = async () => {
    try {
      const data = await api.listKeywords();
      const keywordData = Array.isArray(data.keywords) ? data.keywords : [];
      setKeywords(keywordData);
      setStats(prev => ({ ...prev, keywords: keywordData.length }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBlocked = async () => {
    if (!blockInput.trim()) return;
    try {
      await api.blockIdentifier(blockInput.trim());
      setBlockInput("");
      await fetchFirewall();
    } catch (error) {
      console.error("Error adding blocked identifier:", error);
    }
  };

  const handleRemoveBlocked = async (id) => {
    try {
      await api.unblockIdentifier(id);
      await fetchFirewall();
    } catch (error) {
      console.error("Error removing blocked identifier:", error);
    }
  };

  const handleAddVIP = async () => {
    if (!vipInput.trim()) return;
    try {
      await api.addVIP(vipInput.trim());
      setVipInput("");
      await fetchVIPs();
    } catch (error) {
      console.error("Error adding VIP:", error);
    }
  };

  const handleRemoveVIP = async (email) => {
    try {
      await api.removeVIP(email);
      await fetchVIPs();
    } catch (error) {
      console.error("Error removing VIP:", error);
    }
  };

  const handleAddKeyword = async () => {
    if (!keywordInput.trim()) return;
    try {
      await api.addKeyword(keywordInput.trim());
      setKeywordInput("");
      await fetchKeywords();
    } catch (error) {
      console.error("Error adding keyword:", error);
    }
  };

  const handleRemoveKeyword = async (word) => {
    try {
      await api.removeKeyword(word);
      await fetchKeywords();
    } catch (error) {
      console.error("Error removing keyword:", error);
    }
  };

  const renderEnhancedList = (items, removeFn, emptyMessage, icon) => (
    <div className="flex-1 overflow-hidden">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <span className="text-2xl opacity-50">{icon}</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatedList>
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-blue-50 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md"
              >
                <span className="font-medium text-slate-700 group-hover:text-indigo-800 transition-colors truncate flex-1 mr-2">
                  {item}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFn(item)}
                  className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-200 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100"
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </AnimatedList>
        </div>
      )}
    </div>
  );

  const renderManagementCard = (title, subtitle, icon, gradient, items, input, setInput, onAdd, onRemove, placeholder, emptyMessage, emptyIcon) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="flex flex-col h-full">
        {/* Enhanced Header */}
        <div className={`px-6 py-4 bg-gradient-to-r ${gradient} border-b border-slate-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">{icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-white/80 text-sm">{subtitle}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold">
              {items.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {renderEnhancedList(items, onRemove, emptyMessage, emptyIcon)}

          {/* Add New Item */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onAdd()}
                  placeholder={placeholder}
                  className="w-full h-12 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-slate-400">↵</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdd}
                disabled={!input.trim()}
                className={`h-12 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  input.trim() 
                    ? `bg-gradient-to-r ${gradient} text-white hover:shadow-lg hover:shadow-indigo-200` 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>+</span>
                  <span>Add</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <TopNav />

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            <span className="text-sm text-slate-600 font-medium">Loading email management...</span>
          </div>
        </div>
      )}

      <motion.div
        className="flex-1 p-6 max-w-7xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Stats Overview */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Emails */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-indigo-200 text-sm font-medium mb-1">Total Emails</div>
                  <div className="text-white text-2xl font-bold">{stats.total.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">📧</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full bg-white/5"></div>
            </motion.div>

            {/* VIP Emails */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-amber-200 text-sm font-medium mb-1">VIP Contacts</div>
                  <div className="text-white text-2xl font-bold">{stats.vips}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">⭐</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full bg-white/5"></div>
            </motion.div>

            {/* Blocked */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-red-200 text-sm font-medium mb-1">Blocked</div>
                  <div className="text-white text-2xl font-bold">{stats.blocked}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">🚫</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full bg-white/5"></div>
            </motion.div>

            {/* Keywords */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-emerald-200 text-sm font-medium mb-1">Keywords</div>
                  <div className="text-white text-2xl font-bold">{stats.keywords}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">🔍</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full bg-white/5"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Email Marquee */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg text-white">📊</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Email Activity</h2>
                  <p className="text-sm text-slate-600">Live feed of your recent emails</p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <EmailMarquee emails={emails} />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderManagementCard(
            "Firewall Protection",
            "Block unwanted senders",
            "🛡️",
            "from-red-500 to-rose-600",
            blocked,
            blockInput,
            setBlockInput,
            handleAddBlocked,
            handleRemoveBlocked,
            "Enter email or domain to block...",
            "No blocked identifiers yet. Add emails or domains you want to block from reaching your inbox.",
            "🛡️"
          )}

          {renderManagementCard(
            "VIP Contacts",
            "Prioritize important senders",
            "⭐",
            "from-amber-500 to-orange-600",
            vipList,
            vipInput,
            setVipInput,
            handleAddVIP,
            handleRemoveVIP,
            "Enter VIP email address...",
            "No VIP contacts added yet. Add important contacts to ensure their emails get priority treatment.",
            "⭐"
          )}

          {renderManagementCard(
            "Smart Keywords",
            "Filter by content relevance",
            "🔍",
            "from-emerald-500 to-teal-600",
            keywords,
            keywordInput,
            setKeywordInput,
            handleAddKeyword,
            handleRemoveKeyword,
            "Enter keyword to track...",
            "No keywords set up yet. Add keywords to automatically categorize and prioritize emails by content.",
            "🔍"
          )}
        </div>

        {/* Enhanced Refresh Button */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadAllData}
            disabled={isLoading}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
              isLoading 
                ? 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Refresh All Data</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      <BottomBar currentPage="Emails" />
    </div>
  );
}