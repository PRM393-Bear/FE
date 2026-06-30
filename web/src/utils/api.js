/**
 * EcoCycle - Global API Fetch Utility
 */
import { getToken, refreshTokenApi, removeToken } from "../services/auth.service.js";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function apiFetch(path, options = {}, _isRetry = false) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Tự động làm mới token nếu gặp 401
  if (res.status === 401 && !_isRetry && !path.includes("/api/auth/")) {
    const newToken = await refreshTokenApi();
    if (newToken) {
      return await apiFetch(path, options, true);
    } else {
      removeToken();
      if (window.location.hash !== "#/login") {
        window.location.hash = "#/login";
      }
    }
  }

  // Parse body regardless of status
  let body = null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    const message =
      (typeof body === "object" && body?.message) ||
      (typeof body === "string" && body) ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
