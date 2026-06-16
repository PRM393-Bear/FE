/**
 * EcoCycle – Site Header Component (Figma V2)
 * Renders a sticky navigation header with the official logo + search bar.
 */

import "./header.css";
import {
  isAuthenticated,
  getUser,
  logoutApi,
} from "../services/auth.service.js";

/**
 * Inject the header as the first child of <body>.
 * Call once per page render.
 *
 * @param {object} [opts]
 * @param {string} [opts.activePage] - 'home' | 'explore' | 'donate'
 */
export function renderHeader(opts = {}) {
  const existing = document.getElementById("site-header");
  if (existing) existing.remove();

  const authenticated = isAuthenticated();
  const user = getUser();

  const header = document.createElement("header");
  header.id = "site-header";
  header.className = "site-header";
  header.setAttribute("role", "banner");

  header.innerHTML = `
    <!-- Left: Logo & Search -->
    <div class="site-header__left">
      <a href="#/" class="site-header__brand" aria-label="EcoCycle – Trang chủ">
        <img src="/logo.svg" alt="EcoCycle logo" class="site-header__logo" />
        <span>EcoCycle</span>
      </a>
      
      <div class="site-header__search">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Tìm kiếm sản phẩm, người bán..." />
      </div>
    </div>

    <!-- Right: Nav & Auth -->
    <div class="site-header__right">
      <nav class="site-header__nav">
        <a href="#/" class="site-header__nav-link ${opts.activePage === 'home' || !opts.activePage ? 'is-active' : ''}">Trang chủ</a>
        <a href="#/explore" class="site-header__nav-link ${opts.activePage === 'explore' ? 'is-active' : ''}">Khám phá</a>
        <a href="#/donate" class="site-header__nav-link ${opts.activePage === 'donate' ? 'is-active' : ''}">Quyên góp</a>
      </nav>

      <div class="site-header__actions">
        ${authenticated ? `
          <button class="site-header__icon-btn"><span class="material-symbols-outlined">notifications</span></button>
          <button class="site-header__icon-btn"><span class="material-symbols-outlined">shopping_cart</span></button>
          
          <div class="site-header__user-dropdown">
            <!-- Fixed default profile image or dynamic initial -->
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrlaW40yOoCWpNiBstKzrHVSAW72kTTU7p7v-pQe_rDsKJlX4PUBigCH7nF9WKXRK45Hq6mv2ZViHgaMBqK_PzLjMsrJQtoQ7WPS8GcEarFolyXAqS7jbNSdJlJcUyBz0_sENDF3UKiHJHXNm6vDX5pGfiZ8hjHKTp5MmI7N_p6LIdCDQXHfQKbP1-icv_i8Xmu9xMsG4F9g8qj582KVvK_iG9i5t-tv9IOPrLI1X22ZoC-_ytAYpEbfSxleQikMrt6CY9cmPiUP2J" alt="User profile" class="site-header__avatar" />
            
            <div class="site-header__dropdown-menu">
              <a href="#/profile" class="site-header__dropdown-item">Tài Khoản Của Tôi</a>
              ${user?.role === 'admin' ? '<a href="#/admin" class="site-header__dropdown-item">Trang Quản Trị</a>' : ''}
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

  // Logout listener
  document.getElementById("header-logout-btn")?.addEventListener("click", async () => {
    await logoutApi();
    window.location.hash = "#/login";
  });
}
