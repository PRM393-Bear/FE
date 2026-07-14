/**
 * EcoCycle – Site Header Component (Figma V2)
 * Renders a sticky navigation header with the official logo + search bar + cart badge.
 */

import "./header.css";
import {
  isAuthenticated,
  getUser,
  logoutApi,
} from "../services/auth.service.js";
import { getCart } from "../services/cart.service.js";

async function updateCartBadge() {
  if (!isAuthenticated()) return;
  const badgeEl = document.getElementById("header-cart-badge");
  if (!badgeEl) return;
  try {
    const cart = await getCart();
    const count = cart?.items?.length || 0;
    if (count > 0) {
      badgeEl.textContent = count > 99 ? "99+" : count;
      badgeEl.classList.remove("hidden");
      badgeEl.style.display = "inline-flex";
    } else {
      badgeEl.classList.add("hidden");
      badgeEl.style.display = "none";
    }
  } catch (e) {
    console.warn("Badge cart fetch error:", e);
  }
}

/**
 * Inject the header as the first child of <body>.
 * Call once per page render.
 *
 * @param {object} [opts]
 * @param {string} [opts.activePage] - 'home' | 'explore' | 'donate' | 'cart' | 'profile'
 */
export function renderHeader(opts = {}) {
  const existing = document.getElementById("site-header");
  if (existing) existing.remove();

  const authenticated = isAuthenticated();
  const user = getUser();
  const isPendingOrg = authenticated && (user?.role === "organization" || user?.role === "org") && (user?.status === "pending" || user?.status === "rejected");

  const header = document.createElement("header");
  header.id = "site-header";
  header.className = "site-header";
  header.setAttribute("role", "banner");

  header.innerHTML = `
    <!-- Left: Logo & Search -->
    <div class="site-header__left">
      <a href="${isPendingOrg ? '#/pending-approval' : '#/'}" class="site-header__brand" aria-label="EcoCycle">
        <img src="/logo.svg" alt="EcoCycle logo" class="site-header__logo" />
        <span>EcoCycle</span>
      </a>
      
      ${!isPendingOrg ? `
      <div class="site-header__search">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Tìm kiếm sản phẩm, người bán..." />
      </div>
      ` : `
      <div style="display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.1);color:#D97706;font-size:13px;font-weight:600;border:1px solid rgba(245,158,11,0.2);margin-left:8px;">
        ${user?.status === "rejected" ? 'Từ Chối Xét Duyệt' : 'Tổ Chức • Chờ Xét Duyệt'}
      </div>
      `}
    </div>

    <!-- Right: Nav & Auth -->
    <div class="site-header__right">
      ${!isPendingOrg ? `
      <nav class="site-header__nav">
        <a href="#/" class="site-header__nav-link ${opts.activePage === 'home' || !opts.activePage ? 'is-active' : ''}">Trang chủ</a>
        <a href="#/products" class="site-header__nav-link ${opts.activePage === 'products' || opts.activePage === 'explore' ? 'is-active' : ''}">Khám phá</a>
        <a href="#/donate" class="site-header__nav-link ${opts.activePage === 'donate' ? 'is-active' : ''}">Quyên góp</a>
      </nav>
      ` : ''}

      <div class="site-header__actions">
        ${authenticated ? `
          ${!isPendingOrg ? `
          <button class="site-header__icon-btn" title="Thông báo"><span class="material-symbols-outlined">notifications</span></button>
          <a href="#/cart" class="site-header__icon-btn relative ${opts.activePage === 'cart' ? 'bg-surface-variant text-primary' : ''}" title="Giỏ hàng">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span id="header-cart-badge" class="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[11px] font-bold w-5 h-5 rounded-full hidden items-center justify-center border-2 border-surface shadow-sm">0</span>
          </a>
          ` : ''}
          
          <div class="site-header__user-dropdown">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrlaW40yOoCWpNiBstKzrHVSAW72kTTU7p7v-pQe_rDsKJlX4PUBigCH7nF9WKXRK45Hq6mv2ZViHgaMBqK_PzLjMsrJQtoQ7WPS8GcEarFolyXAqS7jbNSdJlJcUyBz0_sENDF3UKiHJHXNm6vDX5pGfiZ8hjHKTp5MmI7N_p6LIdCDQXHfQKbP1-icv_i8Xmu9xMsG4F9g8qj582KVvK_iG9i5t-tv9IOPrLI1X22ZoC-_ytAYpEbfSxleQikMrt6CY9cmPiUP2J" alt="User profile" class="site-header__avatar" />
            
            <div class="site-header__dropdown-menu">
              ${!isPendingOrg ? '<a href="#/profile" class="site-header__dropdown-item">Tài Khoản Của Tôi</a>' : ''}
              ${user?.role === 'admin' ? '<a href="#/admin" class="site-header__dropdown-item">Trang Quản Trị</a>' : ''}
              ${user?.role === 'staff' ? '<a href="#/staff" class="site-header__dropdown-item font-bold text-primary">Khu Vực Staff</a>' : ''}
              <button class="site-header__dropdown-item" id="header-logout-btn">Đăng Xuất</button>
            </div>
          </div>
        ` : `
          <a href="#/login" class="site-header__btn-ghost">Đăng nhập</a>
          <a href="#/register" class="site-header__btn-primary">Đăng ký</a>
        `}
      </div>
    </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);

  if (authenticated) {
    updateCartBadge();
  }

  // Logout listener
  document.getElementById("header-logout-btn")?.addEventListener("click", async () => {
    await logoutApi();
    window.location.hash = "#/login";
  });

  // Brand click listener to scroll to top if already home
  header.querySelector(".site-header__brand")?.addEventListener("click", (e) => {
    if (window.location.hash === "#/" || window.location.hash === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Search input keydown listener
  const searchInput = header.querySelector(".site-header__search input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        window.location.hash = `#/products?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
}

// Global listen for cart updates across pages
window.addEventListener("ecocycle:cart-updated", () => {
  updateCartBadge();
});
