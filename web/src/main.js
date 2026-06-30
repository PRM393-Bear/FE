/**
 * EcoCycle Web – SPA Router
 * Hash-based routing: #/login | #/register | #/logout | #/profile | #/dashboard
 */

import "./styles/global.css";

import { renderLoginPage } from "./pages/login.js";
import { renderRegisterPage } from "./pages/register.js";
import { renderRegisterSelectionPage } from "./pages/register-selection.js";
import { renderRegisterOrgPage } from "./pages/register-org.js";
import { renderForgotPasswordPage } from "./pages/forgot-password.js";
import { renderProfilePage } from "./pages/profile.js";
import { renderHomePage } from "./pages/home.js";
import { renderProductsPage } from "./pages/products.js";
import { renderProductDetailPage } from "./pages/product-detail.js";
import { renderAdminPage } from "./pages/admin/index.js";
import { renderCreateListingPage } from "./pages/create-listing.js";
import { renderPendingApprovalPage } from "./pages/pending-approval.js";
import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { logoutApi, isAuthenticated, getUser } from "./services/auth.service.js";

const app = document.getElementById("app");

let currentCleanup = null;

const routes = {
  "#/login": () => {
    renderHeader({ activePage: "login" });
    currentCleanup = renderLoginPage(app);
    removeFooter();
  },
  "#/register": () => {
    renderHeader({ activePage: "register" });
    currentCleanup = renderRegisterSelectionPage(app);
    removeFooter();
  },
  "#/register-member": () => {
    renderHeader({ activePage: "register" });
    currentCleanup = renderRegisterPage(app);
    removeFooter();
  },
  "#/register-organization": () => {
    renderHeader({ activePage: "register" });
    currentCleanup = renderRegisterOrgPage(app);
    removeFooter();
  },
  "#/forgot-password": () => {
    renderHeader({ activePage: "login" });
    currentCleanup = renderForgotPasswordPage(app);
    removeFooter();
  },
  "#/profile": () => {
    renderHeader({ activePage: "profile" });
    currentCleanup = renderProfilePage(app);
    renderFooter();
  },
  "#/products": () => {
    renderHeader({ activePage: "products" });
    currentCleanup = renderProductsPage(app);
    renderFooter();
  },
  "#/create-listing": () => {
    if (!isAuthenticated()) {
      window.location.hash = "#/login";
      return;
    }
    renderHeader({ activePage: "" });
    currentCleanup = renderCreateListingPage(app);
    renderFooter();
  },
  "#/admin": () => {
    if (!isAuthenticated()) {
      window.location.hash = "#/login";
      return;
    }
    removeHeader();
    currentCleanup = renderAdminPage(app);
    removeFooter();
  },
  "#/pending-approval": () => {
    renderHeader({ activePage: "" });
    currentCleanup = renderPendingApprovalPage(app);
    renderFooter();
  },
  "#/logout": handleLogout,
  "#/": handleHome,
  "": handleHome,
};

/* ── Home handler ── */
function handleHome() {
  if (isAuthenticated() && getUser()?.role === "admin") {
    window.location.hash = "#/admin";
    return;
  }
  renderHeader({ activePage: "home" });
  currentCleanup = renderHomePage(app);
  renderFooter();
}

function removeFooter() {
  const existing = document.getElementById("site-footer");
  if (existing) existing.remove();
}

function removeHeader() {
  const existing = document.getElementById("site-header");
  if (existing) existing.remove();
}

/* ── Logout handler ── */
async function handleLogout() {
  renderHeader({ activePage: "" });
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
    window.location.hash = "#/login";
  }
}

/* ── Dashboard placeholder (removed) ── */

/* ── Router ── */
function navigate() {
  const hash = window.location.hash || "";
  // strip query params from hash if any
  const route = hash.split("?")[0];

  // Run cleanup of previous page if any
  if (currentCleanup && typeof currentCleanup === "function") {
    try {
      currentCleanup();
    } catch (e) {
      console.warn("Error during page cleanup:", e);
    }
    currentCleanup = null;
  }

  // Check Admin redirection away from Home
  if (isAuthenticated()) {
    const user = getUser();
    if (user?.role === "admin" && (route === "#/" || route === "" || route === "#/home")) {
      window.location.hash = "#/admin";
      return;
    }
  }

  // Scroll to top on navigation
  window.scrollTo(0, 0);

  // Dynamic Route for Product Detail
  if (route.startsWith("#/product/")) {
    const productId = route.replace("#/product/", "");
    if (productId) {
      renderHeader({ activePage: "products" });
      currentCleanup = renderProductDetailPage(app, productId);
      renderFooter();
      return;
    }
  }

  const handler = routes[route] ?? routes["#/"];
  handler();
}

/* ── Init ── */
window.addEventListener("hashchange", navigate);
navigate(); // Initial render on page load
