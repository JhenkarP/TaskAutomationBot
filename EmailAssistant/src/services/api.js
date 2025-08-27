// TaskAutomationBots/EmailAssistant/src/services/api.js
const BASE_URL = "http://127.0.0.1:8000";

export const api = {
  // ----------------- Email Routes -----------------
  getEmails: async () => {
    const res = await fetch(`${BASE_URL}/emails`);
    return res.json();
  },

  getPrioritizedEmails: async () => {
    const res = await fetch(`${BASE_URL}/emails/prioritized`);
    return res.json();
  },

  fetchEmailsNow: async () => {
    const res = await fetch(`${BASE_URL}/fetch-emails`);
    return res.json();
  },

  updateEmailDeadline: async (id, deadline) => {
    const res = await fetch(`${BASE_URL}/emails/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline }),
    });
    return res.json();
  },

  updateEmailPin: async (id, pinned) => {
    const res = await fetch(`${BASE_URL}/emails/pin/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    });
    return res.json();
  },

  // ----------------- VIP Routes -----------------
  addVIP: async (email) => {
    const res = await fetch(`${BASE_URL}/vip/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  removeVIP: async (email) => {
    const res = await fetch(`${BASE_URL}/vip/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  listVIPs: async () => {
    const res = await fetch(`${BASE_URL}/vip/list`);
    return res.json();
  },

  // ----------------- Keywords Routes -----------------
  addKeyword: async (word) => {
    const res = await fetch(`${BASE_URL}/keyword/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    return res.json();
  },

  removeKeyword: async (word) => {
    const res = await fetch(`${BASE_URL}/keyword/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    return res.json();
  },

  listKeywords: async () => {
    const res = await fetch(`${BASE_URL}/keyword/list`);
    return res.json();
  },

  // ----------------- Firewall Routes -----------------
  blockIdentifier: async (identifier) => {
    const res = await fetch(`${BASE_URL}/firewall/block/${identifier}`, {
      method: "POST",
    });
    return res.json();
  },

  unblockIdentifier: async (identifier) => {
    const res = await fetch(`${BASE_URL}/firewall/unblock/${identifier}`, {
      method: "POST",
    });
    return res.json();
  },

  checkIdentifier: async (identifier) => {
    const res = await fetch(`${BASE_URL}/firewall/check/${identifier}`);
    return res.json();
  },

  getAllBlocked: async () => {
    const res = await fetch(`${BASE_URL}/firewall/blocked`);
    return res.json();
  },

  // ----------------- Network Routes -----------------
  pingHost: async (host) => {
    const res = await fetch(`${BASE_URL}/network/ping?host=${host}`);
    return res.json();
  },

  tcpCheck: async (host, port) => {
    const res = await fetch(`${BASE_URL}/network/tcp?host=${host}&port=${port}`);
    return res.json();
  },

  getInterfaces: async () => {
    const res = await fetch(`${BASE_URL}/network/interfaces`);
    return res.json();
  },

  // ----------------- Logs -----------------
  getLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs`);
    return res.json();
  },

  // ----------------- Other -----------------
  resetDatabase: async () => {
    const res = await fetch(`${BASE_URL}/reset-db`, { method: "POST" });
    return res.json();
  },
};
