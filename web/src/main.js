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
import { renderCartPage } from "./pages/cart.js";
import { renderStaffDashboard } from "./pages/staff/index.js";
import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { logoutApi, isAuthenticated, getUser, refreshUserOrgStatus } from "./services/auth.service.js";
import { initChat } from "./components/chat.js";

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
  "#/cart": () => {
    if (!isAuthenticated()) {
      window.location.hash = "#/login";
      return;
    }
    renderHeader({ activePage: "cart" });
    currentCleanup = renderCartPage(app);
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
  "#/edit-listing": () => {
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
    const u = getUser();
    if (!u || u.role !== "admin") {
      window.location.hash = u?.role === "staff" ? "#/staff" : "#/";
      return;
    }
    removeHeader();
    currentCleanup = renderAdminPage(app);
    removeFooter();
  },
  "#/staff": () => {
    if (!isAuthenticated()) {
      window.location.hash = "#/login";
      return;
    }
    const u = getUser();
    if (!u || (u.role !== "staff" && u.role !== "admin")) {
      window.location.hash = "#/";
      return;
    }
    removeHeader();
    currentCleanup = renderStaffDashboard(app);
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
  const u = getUser();
  if (isAuthenticated() && u?.role === "admin") {
    window.location.hash = "#/admin";
    return;
  }
  if (isAuthenticated() && u?.role === "staff") {
    window.location.hash = "#/staff";
    return;
  }
  if (isAuthenticated() && (u?.role === "organization" || u?.role === "org") && (u?.status === "pending" || u?.status === "rejected")) {
    window.location.hash = "#/pending-approval";
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

  // Check Admin / Staff / Organization redirection away from unauthorized pages
  if (isAuthenticated()) {
    const user = getUser();
    if (user?.role === "admin" && (route === "#/" || route === "" || route === "#/home")) {
      window.location.hash = "#/admin";
      return;
    }
    if (user?.role === "staff" && (route === "#/" || route === "" || route === "#/home")) {
      window.location.hash = "#/staff";
      return;
    }
    // Check Organization pending status restriction
    if ((user?.role === "organization" || user?.role === "org") && user?.status === "pending") {
      if (route !== "#/pending-approval" && route !== "#/logout" && route !== "#/register-organization") {
        window.location.hash = "#/pending-approval";
        return;
      }
    }
    // Check Organization rejected status restriction
    if ((user?.role === "organization" || user?.role === "org") && user?.status === "rejected") {
      if (route !== "#/pending-approval" && route !== "#/logout") {
        window.location.hash = "#/pending-approval";
        return;
      }
    }
    // Asynchronously refresh org status if sitting on pending-approval
    if ((user?.role === "organization" || user?.role === "org") && route === "#/pending-approval") {
      refreshUserOrgStatus().catch(() => {});
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
      initChat();
      return;
    }
  }

  const handler = routes[route] ?? routes["#/"];
  handler();
  initChat();
}

/* ── Init ── */
window.addEventListener("hashchange", navigate);
navigate(); // Initial render on page load
