// TaskAutomationBots\EmailAssistant\src\components\EmailModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

const EmailModal = ({ email, onClose, onSave }) => {
  const formatDeadline = (deadline) => {
    if (!deadline) return "";
    const d = new Date(deadline);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const [deadlineValue, setDeadlineValue] = useState(formatDeadline(email?.deadline));
  const [pinned, setPinned] = useState(email?.pinned || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDeadlineValue(formatDeadline(email?.deadline));
    setPinned(email?.pinned || false);
  }, [email]);

  if (!email) return null;

  const displayKeys = Object.keys(email).filter(
    (key) => key !== "pinned" && key !== "score"
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateEmailDeadline(email.id, deadlineValue);
      await api.updateEmailPin(email.id, pinned);

      email.deadline = deadlineValue;
      email.pinned = pinned;

      if (onSave) onSave(); // ✅ Refresh dashboard after saving
      onClose();
    } catch (err) {
      console.error("Failed to update email", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {email && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 50, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.5,
              opacity: { duration: 0.3 },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{email.subject || "-"}</h2>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Pinned
                </label>
              </div>

              {displayKeys.map((key) => {
                if (key === "subject") return null;
                let value = email[key];
                if (!value && value !== 0) value = "-";

                if (key === "deadline") {
                  return (
                    <p key={key} className="text-sm text-gray-700 mb-2 flex flex-col">
                      <strong className="mb-1">{key.replace("_", " ").toUpperCase()}:</strong>
                      <input
                        type="date"
                        value={deadlineValue}
                        onChange={(e) => setDeadlineValue(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-48"
                      />
                    </p>
                  );
                }

                return (
                  <p key={key} className="text-sm text-gray-700 mb-2">
                    <strong>{key.replace("_", " ").toUpperCase()}:</strong> {value}
                  </p>
                );
              })}

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    saving
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
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
