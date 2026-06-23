/**
 * EcoCycle – Auth API Service
 * Synchronized with mobile API endpoints
 */

import { apiFetch, BASE_URL } from "../utils/api.js";

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

/* ── Internal fetch helper extracted to api.js ── */

/* ── Login ── */
export async function loginApi({ username, password, rememberMe = false }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const token = data?.accessToken || data?.token;
  if (token) saveToken(token);
  
  if (data?.username) {
    saveUser({
      username: data.username,
      role: data.role?.roleName || "member",
    });
  }

  return data;
}

/* ── Register ── */
export async function registerApi({
  fullName,
  username,
  email,
  phone,
  password,
  roleName,
}) {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, fullName, email, phone, password, roleName }),
  });

  const token = data?.accessToken || data?.token;
  if (token) saveToken(token);
  
  if (data?.username) {
    saveUser({
      username: data.username,
      role: data.role?.roleName || "member",
    });
  }

  return data;
}

/* ── Forgot Password ── */
export async function sendForgotPasswordOtp(email) {
  return apiFetch(
    `/api/user/forgot-password/send-otp?email=${encodeURIComponent(email)}`,
    { method: "POST" }
  );
}

export async function verifyForgotPasswordOtp(email, otp) {
  return apiFetch(
    `/api/user/forgot-password/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
    { method: "POST" }
  );
}

export async function verifyRegisterOtp(email, otp) {
  return apiFetch(
    `/api/user/forgot-password/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&otpPurpose=REGISTER`,
    { method: "POST" }
  );
}

export async function resetPasswordApi(resetToken, newPassword, confirmPassword) {
  const params = new URLSearchParams({ resetToken, newPassword, confirmPassword });
  return apiFetch(`/api/user/forgot-password/reset-password?${params}`, {
    method: "POST",
  });
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

/* ── Image Upload ── */
export async function uploadImageApi(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}/api/upload/image`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Không thể tải lên ảnh");
  }

  const data = await res.json();
  return data.url; // Cloudinary URL
}

/* ── Organization Detail ── */
export async function createOrganizationDetailApi(detail) {
  return apiFetch("/api/organization-details", {
    method: "POST",
    body: JSON.stringify(detail),
  });
}
