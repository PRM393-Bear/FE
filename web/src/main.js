/**
 * EcoCycle Web – SPA Router
 * Hash-based routing: #/login | #/register | #/logout | #/profile | #/dashboard
 */

import { renderLoginPage    } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderProfilePage  } from './pages/profile.js';
import { renderHeader       } from './components/header.js';
import { logoutApi, isAuthenticated } from './services/auth.service.js';

const app = document.getElementById('app');

/* ── Route definitions ── */
const routes = {
  '#/login':    () => { renderHeader({ activePage: 'login'    }); renderLoginPage(app);    },
  '#/register': () => { renderHeader({ activePage: 'register' }); renderRegisterPage(app); },
  '#/profile':  () => { renderHeader({ activePage: 'profile'  }); renderProfilePage(app);  },
  '#/logout':   handleLogout,
  '#/':         handleRoot,
  '':           handleRoot,
};

/* ── Root redirect ── */
function handleRoot() {
  if (isAuthenticated()) {
    renderHeader({ activePage: '' });
    renderDashboardPlaceholder();
  } else {
    window.location.hash = '#/login';
  }
}

/* ── Logout handler ── */
async function handleLogout() {
  renderHeader({ activePage: '' });
  app.innerHTML = `
    <div style="
      min-height:100dvh; display:flex; align-items:center; justify-content:center;
      background:#F0F5EF; font-family:'Be Vietnam Pro',sans-serif;
    ">
      <div style="text-align:center; color:#6E7B6C;">
        <div style="
          width:48px;height:48px;border:3px solid #DDE5DB;border-top-color:#006B2C;
          border-radius:50%;animation:spin 0.75s linear infinite;margin:0 auto 16px;
        "></div>
        <p>Đang đăng xuất…</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      </div>
    </div>
  `;
  try {
    await logoutApi();
  } finally {
    window.location.hash = '#/login';
  }
}

/* ── Dashboard placeholder (until BE dashboard page is built) ── */
function renderDashboardPlaceholder() {
  app.innerHTML = `
    <div style="
      min-height:100dvh; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:24px;
      background:#F0F5EF; font-family:'Be Vietnam Pro',sans-serif;
      padding:24px;
    ">
      <div style="
        background:#fff; border-radius:20px;
        box-shadow:0 4px 24px rgba(0,107,44,0.08);
        padding:48px 40px; text-align:center; max-width:400px; width:100%;
      ">
        <div style="
          width:64px;height:64px;border-radius:50%;
          background:rgba(0,107,44,0.08);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 20px;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#006B2C">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 1-3 8-3 8-3S19 4 17 8Z"/>
          </svg>
        </div>
        <h1 style="font-size:22px;font-weight:700;color:#1A1A1A;margin-bottom:8px;">
          Chào mừng trở lại! 🌿
        </h1>
        <p style="font-size:14px;color:#6E7B6C;margin-bottom:32px;">
          Bạn đã đăng nhập thành công vào EcoCycle.
        </p>
        <a
          href="#/logout"
          style="
            display:inline-flex;align-items:center;justify-content:center;
            width:100%;height:52px;border-radius:12px;
            background:linear-gradient(135deg,#006B2C,#004D1F);
            color:#fff;font-family:'Be Vietnam Pro',sans-serif;
            font-size:16px;font-weight:600;text-decoration:none;
            box-shadow:0 4px 14px rgba(0,107,44,0.3);
            transition:all 0.2s ease;
          "
          id="logout-btn"
        >
          Đăng xuất
        </a>
      </div>
    </div>
  `;
}

/* ── Router ── */
function navigate() {
  const hash   = window.location.hash || '';
  // strip query params from hash if any
  const route  = hash.split('?')[0];
  const handler = routes[route] ?? routes['#/'];
  handler();
}

/* ── Init ── */
window.addEventListener('hashchange', navigate);
navigate(); // Initial render on page load
