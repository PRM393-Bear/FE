/**
 * EcoCycle Web - Admin API Service
 * Handles API calls for the admin dashboard.
 */

import { getToken } from "./auth.service.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body = null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("ecocycle_token");
      localStorage.removeItem("ecocycle_user");
      window.location.hash = "#/login";
    }
    throw new Error(body?.message || `HTTP ${res.status}`);
  }

  return body;
}

export async function getAllUsers() {
  try {
    return await apiFetch("/api/user/all");
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getAllDonationRequests() {
  try {
    return await apiFetch("/api/donation-requests/lists");
  } catch (error) {
    console.error("Failed to fetch donation requests:", error);
    return [];
  }
}
