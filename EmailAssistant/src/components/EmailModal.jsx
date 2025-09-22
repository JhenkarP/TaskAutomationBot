// // TaskAutomationBots\EmailAssistant\src\components\EmailModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

const EmailModal = ({ email, onClose, onSave, onPinToggle, onDeadlineUpdate }) => {
  const formatDeadline = (deadline) => {
    if (!deadline) return "";
    const d = new Date(deadline);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const [deadlineValue, setDeadlineValue] = useState(formatDeadline(email?.deadline));
  const [pinned, setPinned] = useState(email?.pinned || false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    setDeadlineValue(formatDeadline(email?.deadline));
    setPinned(email?.pinned || false);
    setActiveTab("details");
  }, [email]);

  if (!email) return null;

  const displayKeys = Object.keys(email).filter(
    (key) => !["pinned", "score", "id", "subject"].includes(key)
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      if (deadlineValue !== formatDeadline(email.deadline)) {
        await api.updateEmailDeadline(email.id, deadlineValue);
        if (onDeadlineUpdate) onDeadlineUpdate(email.id, deadlineValue);
      }
      if (pinned !== email.pinned) {
        await api.updateEmailPin(email.id, pinned);
        if (onPinToggle) onPinToggle(email.id);
      }
      email.deadline = deadlineValue;
      email.pinned = pinned;
      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error("Failed to update email", err);
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    if (!score)
      return { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
    if (score >= 80)
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        badge: "bg-red-500",
      };
    if (score >= 60)
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        badge: "bg-orange-500",
      };
    if (score >= 40)
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        badge: "bg-blue-500",
      };
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      badge: "bg-green-500",
    };
  };

  const formatFieldName = (key) =>
    key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  return (
    <AnimatePresence>
      {email && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {email.score && (
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(email.score).badge} text-white flex items-center gap-1`}
                        >
                          📊 Score: {email.score}
                        </div>
                      )}
                      {pinned && (
                        <div className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          📌 Pinned
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{email.subject || "No Subject"}</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    ✖
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-slate-200 bg-slate-50">
                <div className="flex">
                  {["details", "settings"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 ${
                        activeTab === tab
                          ? "border-indigo-500 text-indigo-600 bg-white"
                          : "border-transparent text-slate-600 hover:text-indigo-600 hover:bg-white/50"
                      }`}
                    >
                      {tab === "details" ? "📋 Details" : "⚙️ Settings"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area with Smooth Tab Transition */}
              <div className="flex-1 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {displayKeys.map((key) => (
                          <div key={key} className="bg-slate-50 rounded-2xl p-4 border">
                            <h3 className="font-semibold text-slate-800 text-sm mb-1">
                              {formatFieldName(key)}
                            </h3>
                            <p className="text-slate-600 text-sm">{String(email[key] || "-")}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Pin Option */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pinned}
                            onChange={(e) => setPinned(e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-amber-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-slate-700">
                            {pinned ? "Email is pinned" : "Pin this email"}
                          </span>
                        </label>
                      </div>

                      {/* Deadline Option */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border">
                        <input
                          type="date"
                          value={deadlineValue}
                          onChange={(e) => setDeadlineValue(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-slate-50 p-6 flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-transform duration-200 hover:scale-105"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-8 py-3 font-semibold rounded-xl transition-transform duration-200 hover:scale-105 ${
                    saving
                      ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  }`}
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailModal;
