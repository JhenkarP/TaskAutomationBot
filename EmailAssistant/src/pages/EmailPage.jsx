// TaskAutomationBots/EmailAssistant/src/pages/EmailPage.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { EmailMarquee } from "../components/EmailMarquee";
import TopNav from "../components/TopNav";
import BottomBar from "../components/BottomBar";

export default function EmailPage() {
  const [emails, setEmails] = useState([]);

  // Firewall
  const [blocked, setBlocked] = useState([]);
  const [blockInput, setBlockInput] = useState("");

  // VIP
  const [vipList, setVipList] = useState([]);
  const [vipInput, setVipInput] = useState("");

  // Keywords
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  // ---------------- Fetch Data ----------------
  const fetchEmails = async () => {
    try {
      const data = await api.getEmails();
      setEmails(data || []);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    }
  };

  const fetchFirewall = async () => {
    try {
      const data = await api.getAllBlocked();
      setBlocked(Array.isArray(data.blocked) ? data.blocked : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVIPs = async () => {
    try {
      const data = await api.listVIPs();
      setVipList(Array.isArray(data.vips) ? data.vips : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKeywords = async () => {
    try {
      const data = await api.listKeywords();
      setKeywords(Array.isArray(data.keywords) ? data.keywords : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchFirewall();
    fetchVIPs();
    fetchKeywords();
  }, []);

  // ---------------- Handlers ----------------
  const handleAddBlocked = async () => {
    if (!blockInput) return;
    await api.blockIdentifier(blockInput);
    setBlockInput("");
    fetchFirewall();
  };

  const handleRemoveBlocked = async (id) => {
    await api.unblockIdentifier(id);
    fetchFirewall();
  };

  const handleAddVIP = async () => {
    if (!vipInput) return;
    await api.addVIP(vipInput);
    setVipInput("");
    fetchVIPs();
  };

  const handleRemoveVIP = async (email) => {
    await api.removeVIP(email);
    fetchVIPs();
  };

  const handleAddKeyword = async () => {
    if (!keywordInput) return;
    await api.addKeyword(keywordInput);
    setKeywordInput("");
    fetchKeywords();
  };

  const handleRemoveKeyword = async (word) => {
    await api.removeKeyword(word);
    fetchKeywords();
  };

  // ---------------- Render ----------------
  const renderList = (items, removeFn) => (
    <ul className="space-y-2 max-h-48 overflow-y-auto">
      {items.map((item, idx) => (
        <li key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow">
          <span>{item}</span>
          <button
            onClick={() => removeFn(item)}
            className="text-red-500 font-bold ml-4"
          >
            &times;
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100">
      <TopNav />

      <div className="flex flex-col w-full p-4 gap-6 flex-1 overflow-auto">
        <EmailMarquee emails={emails} />

        {/* ---------------- Panels Side by Side ---------------- */}
        <div className="flex gap-4">
          {/* Firewall Panel */}
          <div className="flex-1 bg-gray-50 p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">Firewall Blocked Identifiers</h2>
            {renderList(blocked, handleRemoveBlocked)}
            <div className="flex mt-2">
              <input
                type="text"
                value={blockInput}
                onChange={(e) => setBlockInput(e.target.value)}
                placeholder="Add identifier"
                className="flex-1 border rounded px-2 py-1"
              />
              <button
                onClick={handleAddBlocked}
                className="ml-2 bg-blue-500 text-white px-3 rounded"
              >
                Add
              </button>
            </div>
          </div>

          {/* VIP Panel */}
          <div className="flex-1 bg-gray-50 p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">VIP Emails</h2>
            {renderList(vipList, handleRemoveVIP)}
            <div className="flex mt-2">
              <input
                type="text"
                value={vipInput}
                onChange={(e) => setVipInput(e.target.value)}
                placeholder="Add VIP email"
                className="flex-1 border rounded px-2 py-1"
              />
              <button
                onClick={handleAddVIP}
                className="ml-2 bg-blue-500 text-white px-3 rounded"
              >
                Add
              </button>
            </div>
          </div>

          {/* Keywords Panel */}
          <div className="flex-1 bg-gray-50 p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">Keywords</h2>
            {renderList(keywords, handleRemoveKeyword)}
            <div className="flex mt-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Add keyword"
                className="flex-1 border rounded px-2 py-1"
              />
              <button
                onClick={handleAddKeyword}
                className="ml-2 bg-blue-500 text-white px-3 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomBar currentPage="Emails" />
    </div>
  );
}
