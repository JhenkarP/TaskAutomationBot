// TaskAutomationBots\EmailAssistant\src\services\api.js
const BASE_URL = "http://127.0.0.1:8000";

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getEmails: async () => {
    const res = await fetch(`${BASE_URL}/emails`);
    return handleResponse(res);
  },

  getPrioritizedEmails: async () => {
    const res = await fetch(`${BASE_URL}/emails/prioritized`);
    return handleResponse(res);
  },

  fetchEmailsNow: async () => {
    const res = await fetch(`${BASE_URL}/fetch-emails`, { method: "POST" });
    return handleResponse(res);
  },

  updateEmailDeadline: async (id, deadline) => {
    const res = await fetch(`${BASE_URL}/emails/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline }),
    });
    return handleResponse(res);
  },

  updateEmailPin: async (id, pinned) => {
    const res = await fetch(`${BASE_URL}/emails/pin/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    });
    return handleResponse(res);
  },

  addVIP: async (email) => {
    const res = await fetch(`${BASE_URL}/vip/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  removeVIP: async (email) => {
    const res = await fetch(`${BASE_URL}/vip/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  listVIPs: async () => {
    const res = await fetch(`${BASE_URL}/vip/list`);
    return handleResponse(res);
  },

  addKeyword: async (word) => {
    const res = await fetch(`${BASE_URL}/keyword/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    return handleResponse(res);
  },

  removeKeyword: async (word) => {
    const res = await fetch(`${BASE_URL}/keyword/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    return handleResponse(res);
  },

  listKeywords: async () => {
    const res = await fetch(`${BASE_URL}/keyword/list`);
    return handleResponse(res);
  },

  blockIdentifier: async (identifier) => {
    const res = await fetch(`${BASE_URL}/firewall/block/${identifier}`, { method: "POST" });
    return handleResponse(res);
  },

  unblockIdentifier: async (identifier) => {
    const res = await fetch(`${BASE_URL}/firewall/unblock/${identifier}`, { method: "POST" });
    return handleResponse(res);
  },

  checkIdentifier: async (identifier) => {
    const res = await fetch(`${BASE_URL}/firewall/check/${identifier}`);
    return handleResponse(res);
  },

  getAllBlocked: async () => {
    const res = await fetch(`${BASE_URL}/firewall/blocked`);
    return handleResponse(res);
  },

  pingHost: async (host) => {
    const res = await fetch(`${BASE_URL}/network/ping?host=${host}`);
    return handleResponse(res);
  },

  tcpCheck: async (host, port) => {
    const res = await fetch(`${BASE_URL}/network/tcp?host=${host}&port=${port}`);
    return handleResponse(res);
  },

  getInterfaces: async () => {
    const res = await fetch(`${BASE_URL}/network/interfaces`);
    return handleResponse(res);
  },

  getLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs`);
    return handleResponse(res);
  },

  resetDatabase: async () => {
    const res = await fetch(`${BASE_URL}/reset-db`, { method: "POST" });
    return handleResponse(res);
  },
};
