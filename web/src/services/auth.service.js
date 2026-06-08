/**
 * EcoCycle – Auth API Service
 * Synchronized with mobile API endpoints
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const TOKEN_KEY = 'ecocycle_token';
const USER_KEY  = 'ecocycle_user';

/* ── Token helpers ── */
export function saveToken(token)  { localStorage.setItem(TOKEN_KEY, token); }
export function getToken()        { return localStorage.getItem(TOKEN_KEY); }
export function removeToken()     { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
export function isAuthenticated() { return !!getToken(); }

export function saveUser(user)    { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function getUser()         {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
}

/* ── Internal fetch helper ── */
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse body regardless of status
  let body = null;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    const message =
      (typeof body === 'object' && body?.message) ||
      (typeof body === 'string' && body) ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

/* ── Login ── */
export async function loginApi({ email, password, rememberMe = false }) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });

  if (data?.token) saveToken(data.token);
  if (data?.user)  saveUser(data.user);

  return data;
}

/* ── Register ── */
export async function registerApi({ fullName, email, phone, password }) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, phone, password }),
  });

  return data;
}

/* ── Logout ── */
export async function logoutApi() {
  try {
    // Best-effort server-side logout (invalidate token)
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (_) {
    // Even if server call fails, clear local state
  } finally {
    removeToken();
  }
}
