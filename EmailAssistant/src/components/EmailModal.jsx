// TaskAutomationBots/EmailAssistant/src/components/EmailModal.jsx
// TaskAutomationBots/EmailAssistant/src/components/EmailModal.jsx
import React from "react";
import { motion } from "framer-motion";

const EmailModal = ({ email, onClose }) => {
  if (!email) return null;

  // Get all keys except 'pinned' and 'score'
  const displayKeys = Object.keys(email).filter(
    (key) => key !== "pinned" && key !== "score"
  );

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50"
      onClick={onClose} // Close when clicking outside modal
    >
      <motion.div
        onClick={(e) => e.stopPropagation()} 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto relative"
      >
        <h2 className="text-2xl font-bold mb-4">{email.subject || "-"}</h2>

        {displayKeys.map((key) => {
          if (key === "subject") return null; 
          let value = email[key];

          if (key === "deadline" && value) {
            value = new Date(value).toLocaleDateString();
          }

          // Show '-' if value is null, undefined, or empty string
          if (!value && value !== 0) value = "-";

          return (
            <p key={key} className="text-sm text-gray-700 mb-2">
              <strong>{key.replace("_", " ").toUpperCase()}:</strong> {value}
            </p>
          );
        })}

        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default EmailModal;
