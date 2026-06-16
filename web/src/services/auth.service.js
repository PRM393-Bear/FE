/**
 * EcoCycle – Auth API Service
 * Synchronized with mobile API endpoints
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "ecocycle_token";
const USER_KEY = "ecocycle_user";

/* ── Token helpers ── */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getUserIdFromToken() {
  const token = getToken();
  if (!token) {
    console.warn("getUserIdFromToken: No token found in localStorage");
    return null;
  }
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      console.warn("getUserIdFromToken: Token is not a valid JWT (missing payload part):", token);
      return null;
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    console.log("getUserIdFromToken: Decoded token payload:", payload);
    return payload.userId || null;
  } catch (e) {
    console.error("Failed to extract userId from token:", e, "Token:", token);
    return null;
  }
}
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export function isAuthenticated() {
  return !!getToken();
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

/* ── Internal fetch helper ── */
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

/* ── Login ── */
export async function loginApi({ username, password, rememberMe = false }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (data?.token) saveToken(data.token);
  if (data?.username)
    saveUser({
      username: data.username,
      role: data.role?.roleName || "member",
    });

  return data;
}

/* ── Register ── */
export async function registerApi({
  fullName,
  username,
  email,
  phone,
  password,
}) {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, fullName, email, phone, password }),
  });

  if (data?.token) saveToken(data.token);
  if (data?.username)
    saveUser({
      username: data.username,
      role: data.role?.roleName || "member",
    });

  return data;
}

/* ── Logout ── */
export async function logoutApi() {
  try {
    // Best-effort server-side logout (invalidate token)
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (_) {
    // Even if server call fails, clear local state
  } finally {
    removeToken();
  }
}
