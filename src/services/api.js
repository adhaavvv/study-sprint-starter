// src/services/api.js
const API_URL =
  process.env.REACT_APP_API_URL || "https://onlinestudysprintwebservice1.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // not JSON
  }

  if (res.status === 401) {
    // token missing/expired -> force logout
    localStorage.removeItem("token");
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || text || `HTTP ${res.status}`);
  }

  return data;
}

// ---------- Auth ----------
export async function register(credentials) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials), // { username, password }
  });
  return handleResponse(res);
}

export async function login(credentials) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials), // { username, password }
  });
  return handleResponse(res); // returns { token }
}

// ---------- Sessions ----------
export async function getSessions(filters = {}) {
  // filters: { module: "...", date: "YYYY-MM-DD" }
  const params = new URLSearchParams();
  if (filters.module) params.set("module", filters.module);
  if (filters.date) params.set("date", filters.date);

  const qs = params.toString();
  const res = await fetch(`${API_URL}/sessions${qs ? `?${qs}` : ""}`);
  return handleResponse(res);
}

export async function getSessionDetails(id) {
  const res = await fetch(`${API_URL}/sessions/${id}`);
  return handleResponse(res); // { session, participants }
}

export async function createSession(session) {
  // { title, module, venue, datetime, capacity }
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(session),
  });
  return handleResponse(res);
}

export async function updateSession(id, session) {
  const res = await fetch(`${API_URL}/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(session),
  });
  return handleResponse(res);
}

export async function deleteSession(id) {
  const res = await fetch(`${API_URL}/sessions/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function completeSession(id) {
  const res = await fetch(`${API_URL}/sessions/${id}/complete`, {
    method: "PUT",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ---------- Join / Leave ----------
export async function joinSession(id) {
  const res = await fetch(`${API_URL}/sessions/${id}/join`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function leaveSession(id) {
  const res = await fetch(`${API_URL}/sessions/${id}/leave`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ---------- My Joined Sessions ----------
export async function getMySessions() {
  const res = await fetch(`${API_URL}/me/sessions`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}
