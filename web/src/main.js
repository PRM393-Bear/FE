/**
 * EcoCycle Web – SPA Router
 * Hash-based routing: #/login | #/register | #/logout | #/profile | #/dashboard
 */

import { renderLoginPage    } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderProfilePage  } from './pages/profile.js';
import { renderHomePage     } from './pages/home.js';
import { renderProductsPage } from './pages/products.js';
import { renderProductDetailPage } from './pages/product-detail.js';
import { renderAdminPage } from './pages/admin.js';
import { renderHeader       } from './components/header.js';
import { renderFooter       } from './components/footer.js';
import { logoutApi, isAuthenticated } from './services/auth.service.js';

const app = document.getElementById('app');

const routes = {
  '#/login':    () => { renderHeader({ activePage: 'login'    }); renderLoginPage(app);    removeFooter(); },
  '#/register': () => { renderHeader({ activePage: 'register' }); renderRegisterPage(app); removeFooter(); },
  '#/profile':  () => { renderHeader({ activePage: 'profile'  }); renderProfilePage(app);  renderFooter(); },
  '#/products': () => { renderHeader({ activePage: 'products' }); renderProductsPage(app); renderFooter(); },
  '#/admin':    () => { removeHeader(); renderAdminPage(app); removeFooter(); },
  '#/logout':   handleLogout,
  '#/':         handleHome,
  '':           handleHome,
};

/* ── Home handler ── */
function handleHome() {
  renderHeader({ activePage: 'home' });
  renderHomePage(app);
  renderFooter();
}

function removeFooter() {
  const existing = document.getElementById('site-footer');
  if (existing) existing.remove();
}

function removeHeader() {
  const existing = document.getElementById('site-header');
  if (existing) existing.remove();
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

/* ── Dashboard placeholder (removed) ── */

/* ── Router ── */
function navigate() {
  const hash   = window.location.hash || '';
  // strip query params from hash if any
  const route  = hash.split('?')[0];
  
  // Dynamic Route for Product Detail
  if (route.startsWith('#/product/')) {
    const productId = route.replace('#/product/', '');
    if (productId) {
      renderHeader({ activePage: 'products' });
      renderProductDetailPage(app, productId);
      renderFooter();
      return;
    }
  }

  const handler = routes[route] ?? routes['#/'];
  handler();
}

/* ── Init ── */
window.addEventListener('hashchange', navigate);
navigate(); // Initial render on page load
