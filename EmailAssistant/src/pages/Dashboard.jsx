// TaskAutomationBots/EmailAssistant/src/pages/Dashboard.jsx
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
      await api.updateDeadline(emailId, { deadline: newDeadline });
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
    } catch (error) {
      console.error("Error updating deadline:", error);
    }
  };

  const handleFetchEmails = async () => {
    try {
      await api.fetchEmailsNow();
      loadDashboardData();
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const closeEmailModal = () => {
    setSelectedEmail(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <motion.div
        className="flex-1 p-4 bg-gray-50 flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left panel */}
        <motion.div
          className="w-1/3 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-4 bg-white rounded-2xl shadow text-center">
            <h2 className="text-lg font-semibold">Total Emails</h2>
            <p className="text-3xl mt-2">{totalEmails}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl shadow text-center">
            <h2 className="text-lg font-semibold">Blocked Emails</h2>
            <p className="text-3xl mt-2">{blockedCount}</p>
          </div>
          <button
            onClick={handleFetchEmails}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Fetch Emails
          </button>

          {/* Pinned Emails */}
          <div className="p-4 bg-white rounded-2xl shadow mt-4 h-64 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Pinned Emails</h2>
            {pinnedEmails.length === 0 ? (
              <p className="text-gray-500 text-sm">No pinned emails</p>
            ) : (
              <ul className="space-y-2">
                {pinnedEmails.map((email) => (
                  <li
                    key={email.id}
                    className="p-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition flex justify-between items-center cursor-pointer"
                    onClick={() => handleEmailClick(email)}
                  >
                    <div>
                      <strong>{email.subject}</strong>
                      {email.deadline && (
                        <p className="text-xs text-gray-600">
                          Deadline: {new Date(email.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinToggle(email.id);
                      }}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {email.pinned ? "Unpin" : "Pin"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {/* Right panel - Calendar */}
        <motion.div
          className="flex-1 p-4 bg-white rounded-2xl shadow overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EmailCalendar emails={emails} onEmailClick={handleEmailClick} />
        </motion.div>
      </motion.div>

      <BottomBar currentPage="Dashboard" />

      {/* Modal */}
      <EmailModal email={selectedEmail} onClose={closeEmailModal} />
    </div>
  );
}
